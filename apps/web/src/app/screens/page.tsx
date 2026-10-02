'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SCREENS, PHASES } from '@/lib/screens-data';
import { LayoutGrid, Search, ArrowRight, Sparkles, Filter, Layers } from 'lucide-react';

export default function ScreensDirectoryPage() {
  const [search, setSearch] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<number | 'ALL'>('ALL');

  const filteredScreens = SCREENS.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search);
    const matchesPhase = selectedPhase === 'ALL' || s.phaseId === selectedPhase;
    return matchesSearch && matchesPhase;
  });

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Complete Architecture Gallery</span>
          </div>
          <h1 className="text-3xl font-extrabold text-heading tracking-tight">
            Platform Screen Directory
          </h1>
          <p className="text-sm text-secondary mt-1">
            Browse and preview all 52 architectural screens across every platform phase.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/screens/01"
            className="btn-primary text-xs px-4 py-2.5 flex items-center space-x-2 font-semibold shadow-button hover:shadow-button-hover"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Screen Viewer</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedPhase('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              selectedPhase === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surfaceMuted text-secondary hover:text-heading'
            }`}
          >
            All Screens ({SCREENS.length})
          </button>
          {PHASES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPhase(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                selectedPhase === p.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surfaceMuted text-secondary hover:text-heading'
              }`}
            >
              {p.name.split('—')[0]}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search screens by name or #..."
            className="input-field pl-10 text-xs py-2"
          />
        </div>
      </div>

      {/* Screens Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredScreens.map((screen) => (
          <Link
            key={screen.id}
            href={`/screens/${screen.id}`}
            className="card p-5 group hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surfaceMuted border border-border text-primary group-hover:bg-primary group-hover:text-white transition">
                  #{screen.id}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-50 text-orange-700">
                  {screen.category}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-heading group-hover:text-primary transition line-clamp-1">
                  {screen.title}
                </h3>
                <p className="text-xs text-secondary mt-1 line-clamp-2 leading-relaxed">
                  {screen.description}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-secondary group-hover:text-primary transition font-medium">
              <span>Preview Screen</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
