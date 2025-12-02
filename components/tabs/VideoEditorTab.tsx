import React from 'react';
import { VideoComposer } from '../VideoComposer';
import { Timeline } from '../Timeline';
import { Beat, LayoutMode, VideoComment, StyleSettings } from '../../types';
import { Video, Layers } from 'lucide-react';

interface VideoEditorTabProps {
  aRollVideoUrl?: string;
  beats: Beat[];
  layoutMode: LayoutMode;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  videoComments: VideoComment[];
  videoRef: React.RefObject<HTMLVideoElement>;
  handleTogglePlay: () => void;
  handleVideoTimeUpdate: (time: number) => void;
  handleVideoDurationChange: (dur: number) => void;
  handleVideoEnded: () => void;
  handleSeek: (time: number) => void;
  handleScrubStart: () => void;
  handleScrubEnd: () => void;
  handleAddVideoComment: (timestamp: number, text: string) => void;
  handleDeleteVideoComment: (id: string) => void;
  handleReplyVideoComment: (commentId: string, text: string) => void;
  handleResolveVideoComment: (id: string) => void;
  updateBeat: (beatId: string, updates: Partial<Beat>) => void;
  handleRegenerateImage: (beat: Beat) => void;
  handleUploadImage: (beatId: string, file: File) => void;
  handleSplitBeat: (beatId: string, startIdx: number, endIdx: number) => void;
  handleMergeBeats: (beatIds: string[]) => void;
  handleGenerateImageFromPrompt: (beatId: string, prompt: string) => void;
  handleSelectImage: (beatId: string, imageUrl: string) => void;
  styleSettings: StyleSettings;
  updateStyleSettings: (settings: Partial<StyleSettings>) => void;
  handleBulkGenerate: () => void;
  isAnalyzing: boolean;
  setLayoutMode: (mode: LayoutMode) => void;
}

export const VideoEditorTab: React.FC<VideoEditorTabProps> = ({
  aRollVideoUrl,
  beats,
  layoutMode,
  currentTime,
  duration,
  isPlaying,
  videoComments,
  videoRef,
  handleTogglePlay,
  handleVideoTimeUpdate,
  handleVideoDurationChange,
  handleVideoEnded,
  handleSeek,
  handleScrubStart,
  handleScrubEnd,
  handleAddVideoComment,
  handleDeleteVideoComment,
  handleReplyVideoComment,
  handleResolveVideoComment,
  updateBeat,
  handleRegenerateImage,
  handleUploadImage,
  handleSplitBeat,
  handleMergeBeats,
  handleGenerateImageFromPrompt,
  handleSelectImage,
  styleSettings,
  updateStyleSettings,
  handleBulkGenerate,
  isAnalyzing,
  setLayoutMode
}) => {
  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      {/* COLUMN 2: PREVIEW (Fluid Width) */}
      <main className="flex-1 h-full relative flex flex-col bg-background/80 min-w-[300px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Preview Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 z-10 shrink-0">
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                REC VIEW
            </div>
            <div className="flex bg-surface rounded-lg p-0.5 border border-border">
                  <button 
                      onClick={() => setLayoutMode(LayoutMode.PORTRAIT)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${layoutMode === LayoutMode.PORTRAIT ? 'bg-text-main text-background shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                  >
                      9:16
                  </button>
                  <button 
                      onClick={() => setLayoutMode(LayoutMode.LANDSCAPE)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${layoutMode === LayoutMode.LANDSCAPE ? 'bg-text-main text-background shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                  >
                      16:9
                  </button>
            </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden relative">
            {aRollVideoUrl ? (
                <VideoComposer 
                    ref={videoRef}
                    aRollUrl={aRollVideoUrl}
                    beats={beats}
                    layoutMode={layoutMode}
                    currentTime={currentTime}
                    duration={duration}
                    isPlaying={isPlaying}
                    videoComments={videoComments}
                    onTogglePlay={handleTogglePlay}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onDurationChange={handleVideoDurationChange}
                    onEnded={handleVideoEnded}
                    onSeek={handleSeek}
                    onScrubStart={handleScrubStart}
                    onScrubEnd={handleScrubEnd}
                    onAddComment={handleAddVideoComment}
                    onDeleteComment={handleDeleteVideoComment}
                    onReplyComment={handleReplyVideoComment}
                    onResolveComment={handleResolveVideoComment}
                />
            ) : (
                <div className="aspect-[9/16] h-[60vh] bg-surface/50 flex flex-col items-center justify-center text-text-muted gap-4 border border-border rounded-lg shadow-2xl">
                  <div className="w-20 h-20 rounded-full border border-border bg-surface flex items-center justify-center animate-pulse-slow">
                      <Video size={32} className="opacity-20" />
                  </div>
                  <p className="text-xs font-medium tracking-wide">NO SIGNAL</p>
                </div>
            )}
        </div>
      </main>

      {/* COLUMN 3: SEQUENCER (Fixed Width - Reduced size) */}
      <aside className="w-[320px] shrink-0 h-full border-l border-border bg-background/50 backdrop-blur-md flex flex-col">
        <Timeline 
            beats={beats}
            currentTime={currentTime}
            onSeek={handleSeek}
            onUpdateBeat={updateBeat}
            onRegenerateImage={handleRegenerateImage}
            onUploadImage={handleUploadImage}
            onSplitBeat={handleSplitBeat}
            onMergeBeats={handleMergeBeats}
            onGenerateImage={handleGenerateImageFromPrompt}
            onSelectImage={handleSelectImage}
            styleSettings={styleSettings}
            onUpdateStyleSettings={updateStyleSettings}
            onBulkGenerate={handleBulkGenerate}
            isAnalyzing={isAnalyzing}
        />
      </aside>
    </div>
  );
};
