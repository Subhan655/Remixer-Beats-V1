import React from 'react';
import { Music, Upload, Trash2, CheckCircle, Wand2, Merge, FileAudio, Video } from 'lucide-react';
import { AudioClip } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { GenerateVideoModal } from './GenerateVideoModal';

interface AudioTabProps {
  audioClips: AudioClip[];
  selectedAudioIds: string[];
  onAudioSelect: (id: string) => void;
  onDeleteAudio: (id: string) => void;
  onMergeAudio: () => void;
  aRollVideoUrl?: string;
  isGeneratingVideo: boolean;
  isAnalyzing: boolean;
  onUploadARoll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveARoll: () => void;
  onGenerateVideo: (config: { resolution: '720p' | '1080p'; aspectRatio: '9:16' | '16:9'; avatarImage?: string }) => void;
  onGenerateVideoModalOpen: () => void;
  isGenerateModalOpen: boolean;
  onGenerateModalClose: () => void;
}

export const AudioTab: React.FC<AudioTabProps> = ({
  audioClips,
  selectedAudioIds,
  onAudioSelect,
  onDeleteAudio,
  onMergeAudio,
  aRollVideoUrl,
  isGeneratingVideo,
  isAnalyzing,
  onUploadARoll,
  onRemoveARoll,
  onGenerateVideoModalOpen,
  isGenerateModalOpen,
  onGenerateModalClose,
  onGenerateVideo
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <GenerateVideoModal
        isOpen={isGenerateModalOpen}
        onClose={onGenerateModalClose}
        onGenerate={onGenerateVideo}
      />

      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
              <Music size={16} className="text-emerald-400" />
              Audio Clips
            </h3>
            {selectedAudioIds.length >= 2 && (
              <button
                onClick={onMergeAudio}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition"
              >
                <Merge size={12} /> Merge
              </button>
            )}
          </div>

          <div className="min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar rounded-xl border border-border bg-background/50 p-2 space-y-1">
            {audioClips.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted gap-2 p-4">
                <FileAudio size={32} className="opacity-20" />
                <span className="text-xs text-center">No audio clips generated yet. Go to Text Editor and generate audio.</span>
              </div>
            ) : (
              audioClips.map((clip) => (
                <div key={clip.id} className="relative group/audio">
                  <div
                    onClick={() => onAudioSelect(clip.id)}
                    className={`absolute left-0 top-0 bottom-2 w-1 rounded-l-xl z-10 cursor-pointer transition-colors ${
                      selectedAudioIds.includes(clip.id)
                        ? 'bg-emerald-500'
                        : 'bg-transparent hover:bg-emerald-500/30'
                    }`}
                  />
                  <div className={`${selectedAudioIds.includes(clip.id) ? 'bg-emerald-500/5' : ''}`}>
                    <AudioPlayer
                      src={clip.audioUrl}
                      label={clip.text}
                      onDelete={() => onDeleteAudio(clip.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <Video size={16} className="text-purple-400" />
            A-Roll Video
          </h3>

          {aRollVideoUrl ? (
            <div className="glass-card rounded-xl p-3 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 px-2 py-1.5 rounded-lg border border-emerald-500/10">
                <CheckCircle size={12} /> Source Active
              </div>
              <div className="flex gap-2">
                <label className="flex-1 py-1.5 glass-button rounded-lg text-[10px] font-medium flex items-center justify-center gap-1.5 cursor-pointer text-text-muted hover:text-text-main">
                  <Upload size={12} /> Replace
                  <input
                    type="file"
                    accept="video/*"
                    onChange={onUploadARoll}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={onRemoveARoll}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/10 rounded-lg text-[10px] transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onGenerateVideoModalOpen}
                disabled={isGeneratingVideo || audioClips.length === 0}
                className="h-16 rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 flex flex-col items-center justify-center gap-1 text-purple-200 hover:text-white hover:border-purple-500/40 hover:from-purple-900/60 hover:to-indigo-900/60 transition group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 size={16} className={`mb-0.5 ${isGeneratingVideo ? 'animate-spin' : 'group-hover:scale-110 transition'}`} />
                <span className="text-[9px] font-bold uppercase tracking-wide">Generate</span>
              </button>

              <label className="h-16 rounded-xl bg-surface/50 border border-border flex flex-col items-center justify-center gap-1 text-text-muted hover:text-text-main hover:bg-surface hover:border-primary/20 transition cursor-pointer group">
                <Upload size={16} className="mb-0.5 group-hover:-translate-y-0.5 transition" />
                <span className="text-[9px] font-bold uppercase tracking-wide">Upload</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={onUploadARoll}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
