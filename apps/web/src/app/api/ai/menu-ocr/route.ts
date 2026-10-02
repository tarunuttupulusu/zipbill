import { NextRequest, NextResponse } from 'next/server';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
  'gemini-2.5-flash',
];

function parseMenuTextFallback(rawText: string) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const categories: any[] = [];
  let currentCategory = { name: 'Main Menu', items: [] as any[] };

  for (const line of lines) {
    // Check if line looks like a category header (ends with colon or all-caps header)
    if (line.endsWith(':') || (!line.match(/\d+/) && line.length < 30 && line.toUpperCase() === line)) {
      if (currentCategory.items.length > 0) {
        categories.push(currentCategory);
      }
      currentCategory = { name: line.replace(/[:\-–—]/g, '').trim() || 'Specialties', items: [] };
      continue;
    }

    // Match dish and price (e.g. "Paneer Butter Masala - ₹280", "Chicken Tikka 340")
    const priceMatch =
      line.match(/(?:₹|Rs\.?|INR|\$)?\s*(\d+(?:\.\d{1,2})?)\s*$/i) ||
      line.match(/(?:₹|Rs\.?|INR|\$)\s*(\d+(?:\.\d{1,2})?)/i);

    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      const namePart = line
        .replace(priceMatch[0], '')
        .replace(/[-–—:.]+$/, '')
        .trim();

      const name = namePart || 'Menu Item';
      const isVeg =
        !name.toLowerCase().includes('chicken') &&
        !name.toLowerCase().includes('mutton') &&
        !name.toLowerCase().includes('fish') &&
        !name.toLowerCase().includes('egg') &&
        !name.toLowerCase().includes('prawn') &&
        !name.toLowerCase().includes('meat');

      currentCategory.items.push({
        name,
        description: '',
        price,
        foodType: isVeg ? 'VEG' : 'NON_VEG',
      });
    } else if (line.length > 2) {
      // Dish without explicit price
      currentCategory.items.push({
        name: line,
        description: '',
        price: 150,
        foodType: 'VEG',
      });
    }
  }

  if (currentCategory.items.length > 0) {
    categories.push(currentCategory);
  }

  return {
    categories: categories.length > 0 ? categories : [
      {
        name: 'General Menu',
        items: [{ name: 'Chef Special', description: 'Freshly prepared specialty dish', price: 200, foodType: 'VEG' }],
      },
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Support both menuText and rawText for full compatibility with onboarding and menu page
    const menuText = body.menuText || body.rawText || '';
    const { imageBase64, mimeType = 'image/jpeg' } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are an expert Restaurant Menu OCR and structuring engine.
Analyze the provided restaurant menu (text or image) and extract all categories and dishes.
Return ONLY valid JSON matching this schema, without markdown formatting or codeblocks:
{
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "name": "Dish Name",
          "description": "Short dish description or ingredients",
          "price": 250,
          "foodType": "VEG" | "NON_VEG" | "BEVERAGE"
        }
      ]
    }
  ]
}`;

    let contents: any[] = [];

    if (imageBase64) {
      // Clean base64 prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      contents = [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ];
    } else {
      contents = [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nHere is the raw printed menu text to extract:\n${menuText || 'No menu text provided'}`,
            },
          ],
        },
      ];
    }

    let parsedResult = null;
    let lastError = null;

    if (apiKey) {
      // Attempt candidate models with automatic failover if one is overloaded (503/429)
      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents,
                generationConfig: {
                  temperature: 0.1,
                  responseMimeType: 'application/json',
                },
              }),
            }
          );

          if (response.ok) {
            const geminiData = await response.json();
            const candidateText =
              geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

            try {
              parsedResult = JSON.parse(candidateText);
            } catch {
              const cleaned = candidateText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
              parsedResult = JSON.parse(cleaned);
            }

            if (parsedResult && parsedResult.categories) {
              break; // Success!
            }
          } else {
            const errText = await response.text();
            lastError = `Model ${model} returned ${response.status}: ${errText}`;
            console.warn(`[Gemini OCR] ${model} unavailable (status ${response.status}). Trying next candidate...`);
          }
        } catch (callErr: any) {
          lastError = callErr.message;
          console.warn(`[Gemini OCR] ${model} network error:`, callErr.message);
        }
      }
    }

    // If Gemini models succeeded, return the AI structured data
    if (parsedResult && parsedResult.categories && parsedResult.categories.length > 0) {
      return NextResponse.json({
        success: true,
        data: parsedResult,
        categories: parsedResult.categories,
      });
    }

    // If text was provided and all AI models were overloaded (e.g. 503), use smart rule-based fallback
    if (menuText && menuText.trim().length > 0) {
      console.warn('[Gemini OCR] AI models unavailable, employing structured text fallback parser.');
      const fallbackData = parseMenuTextFallback(menuText);
      return NextResponse.json({
        success: true,
        isFallback: true,
        data: fallbackData,
        categories: fallbackData.categories,
      });
    }

    // If only image was provided and AI models were unavailable
    return NextResponse.json(
      {
        error: 'Gemini AI service is temporarily experiencing high demand (503).',
        details: lastError || 'Please try again in a few moments, or paste text in the raw text box.',
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Menu OCR handler exception:', error);
    return NextResponse.json(
      { error: 'Failed to process menu with Gemini AI.', message: error.message },
      { status: 500 }
    );
  }
}
