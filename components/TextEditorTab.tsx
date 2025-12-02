import React, { useRef } from 'react';
import { FileText, Sparkles, RefreshCw } from 'lucide-react';
import { ScriptBlock } from '../types';
import { ScriptEditor, ScriptEditorRef } from './ScriptEditor';
import { AIEditorPanel } from './AIEditorPanel';
import { ChatSession } from '../types';

interface TextEditorTabProps {
  scriptBlocks: ScriptBlock[];
  onScriptChange: (blocks: ScriptBlock[]) => void;
  isGeneratingTTS: boolean;
  onGenerateSpeech: (text?: string) => void;
  onRemixScript: () => void;
  isRemixing: boolean;
  chatSessions: ChatSession[];
  currentChatSessionId: string | null;
  selectedContext: string;
  scriptEditorRef: React.RefObject<ScriptEditorRef>;
  onNewSession: () => void;
  onSwitchSession: (id: string) => void;
  onUpdateSession: (session: ChatSession) => void;
  onDeleteSession: (id: string) => void;
  onAIInsert: (text: string) => void;
  onAIReplace: (text: string) => void;
  isAiPanelOpen: boolean;
  onToggleAiPanel: () => void;
}

export const TextEditorTab: React.FC<TextEditorTabProps> = ({
  scriptBlocks,
  onScriptChange,
  isGeneratingTTS,
  onGenerateSpeech,
  onRemixScript,
  isRemixing,
  chatSessions,
  currentChatSessionId,
  selectedContext,
  scriptEditorRef,
  onNewSession,
  onSwitchSession,
  onUpdateSession,
  onDeleteSession,
  onAIInsert,
  onAIReplace,
  isAiPanelOpen,
  onToggleAiPanel
}) => {
  return (
    <div className="flex-1 flex gap-4 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-border bg-surface/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            Script Editor
          </h3>
          <button
            onClick={onRemixScript}
            disabled={isRemixing || scriptBlocks.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles size={16} className={isRemixing ? 'animate-spin' : ''} />
            {isRemixing ? 'Remixing...' : 'Remix Script'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          <div className="h-[500px] shrink-0">
            <ScriptEditor
              ref={scriptEditorRef}
              blocks={scriptBlocks}
              onChange={onScriptChange}
              onGenerateSpeech={onGenerateSpeech}
              isGeneratingTTS={isGeneratingTTS}
              onSelectionChange={() => {}}
            />
          </div>

          <div className="flex flex-col gap-2 p-4 bg-surface/50 rounded-xl border border-border">
            <label className="text-xs font-bold text-text-muted uppercase">TTS Generation</label>
            <button
              onClick={() => onGenerateSpeech()}
              disabled={isGeneratingTTS || scriptBlocks.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingTTS ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Audio
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${
          isAiPanelOpen ? 'w-[360px]' : 'w-[50px]'
        } shrink-0 h-full border-l border-border bg-[#09090b] transition-[width] duration-300 ease-in-out`}
      >
        <AIEditorPanel
          sessions={chatSessions}
          currentSessionId={currentChatSessionId}
          onNewSession={onNewSession}
          onSwitchSession={onSwitchSession}
          onUpdateSession={onUpdateSession}
          onDeleteSession={onDeleteSession}
          selectedContext={selectedContext}
          onInsert={onAIInsert}
          onReplace={onAIReplace}
          isCollapsed={!isAiPanelOpen}
          onToggle={onToggleAiPanel}
        />
      </div>
    </div>
  );
};
