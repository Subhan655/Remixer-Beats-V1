import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Sparkles } from 'lucide-react';
import { ScriptVariant } from '../types';

interface RemixTabProps {
  variants: ScriptVariant[];
  selectedVariantId?: string;
  onSelectVariant: (id: string) => void;
  onEditVariant: (id: string) => void;
  onRegenerateVariant: (id: string) => void;
  onDeleteVariant: (id: string) => void;
}

export const RemixTab: React.FC<RemixTabProps> = ({
  variants,
  selectedVariantId,
  onSelectVariant,
  onEditVariant,
  onRegenerateVariant,
  onDeleteVariant
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.querySelector('[data-remix-scroll]') as HTMLDivElement;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (variants.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-text-muted">
          <Sparkles size={48} className="opacity-20" />
          <div className="text-center">
            <p className="font-semibold text-text-main">No Remix Variants Yet</p>
            <p className="text-sm mt-1">Go to the Text Editor tab and click "Remix Script" to generate variations</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border bg-surface/10">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          Script Variations
        </h3>
        <p className="text-xs text-text-muted mt-1">Select your preferred script variation and customize if needed</p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className={`relative group rounded-xl border-2 transition-all ${
                selectedVariantId === variant.id
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border bg-surface/30 hover:border-primary/20'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {variant.isOriginal && (
                      <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded">ORIGINAL</span>
                    )}
                    {selectedVariantId === variant.id && (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">SELECTED</span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectVariant(variant.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedVariantId === variant.id
                        ? 'bg-primary text-white'
                        : 'bg-surface hover:bg-primary/20 text-text-main'
                    }`}
                  >
                    {selectedVariantId === variant.id ? 'Selected' : 'Select'}
                  </button>
                </div>

                <p className="text-sm text-text-main leading-relaxed line-clamp-4">{variant.content}</p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => onEditVariant(variant.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface hover:bg-white/10 text-text-muted hover:text-text-main rounded-lg text-xs transition"
                    title="Edit variant"
                  >
                    <Edit2 size={12} /> Edit
                  </button>

                  {!variant.isOriginal && (
                    <button
                      onClick={() => onRegenerateVariant(variant.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs transition"
                      title="Regenerate variant"
                    >
                      <Sparkles size={12} /> Regenerate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
