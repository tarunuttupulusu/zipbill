import React from 'react';

interface ZipBillLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'badge';
  invert?: boolean;
}

export function ZipBillLogo({
  className = '',
  size = 'md',
  variant = 'full',
  invert = false,
}: ZipBillLogoProps) {
  const sizeMap = {
    sm: { height: 22, fontSize: 'text-base', subSize: 'text-[7.5px]', iconH: 18, iconW: 18 },
    md: { height: 30, fontSize: 'text-xl', subSize: 'text-[9.5px]', iconH: 24, iconW: 24 },
    lg: { height: 40, fontSize: 'text-2xl', subSize: 'text-[11px]', iconH: 30, iconW: 30 },
    xl: { height: 54, fontSize: 'text-4xl', subSize: 'text-[13px]', iconH: 40, iconW: 40 },
  };

  const currentSize = sizeMap[size];

  // Chef Hat & Plate Emblem SVG (Restaurant / Cafe / Hotel)
  const ChefHatPlateEmblem = ({
    width,
    height,
    color,
    className: svgClass = '',
  }: {
    width: number;
    height: number;
    color: string;
    className?: string;
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${svgClass}`}
    >
      {/* Chef Hat Toque (Three Puffs) */}
      <path
        d="M7 17.5C5.8 16.6 5 15.2 5 13.5C5 11 7 9 9.5 9C10.2 9 10.9 9.2 11.5 9.5C12.3 7.5 14 6 16 6C18.3 6 20.2 7.7 20.7 10C21.3 9.7 22 9.5 22.8 9.5C25 9.5 26.8 11.3 26.8 13.5C26.8 15 26 16.3 24.8 17.2"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hat Base Band */}
      <path
        d="M7.5 18H24.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Curved Plate / Serving Dish Rim */}
      <path
        d="M4 22.5C7 25.5 11 27 16 27C21 27 25 25.5 28 22.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-amber-500/30 p-2 shadow-sm ${className}`}
      >
        <ChefHatPlateEmblem
          width={28}
          height={28}
          color="#F59E0B"
          className="w-full h-full"
        />
      </div>
    );
  }

  const primaryColor = invert ? '#F59E0B' : '#D97706';

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="flex items-center space-x-2 leading-none">
        {/* Chef Hat & Plate Emblem placed on left side of Zip */}
        <ChefHatPlateEmblem
          width={currentSize.iconW}
          height={currentSize.iconH}
          color={primaryColor}
        />

        {/* Wordmark: ZipBill */}
        <div className="flex items-baseline font-black tracking-tight">
          <span
            className={`${currentSize.fontSize} font-extrabold ${
              invert ? 'text-white' : 'text-[#1E293B]'
            } tracking-tight font-sans`}
            style={{ letterSpacing: '-0.03em' }}
          >
            Zip
          </span>
          <span
            className={`${currentSize.fontSize} font-extrabold bg-gradient-to-r from-[#D97706] to-[#B45309] bg-clip-text text-transparent font-sans`}
            style={{ letterSpacing: '-0.02em' }}
          >
            Bill
          </span>
        </div>
      </div>

      {/* Subtitle tag */}
      {variant === 'full' && (
        <div
          className={`${currentSize.subSize} tracking-[0.22em] font-bold uppercase mt-1 ${
            invert ? 'text-slate-300' : 'text-[#64748B]'
          } pl-0.5`}
          style={{ letterSpacing: '0.22em' }}
        >
          Restaurant <span className="text-[#D97706] font-normal">|</span> Cafe{' '}
          <span className="text-[#D97706] font-normal">|</span> Hotel
        </div>
      )}
    </div>
  );
}

export default ZipBillLogo;
