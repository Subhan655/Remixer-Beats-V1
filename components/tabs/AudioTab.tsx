import React from 'react';
import { Beat, LayoutMode } from '../../types';
import { ArrowRight, Play, Mic, Upload, Wand2, Music, Merge } from 'lucide-react';

interface AudioTabProps {
  beats: Beat[];
  onNext: () => void;
  handleGenerateVeo: (config: { resolution: '720p' | '1080p'; aspectRatio: '9:16' | '16:9'; avatarImage?: string }) => void;
  handleUploadARoll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isGeneratingVideo: boolean;
  aRollVideoUrl?: string;
}

export const AudioTab: React.FC<AudioTabProps> = ({
  beats,
  onNext,
  handleGenerateVeo,
  handleUploadARoll,
  isGeneratingVideo,
  aRollVideoUrl
}) => {
  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-text-main">Audio & A-Roll</h2>
          <p className="text-sm text-text-muted">Generate audio for your script and create the video base</p>
        </div>
        <button 
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-primary/20"
        >
          Go to Video Editor <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8">
        
        {/* Audio Generation Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
              <Music size={16} className="text-emerald-400" /> Audio Generation
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-text-main hover:bg-surface/80 transition">
                Generate All
              </button>
              <button className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-1">
                <Merge size={12} /> Merge Audio
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {beats.length > 0 ? beats.map((beat, index) => (
              <div key={beat.id} className="p-4 rounded-xl border border-border bg-surface/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-muted">{index + 1}</div>
                  <p className="text-sm text-text-main line-clamp-1">{beat.textSegment}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-surface rounded-full text-text-muted hover:text-primary transition">
                    <Play size={16} />
                  </button>
                  <button className="p-2 hover:bg-surface rounded-full text-text-muted hover:text-emerald-400 transition">
                    <Mic size={16} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center text-text-muted p-4">No beats available. Go back to Remix step.</div>
            )}
          </div>
        </div>

        <div className="h-px bg-border w-full" />

        {/* A-Roll Generation Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <Wand2 size={16} className="text-purple-400" /> A-Roll Video
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Generation */}
            <div className="p-6 rounded-xl border border-border bg-surface/30 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Wand2 size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">Generate with AI</h4>
                  <p className="text-xs text-text-muted">Create a professional avatar video</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1.5">Avatar</label>
                  <div className="h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-text-muted hover:border-primary/50 hover:bg-surface/50 transition cursor-pointer">
                    <Upload size={16} className="mb-1" />
                    <span className="text-[10px]">Upload Avatar Image</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-text-muted block mb-1.5">Aspect Ratio</label>
                    <select className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-main outline-none focus:border-primary/50">
                      <option value="9:16">Portrait (9:16)</option>
                      <option value="16:9">Landscape (16:9)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-muted block mb-1.5">Resolution</label>
                    <select className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-main outline-none focus:border-primary/50">
                      <option value="1080p">1080p</option>
                      <option value="720p">720p</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => handleGenerateVeo({ resolution: '1080p', aspectRatio: '9:16' })}
                  disabled={isGeneratingVideo}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingVideo ? 'Generating...' : 'Generate Video'}
                </button>
              </div>
            </div>

            {/* Manual Upload */}
            <div className="p-6 rounded-xl border border-border bg-surface/30 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Upload size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">Upload Video</h4>
                  <p className="text-xs text-text-muted">Use your own pre-recorded video</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <label className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-text-muted hover:border-primary/50 hover:bg-surface/50 transition cursor-pointer">
                  <Upload size={24} className="mb-2" />
                  <span className="text-xs font-medium">Click to upload video</span>
                  <span className="text-[10px] text-text-muted mt-1">MP4, WebM, MOV</span>
                  <input type="file" accept="video/*" onChange={handleUploadARoll} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
