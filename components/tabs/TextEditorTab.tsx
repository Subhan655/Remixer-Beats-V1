import React from 'react';
import { ScriptEditor, ScriptEditorRef } from '../ScriptEditor';
import { AIEditorPanel } from '../AIEditorPanel';
import { ScriptBlock, ChatSession } from '../../types';
import { ArrowRight } from 'lucide-react';

interface TextEditorTabProps {
  scriptBlocks: ScriptBlock[];
  handleScriptChange: (blocks: ScriptBlock[]) => void;
  handleGenerateSpeech: (text?: string) => void;
  isGeneratingTTS: boolean;
  setSelectedScriptText: (text: string) => void;
  scriptEditorRef: React.RefObject<ScriptEditorRef>;
  chatSessions: ChatSession[];
  currentChatSessionId: string | null;
  handleNewSession: () => void;
  handleSwitchSession: (id: string) => void;
  handleUpdateSession: (session: ChatSession) => void;
  handleDeleteSession: (id: string) => void;
  selectedScriptText: string;
  handleAIInsert: (text: string) => void;
  handleAIReplace: (text: string) => void;
  isAiPanelOpen: boolean;
  setIsAiPanelOpen: (isOpen: boolean) => void;
  onNext: () => void;
}

export const TextEditorTab: React.FC<TextEditorTabProps> = ({
  scriptBlocks,
  handleScriptChange,
  handleGenerateSpeech,
  isGeneratingTTS,
  setSelectedScriptText,
  scriptEditorRef,
  chatSessions,
  currentChatSessionId,
  handleNewSession,
  handleSwitchSession,
  handleUpdateSession,
  handleDeleteSession,
  selectedScriptText,
  handleAIInsert,
  handleAIReplace,
  isAiPanelOpen,
  setIsAiPanelOpen,
  onNext
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col p-6 gap-4 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-main">Script Editor</h2>
          <button 
            onClick={onNext}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-primary/20"
          >
            Remix Script <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden rounded-xl border border-border bg-surface/30 shadow-sm">
          <ScriptEditor 
            ref={scriptEditorRef}
            blocks={scriptBlocks}
            onChange={handleScriptChange}
            onGenerateSpeech={handleGenerateSpeech}
            isGeneratingTTS={isGeneratingTTS}
            onSelectionChange={setSelectedScriptText}
          />
        </div>
      </div>

      {/* AI Panel */}
      <aside className={`${isAiPanelOpen ? 'w-[360px]' : 'w-[50px]'} shrink-0 h-full border-l border-border bg-[#09090b] transition-[width] duration-300 ease-in-out`}>
        <AIEditorPanel 
          sessions={chatSessions}
          currentSessionId={currentChatSessionId}
          onNewSession={handleNewSession}
          onSwitchSession={handleSwitchSession}
          onUpdateSession={handleUpdateSession}
          onDeleteSession={handleDeleteSession}
          selectedContext={selectedScriptText}
          onInsert={handleAIInsert}
          onReplace={handleAIReplace}
          isCollapsed={!isAiPanelOpen}
          onToggle={() => setIsAiPanelOpen(!isAiPanelOpen)}
        />
      </aside>
    </div>
  );
};
