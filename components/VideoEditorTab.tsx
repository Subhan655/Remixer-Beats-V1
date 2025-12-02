import React from 'react';
import { Video } from 'lucide-react';
import { Beat, LayoutMode, VideoComment } from '../types';
import { VideoComposer } from './VideoComposer';
import { Timeline } from './Timeline';
import { StyleSettings } from '../types';

interface VideoEditorTabProps {
  aRollVideoUrl?: string;
  beats: Beat[];
  layoutMode: LayoutMode;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  videoComments: VideoComment[];
  videoRef: React.RefObject<HTMLVideoElement>;
  styleSettings: StyleSettings;
  isAnalyzing: boolean;
  onTogglePlay: () => void;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onSeek: (time: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  onAddComment: (timestamp: number, text: string) => void;
  onDeleteComment: (id: string) => void;
  onReplyComment: (commentId: string, text: string) => void;
  onResolveComment: (id: string) => void;
  onLayoutChange: (layout: LayoutMode) => void;
  onUpdateBeat: (beatId: string, updates: Partial<Beat>) => void;
  onRegenerateImage: (beat: Beat) => void;
  onUploadImage: (beatId: string, file: File) => void;
  onSplitBeat: (beatId: string, startIdx: number, endIdx: number) => void;
  onMergeBeats: (beatIds: string[]) => void;
  onGenerateImage: (beatId: string, prompt: string) => void;
  onSelectImage: (beatId: string, imageUrl: string) => void;
  onUpdateStyleSettings: (settings: Partial<StyleSettings>) => void;
  onBulkGenerate: () => void;
}

export const VideoEditorTab = React.forwardRef<HTMLVideoElement, VideoEditorTabProps>(
  (
    {
      aRollVideoUrl,
      beats,
      layoutMode,
      currentTime,
      duration,
      isPlaying,
      videoComments,
      videoRef,
      styleSettings,
      isAnalyzing,
      onTogglePlay,
      onTimeUpdate,
      onDurationChange,
      onEnded,
      onSeek,
      onScrubStart,
      onScrubEnd,
      onAddComment,
      onDeleteComment,
      onReplyComment,
      onResolveComment,
      onLayoutChange,
      onUpdateBeat,
      onRegenerateImage,
      onUploadImage,
      onSplitBeat,
      onMergeBeats,
      onGenerateImage,
      onSelectImage,
      onUpdateStyleSettings,
      onBulkGenerate
    }
  ) => {
    return (
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <main className="flex-1 h-full relative flex flex-col bg-background/80 min-w-[300px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="h-12 border-b border-border flex items-center justify-between px-4 z-10 shrink-0">
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
              REC VIEW
            </div>
            <div className="flex bg-surface rounded-lg p-0.5 border border-border">
              <button
                onClick={() => onLayoutChange(LayoutMode.PORTRAIT)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  layoutMode === LayoutMode.PORTRAIT ? 'bg-text-main text-background shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                9:16
              </button>
              <button
                onClick={() => onLayoutChange(LayoutMode.LANDSCAPE)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  layoutMode === LayoutMode.LANDSCAPE ? 'bg-text-main text-background shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                16:9
              </button>
            </div>
          </div>

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
                onTogglePlay={onTogglePlay}
                onTimeUpdate={onTimeUpdate}
                onDurationChange={onDurationChange}
                onEnded={onEnded}
                onSeek={onSeek}
                onScrubStart={onScrubStart}
                onScrubEnd={onScrubEnd}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
                onReplyComment={onReplyComment}
                onResolveComment={onResolveComment}
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

        <aside className="w-[320px] shrink-0 h-full border-l border-border bg-background/50 backdrop-blur-md flex flex-col">
          <Timeline
            beats={beats}
            currentTime={currentTime}
            onSeek={onSeek}
            onUpdateBeat={onUpdateBeat}
            onRegenerateImage={onRegenerateImage}
            onUploadImage={onUploadImage}
            onSplitBeat={onSplitBeat}
            onMergeBeats={onMergeBeats}
            onGenerateImage={onGenerateImage}
            onSelectImage={onSelectImage}
            styleSettings={styleSettings}
            onUpdateStyleSettings={onUpdateStyleSettings}
            onBulkGenerate={onBulkGenerate}
            isAnalyzing={isAnalyzing}
          />
        </aside>
      </div>
    );
  }
);

VideoEditorTab.displayName = 'VideoEditorTab';
