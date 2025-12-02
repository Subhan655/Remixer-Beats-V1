import React from 'react';
import { FileText, Sparkles, Music, Video } from 'lucide-react';

export enum TabType {
  TEXT_EDITOR = 'text',
  REMIX = 'remix',
  AUDIO = 'audio',
  VIDEO = 'video'
}

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS = [
  { id: TabType.TEXT_EDITOR, label: 'Text Editor', icon: FileText },
  { id: TabType.REMIX, label: 'Remix', icon: Sparkles },
  { id: TabType.AUDIO, label: 'Audio', icon: Music },
  { id: TabType.VIDEO, label: 'Video Editor', icon: Video }
];

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="h-12 border-b border-border bg-surface/50 flex items-center px-4 gap-1 shrink-0">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-text-muted hover:text-text-main hover:bg-surface border border-transparent'
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
