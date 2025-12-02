import React from 'react';
import { ScriptBlock, Beat } from '../../types';
import { ArrowRight, Wand2, Edit2, Check } from 'lucide-react';

interface RemixTabProps {
  scriptBlocks: ScriptBlock[];
  beats: Beat[];
  onNext: () => void;
  isAnalyzing?: boolean;
}

export const RemixTab: React.FC<RemixTabProps> = ({
  scriptBlocks,
  beats,
  onNext,
  isAnalyzing
}) => {
  // Mock data for remix options
  const remixOptions = [
    { id: 'original', label: 'Original', description: 'The original script text' },
    { id: 'funny', label: 'Funny', description: 'Add some humor and jokes' },
    { id: 'professional', label: 'Professional', description: 'More formal and business-like' },
    { id: 'concise', label: 'Concise', description: 'Short and to the point' },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-text-main">Remix Script</h2>
          <p className="text-sm text-text-muted">Choose the best version for each beat of your script</p>
        </div>
        <button 
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-primary/20"
        >
          Go to Audio <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
        {isAnalyzing ? (
           <div className="flex flex-col items-center justify-center h-full text-text-muted gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p>Analyzing script and generating beats...</p>
           </div>
        ) : (
        /* Mock Beats Display */
        beats.length > 0 ? beats.map((beat, index) => (
          <div key={beat.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
              <span className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">{index + 1}</span>
              Beat {index + 1}
            </div>
            
            {/* Horizontal Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
              {remixOptions.map((option) => (
                <div 
                  key={option.id} 
                  className="min-w-[300px] max-w-[300px] p-4 rounded-xl border border-border bg-surface/50 hover:bg-surface hover:border-primary/30 transition cursor-pointer group snap-center flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{option.label}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-background rounded-md text-text-muted hover:text-text-main" title="Edit with AI">
                        <Wand2 size={12} />
                      </button>
                      <button className="p-1.5 hover:bg-background rounded-md text-text-muted hover:text-text-main" title="Manual Edit">
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-text-main leading-relaxed">
                    {beat.textSegment} 
                    {option.id !== 'original' && " (Remixed version would appear here...)"}
                  </p>

                  <div className="mt-auto pt-2 flex justify-end">
                    <button className="text-xs font-medium text-text-muted hover:text-primary flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                        <Check size={10} />
                      </div>
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
           <div className="flex flex-col items-center justify-center h-full text-text-muted">
             <p>No beats generated. Please check your script.</p>
           </div>
        )
        )}
      </div>
    </div>
  );
};
