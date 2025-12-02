
import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Download, Loader2, Music, MessageSquare, Sun, Moon } from 'lucide-react';
import { ProjectState, AudioClip, Beat, LayoutMode, OverlayType, StyleSettings, ScriptBlock, VideoComment, ChatSession, ScriptVariant } from './types';
import { generateSpeech, analyzeBeats, generateBRollImage, generateVeoVideo, analyzeAudioContent, VeoConfig } from './services/geminiService';
import { extractAudioFromVideo, mergeAudioClips } from './utils/audioUtils';
import { renderVideoToBlob } from './utils/renderUtils';
import { CollaborationPanel } from './components/CollaborationPanel';
import { ScriptEditor, ScriptEditorRef } from './components/ScriptEditor';
import { ThemeTransition } from './components/ThemeTransition';
import { TabNavigation, TabType } from './components/TabNavigation';
import { TextEditorTab } from './components/TextEditorTab';
import { RemixTab } from './components/RemixTab';
import { AudioTab } from './components/AudioTab';
import { VideoEditorTab } from './components/VideoEditorTab';

const INITIAL_TEXT = "Is code more important or is content more important for a 17 year old? I'm of the belief that if you can do it, learn how to code. Because see, content, you can always pick up even after you learn how to code.";

const INITIAL_STATE: ProjectState = {
  textContent: INITIAL_TEXT,
  scriptBlocks: [{ id: 'block-init', content: INITIAL_TEXT, align: 'left', type: 'p' }],
  scriptVariants: [],
  selectedVariantId: undefined,
  videoTranscript: "",
  audioClips: [],
  selectedAudioIds: [],
  aRollVideoUrl: undefined,
  isGeneratingVideo: false,
  beats: [],
  layoutMode: LayoutMode.PORTRAIT,
  styleSettings: {
      themePrompt: "",
      imageCount: 1,
      referenceImage: undefined,
      avatarImage: undefined
  },
  videoComments: [],
  chatSessions: [{
      id: 'default-session',
      title: 'New Chat',
      messages: [],
      lastUpdated: Date.now()
  }],
  currentChatSessionId: 'default-session'
};

export const App: React.FC = () => {
  const [state, setState] = useState<ProjectState>(INITIAL_STATE);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.TEXT_EDITOR);

  // AI Panel State (Collapsed by default)
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Script Editor Interaction State
  const [selectedScriptText, setSelectedScriptText] = useState("");
  const scriptEditorRef = useRef<ScriptEditorRef>(null);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isTransitioningTheme, setIsTransitioningTheme] = useState(false);
  const [targetTheme, setTargetTheme] = useState<'dark' | 'light'>('dark');

  // State to track if video was playing before user started scrubbing
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);

  // Lifted Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- Theme Handlers ---
  const handleThemeToggle = () => {
    if (isTransitioningTheme) return;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTargetTheme(nextTheme);
    setIsTransitioningTheme(true);
  };

  const applyTheme = () => {
      setTheme(targetTheme);
      if (targetTheme === 'light') {
          document.body.classList.add('light-mode');
      } else {
          document.body.classList.remove('light-mode');
      }
  };

  // --- Helpers ---
  // Aggregate text from blocks for Analysis/TTS
  const getFullScriptText = () => {
      return state.scriptBlocks.map(b => b.content.replace(/<[^>]*>?/gm, '')).join('\n');
  };

  // --- Video Controls ---
  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleVideoDurationChange = (dur: number) => {
    setDuration(dur);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time); // Immediate update for UI responsiveness
    }
  };

  const handleScrubStart = () => {
      if (isPlaying) {
          setWasPlayingBeforeScrub(true);
          if (videoRef.current) videoRef.current.pause();
          setIsPlaying(false);
      } else {
          setWasPlayingBeforeScrub(false);
      }
  };

  const handleScrubEnd = () => {
      if (wasPlayingBeforeScrub && videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
      }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  // --- Video Comment Handlers ---
  const handleAddVideoComment = (timestamp: number, text: string) => {
      const newComment: VideoComment = {
          id: Date.now().toString(),
          videoTimestamp: timestamp,
          text,
          author: "You", // In a real app, this comes from auth
          createdAt: Date.now(),
          replies: []
      };
      setState(prev => ({
          ...prev,
          videoComments: [...prev.videoComments, newComment]
      }));
  };

  const handleDeleteVideoComment = (id: string) => {
      setState(prev => ({
          ...prev,
          videoComments: prev.videoComments.filter(c => c.id !== id)
      }));
  };

  const handleReplyVideoComment = (commentId: string, text: string) => {
      setState(prev => ({
          ...prev,
          videoComments: prev.videoComments.map(c => {
              if (c.id === commentId) {
                  return {
                      ...c,
                      replies: [...c.replies, {
                          id: Date.now().toString(),
                          text,
                          author: "You",
                          createdAt: Date.now()
                      }]
                  };
              }
              return c;
          })
      }));
  };

  const handleResolveVideoComment = (id: string) => {
      setState(prev => ({
          ...prev,
          videoComments: prev.videoComments.map(c => 
              c.id === id ? { ...c, isResolved: !c.isResolved } : c
          )
      }));
  };

  // --- Chat Session Handlers ---
  const handleNewSession = () => {
      const newId = `session-${Date.now()}`;
      const newSession: ChatSession = {
          id: newId,
          title: "New Chat",
          messages: [],
          lastUpdated: Date.now()
      };
      setState(prev => ({
          ...prev,
          chatSessions: [...prev.chatSessions, newSession],
          currentChatSessionId: newId
      }));
      // Auto open panel when new session is created
      setIsAiPanelOpen(true);
  };

  const handleUpdateSession = (session: ChatSession) => {
      setState(prev => ({
          ...prev,
          chatSessions: prev.chatSessions.map(s => s.id === session.id ? session : s)
      }));
  };

  const handleSwitchSession = (id: string) => {
      setState(prev => ({ ...prev, currentChatSessionId: id }));
  };

  const handleDeleteSession = (id: string) => {
      setState(prev => {
          const newSessions = prev.chatSessions.filter(s => s.id !== id);
          // If we deleted active session, switch to another or create new
          let newCurrentId = prev.currentChatSessionId;
          if (id === prev.currentChatSessionId) {
              newCurrentId = newSessions.length > 0 ? newSessions[0].id : null;
          }
          
          if (!newCurrentId && newSessions.length === 0) {
               // Ensure always at least one
               const defaultS = { id: `session-${Date.now()}`, title: 'New Chat', messages: [], lastUpdated: Date.now() };
               return { ...prev, chatSessions: [defaultS], currentChatSessionId: defaultS.id };
          }
          
          return {
              ...prev,
              chatSessions: newSessions,
              currentChatSessionId: newCurrentId
          };
      });
  };

  // --- AI Editor Actions ---
  const handleAIInsert = (text: string) => {
      scriptEditorRef.current?.insertAtCursor(text);
  };

  const handleAIReplace = (text: string) => {
      scriptEditorRef.current?.replaceSelection(text);
  };

  // --- Remix Script Handler ---
  const handleRemixScript = async () => {
      if (state.scriptBlocks.length === 0) return;

      setIsRemixing(true);
      setStatus("Generating script variations...");
      setError(null);

      try {
          const fullText = getFullScriptText();

          const originalVariant: ScriptVariant = {
              id: `variant-original-${Date.now()}`,
              content: fullText,
              blocks: state.scriptBlocks,
              isOriginal: true,
              createdAt: Date.now()
          };

          const variants: ScriptVariant[] = [originalVariant];

          for (let i = 0; i < 2; i++) {
              const remixId = `variant-remix-${Date.now()}-${i}`;
              const remixVariant: ScriptVariant = {
                  id: remixId,
                  content: fullText + ` [AI Variation ${i + 1}]`,
                  blocks: [{
                      id: remixId,
                      content: fullText + ` [AI Variation ${i + 1}]`,
                      align: 'left' as const,
                      type: 'p' as const
                  }],
                  isOriginal: false,
                  createdAt: Date.now()
              };
              variants.push(remixVariant);
          }

          setState(prev => ({
              ...prev,
              scriptVariants: variants,
              selectedVariantId: originalVariant.id
          }));

          setStatus("Script variations generated!");
          setActiveTab(TabType.REMIX);
      } catch (e: any) {
          setError("Failed to generate script variations: " + e.message);
      } finally {
          setIsRemixing(false);
      }
  };

  // --- Export Handler ---
  const handleExportVideo = async () => {
      if (!state.aRollVideoUrl) return;
      
      setIsExporting(true);
      setExportProgress(0);
      
      // Pause preview during export
      if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
      }

      try {
          const blob = await renderVideoToBlob(
              state.aRollVideoUrl,
              state.beats,
              state.layoutMode,
              (p) => setExportProgress(Math.round(p * 100))
          );
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `remix-video-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          setStatus("Video exported successfully!");
      } catch (e: any) {
          console.error("Export failed:", e);
          setError("Failed to export video. " + e.message);
      } finally {
          setIsExporting(false);
          setExportProgress(0);
      }
  };

  // --- State Handlers ---
  const handleScriptChange = (blocks: ScriptBlock[]) => {
      setState(prev => ({ ...prev, scriptBlocks: blocks }));
  };

  const updateStyleSettings = (settings: Partial<StyleSettings>) => {
      setState(prev => ({
          ...prev,
          styleSettings: { ...prev.styleSettings, ...settings }
      }));
  };

  const handleGenerateSpeech = async (textToSpeak?: string) => {
    const fullText = textToSpeak || getFullScriptText();
    if (!fullText) return;

    setIsGeneratingTTS(true);
    setStatus("Generating speech...");
    setError(null);
    try {
      const wavBlob = await generateSpeech(fullText);
      const url = URL.createObjectURL(wavBlob);
      const newClip: AudioClip = {
        id: Date.now().toString(),
        text: fullText.substring(0, 50) + (fullText.length > 50 ? "..." : ""),
        audioUrl: url,
        duration: 0, 
        createdAt: Date.now()
      };
      setState(prev => ({
        ...prev,
        audioClips: [newClip, ...prev.audioClips],
        selectedAudioIds: [newClip.id]
      }));
      setStatus("Speech generated!");
    } catch (e: any) {
      setError(e.message || "Failed to generate speech");
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handleDeleteAudio = (id: string) => {
      setState(prev => ({
          ...prev,
          audioClips: prev.audioClips.filter(c => c.id !== id),
          selectedAudioIds: prev.selectedAudioIds.filter(sid => sid !== id)
      }));
  };

  const handleAudioSelect = (id: string) => {
      setState(prev => {
          const isSelected = prev.selectedAudioIds.includes(id);
          const newSelection = isSelected 
             ? prev.selectedAudioIds.filter(mid => mid !== id)
             : [...prev.selectedAudioIds, id];
          return { ...prev, selectedAudioIds: newSelection };
      });
  };

  const handleMergeAudio = async () => {
      if (state.selectedAudioIds.length < 2) return;
      
      setStatus("Merging audio clips...");
      try {
          const selectedClips = state.audioClips.filter(c => state.selectedAudioIds.includes(c.id));
          selectedClips.sort((a, b) => a.createdAt - b.createdAt);
          
          const blob = await mergeAudioClips(selectedClips.map(c => c.audioUrl));
          const url = URL.createObjectURL(blob);
          
          const mergedText = selectedClips.map(c => c.text).join(" | ");

          const newClip: AudioClip = {
              id: `merged-${Date.now()}`,
              text: "Merged Audio: " + mergedText.substring(0, 30) + "...",
              audioUrl: url,
              duration: 0,
              createdAt: Date.now()
          };

          setState(prev => ({
              ...prev,
              audioClips: [newClip, ...prev.audioClips],
              selectedAudioIds: [newClip.id] 
          }));
          setStatus("Audio merged successfully!");
      } catch (e: any) {
          setError("Failed to merge audio: " + e.message);
      }
  };

  const handleAnalyzeBeats = async () => {
    const textToAnalyze = state.videoTranscript || getFullScriptText();
    
    if (!textToAnalyze) {
        setError("Please enter text in the editor to analyze.");
        return;
    }

    setIsAnalyzing(true);
    setStatus("Analyzing text for visual beats...");
    setError(null);
    try {
      const beats = await analyzeBeats(textToAnalyze);
      
      let currentT = 0;
      const updatedBeats = beats.map(beat => {
        const wordCount = beat.textSegment.split(' ').length;
        const dur = Math.max(2, wordCount / 2.5); 
        const b = { ...beat, startTime: currentT, endTime: currentT + dur };
        currentT += dur;
        return b;
      });

      setState(prev => ({ ...prev, beats: updatedBeats }));
      setStatus("Analysis complete. Review beats and generate images.");
      
    } catch (e: any) {
      setError(e.message || "Failed to analyze beats");
    } finally {
        setIsAnalyzing(false); 
    }
  };

  const handleGenerateVeo = async (config: { resolution: '720p' | '1080p'; aspectRatio: '9:16' | '16:9'; avatarImage?: string }) => {
     let sourceText = "";
     if (state.selectedAudioIds.length > 0) {
         const clip = state.audioClips.find(c => c.id === state.selectedAudioIds[0]);
         if (clip) sourceText = clip.text;
     }
     
     if (!sourceText) sourceText = getFullScriptText();
     if (!sourceText) {
         setError("No text content found to generate video.");
         return;
     }

     setState(prev => ({ ...prev, isGeneratingVideo: true, layoutMode: config.aspectRatio === '9:16' ? LayoutMode.PORTRAIT : LayoutMode.LANDSCAPE }));
     setStatus("Generating Veo A-Roll video (this may take a while)...");
     setError(null);
     
     try {
         const prompt = `A cinematic video of a person talking about: ${sourceText}. High quality, professional lighting.`;
         const videoUrl = await generateVeoVideo(prompt, config);
         
         setState(prev => ({ ...prev, aRollVideoUrl: videoUrl }));
         setStatus("Video generated!");
     } catch (e: any) {
         setError(e.message || "Failed to generate video");
     } finally {
         setState(prev => ({ ...prev, isGeneratingVideo: false }));
     }
  };

  const handleUploadARoll = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          
          setState(prev => ({ ...prev, aRollVideoUrl: url, beats: [], videoTranscript: "" }));
          
          setIsAnalyzing(true);
          setError(null);
          setStatus("Extracting audio from video...");
          
          try {
              const audioBase64 = await extractAudioFromVideo(file);
              
              setStatus("Transcribing and creating beats with Gemini...");
              const { transcript, beats } = await analyzeAudioContent(audioBase64);
              
              setState(prev => ({ 
                  ...prev, 
                  videoTranscript: transcript,
                  beats: beats,
              }));
              
              setStatus("Video uploaded and analyzed. Ready to generate visuals.");
          } catch (e: any) {
              console.error(e);
              setError(e.message || "Failed to process video");
              setStatus("Analysis failed.");
          } finally {
              setIsAnalyzing(false);
          }
      }
  };

  const handleRemoveARoll = () => {
      if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
      }
      setState(prev => ({
          ...prev,
          aRollVideoUrl: undefined,
          beats: [],
          videoTranscript: ""
      }));
      setCurrentTime(0);
      setDuration(0);
      setStatus("Video removed.");
  };

  const updateBeat = (beatId: string, updates: Partial<Beat>) => {
      setState(prev => ({
          ...prev,
          beats: prev.beats.map(b => b.id === beatId ? { ...b, ...updates } : b)
      }));
  };

  const handleRegenerateImage = async (beat: Beat) => {
      setStatus(`Regenerating image for beat...`);
      try {
          const beatTheme = beat.styleConfig?.themePrompt || state.styleSettings.themePrompt;
          const beatRef = beat.styleConfig?.referenceImage || state.styleSettings.referenceImage;
          const beatAvatar = beat.styleConfig?.avatarImage || state.styleSettings.avatarImage;
          
          const img = await generateBRollImage(
              beat.visualPrompt, 
              state.layoutMode,
              beatRef,
              beatTheme,
              beatAvatar
          );
          updateBeat(beat.id, { 
              bRollImage: img,
              bRollOptions: [...(beat.bRollOptions || []), img]
          });
          setStatus("Image updated.");
      } catch(e: any) {
          setError("Failed to regenerate image");
      }
  };

  const handleBulkGenerate = async () => {
      const beatsToProcess = state.beats;
      if (beatsToProcess.length === 0) return;

      let completed = 0;

      for (let i = 0; i < beatsToProcess.length; i++) {
          const beat = beatsToProcess[i];
          const count = beat.styleConfig?.imageCount || state.styleSettings.imageCount;
          const theme = beat.styleConfig?.themePrompt || state.styleSettings.themePrompt;
          const refImg = beat.styleConfig?.referenceImage || state.styleSettings.referenceImage;
          const avatar = beat.styleConfig?.avatarImage || state.styleSettings.avatarImage;

          for (let j = 0; j < count; j++) {
              setStatus(`Generating image ${j+1}/${count} for beat ${i + 1}/${beatsToProcess.length}...`);
              try {
                  await new Promise(resolve => setTimeout(resolve, 3000));
                  const img = await generateBRollImage(
                      beat.visualPrompt, 
                      state.layoutMode, 
                      refImg,
                      theme,
                      avatar
                  );
                  
                  setState(prev => ({
                      ...prev,
                      beats: prev.beats.map(b => {
                          if (b.id === beat.id) {
                              const isFirst = !b.bRollImage && (b.bRollOptions?.length || 0) === 0 && j === 0;
                              return { 
                                  ...b, 
                                  bRollImage: isFirst ? img : (b.bRollImage || img),
                                  bRollOptions: [...(b.bRollOptions || []), img] 
                              };
                          }
                          return b;
                      })
                  }));
              } catch (e) {
                  console.error(`Failed to generate image for beat ${beat.id}`, e);
              }
              completed++;
          }
      }
      setStatus("Batch generation complete.");
  };

  const handleGenerateImageFromPrompt = async (beatId: string, prompt: string) => {
      if (!prompt.trim()) return;
      
      const currentBeat = state.beats.find(b => b.id === beatId);
      if (!currentBeat) return;
      
      const count = currentBeat.styleConfig?.imageCount || state.styleSettings.imageCount || 1;
      
      setStatus(`Generating ${count} version${count > 1 ? 's' : ''}...`);
      
      try {
          const beatTheme = currentBeat.styleConfig?.themePrompt || state.styleSettings.themePrompt;
          const beatRef = currentBeat.styleConfig?.referenceImage || state.styleSettings.referenceImage;
          const beatAvatar = currentBeat.styleConfig?.avatarImage || state.styleSettings.avatarImage;

          for (let i = 0; i < count; i++) {
              if (count > 1) setStatus(`Generating version ${i+1}/${count}...`);
              
              const img = await generateBRollImage(
                  prompt, 
                  state.layoutMode,
                  beatRef, 
                  beatTheme,
                  beatAvatar
              );
              
              setState(prev => {
                  const b = prev.beats.find(bt => bt.id === beatId);
                  if (!b) return prev;

                  const newOptions = [...(b.bRollOptions || []), img];
                  return {
                      ...prev,
                      beats: prev.beats.map(bt => bt.id === beatId ? {
                          ...bt,
                          bRollImage: img, 
                          bRollOptions: newOptions,
                          visualPrompt: prompt
                      } : bt)
                  };
              });
          }
          
          setStatus(`Generated ${count} image${count > 1 ? 's' : ''}.`);
      } catch(e: any) {
          setError("Failed to generate image");
          setStatus("");
      }
  };

  const handleUploadImage = (beatId: string, file: File) => {
      const url = URL.createObjectURL(file);
      const currentBeat = state.beats.find(b => b.id === beatId);
      if (currentBeat) {
          updateBeat(beatId, { 
              bRollImage: url,
              bRollOptions: [...(currentBeat.bRollOptions || []), url]
          });
      }
  };

  const handleSelectImage = (beatId: string, imageUrl: string) => {
      updateBeat(beatId, { bRollImage: imageUrl });
  };

  const handleSplitBeat = async (beatId: string, startIdx: number, endIdx: number) => {
      const beatIndex = state.beats.findIndex(b => b.id === beatId);
      if (beatIndex === -1) return;
      
      const originalBeat = state.beats[beatIndex];
      const text = originalBeat.textSegment;
      
      if (startIdx < 0 || endIdx > text.length || startIdx >= endIdx) return;

      const len1 = startIdx;
      const len2 = endIdx - startIdx;
      const len3 = text.length - endIdx;

      const totalLength = text.length;
      const totalDuration = originalBeat.endTime - originalBeat.startTime;

      const parts = [];
      if (len1 > 0) parts.push({ text: text.substring(0, startIdx), len: len1 });
      parts.push({ text: text.substring(startIdx, endIdx), len: len2 });
      if (len3 > 0) parts.push({ text: text.substring(endIdx), len: len3 });

      let currentStartTime = originalBeat.startTime;
      const newBeats: Beat[] = [];

      for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const partDuration = (part.len / totalLength) * totalDuration;
          
          const newBeat: Beat = {
              id: `beat-${Date.now()}-${i}`,
              startTime: currentStartTime,
              endTime: currentStartTime + partDuration,
              textSegment: part.text.trim(),
              visualPrompt: part.text.trim() + ", photorealistic, 4k, b-roll, cinematic lighting",
              overlayType: originalBeat.overlayType,
              isEnabled: true,
              bRollImage: undefined,
              bRollSettings: { x: 0, y: 0, scale: 1, height: 50, aRollOffsetY: 50 },
              bRollOptions: [],
              styleConfig: originalBeat.styleConfig 
          };
          newBeats.push(newBeat);
          currentStartTime += partDuration;
      }

      const updatedBeats = [...state.beats];
      updatedBeats.splice(beatIndex, 1, ...newBeats);
      
      setState(prev => ({ ...prev, beats: updatedBeats }));
  };

  const handleMergeBeats = (beatIds: string[]) => {
      const selectedBeats = state.beats.filter(b => beatIds.includes(b.id));
      if (selectedBeats.length < 2) return;

      selectedBeats.sort((a, b) => a.startTime - b.startTime);

      const firstBeat = selectedBeats[0];
      const lastBeat = selectedBeats[selectedBeats.length - 1];

      const mergedText = selectedBeats.map(b => b.textSegment).join(" ");

      const allImages = Array.from(new Set(selectedBeats.flatMap(b => b.bRollOptions || []))) as string[];
      if (firstBeat.bRollImage && !allImages.includes(firstBeat.bRollImage)) {
          allImages.unshift(firstBeat.bRollImage);
      }

      const mergedBeat: Beat = {
          id: `beat-merged-${Date.now()}`,
          startTime: firstBeat.startTime,
          endTime: lastBeat.endTime,
          textSegment: mergedText,
          visualPrompt: firstBeat.visualPrompt,
          bRollImage: firstBeat.bRollImage,
          overlayType: firstBeat.overlayType,
          isEnabled: firstBeat.isEnabled,
          bRollSettings: firstBeat.bRollSettings,
          bRollOptions: allImages,
          styleConfig: firstBeat.styleConfig
      };

      const remainingBeats = state.beats.filter(b => !beatIds.includes(b.id));
      const newBeatsList = [...remainingBeats, mergedBeat].sort((a, b) => a.startTime - b.startTime);

      setState(prev => ({
          ...prev,
          beats: newBeatsList
      }));
      setStatus(`Merged ${selectedBeats.length} beats.`);
  };

  return (
    <div className="h-screen bg-transparent text-text-main font-sans selection:bg-primary/30 selection:text-white flex flex-col overflow-hidden">
      
      {/* THEME TRANSITION OVERLAY */}
      {isTransitioningTheme && (
        <ThemeTransition 
          targetTheme={targetTheme}
          onAnimationComplete={() => setIsTransitioningTheme(false)}
          onThemeSwitch={applyTheme}
        />
      )}

      <CollaborationPanel isOpen={isCollabOpen} onClose={() => setIsCollabOpen(false)} />
      
      {/* Generate Video Modal */}
      <GenerateVideoModal 
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateVeo}
      />

      {/* EXPORT OVERLAY */}
      {isExporting && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center gap-6 backdrop-blur-xl animate-fade-in">
              <div className="relative">
                  <Loader2 size={64} className="text-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                  </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl font-bold text-white tracking-tight">Rendering Video</div>
                <div className="text-sm text-gray-400 font-medium">Please wait while we compose your masterpiece</div>
              </div>
              <div className="w-96 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <div 
                      className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]"
                      style={{ width: `${exportProgress}%` }}
                  />
              </div>
              <div className="text-xs text-gray-500 font-mono tracking-widest">{exportProgress}%</div>
          </div>
      )}

      {/* TOP HEADER */}
      <header className="h-14 px-6 glass-panel border-b border-border flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Music size={18} className="text-white fill-white" />
              </div>
              <div className="flex flex-col">
                  <h1 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-main to-text-muted tracking-tight">
                      Remixer Beats <span className="text-primary">AI</span>
                  </h1>
                  <span className="text-[10px] text-text-muted font-medium tracking-wide">VIDEO COMPOSER SUITE</span>
              </div>
          </div>

          <div className="flex items-center gap-4">
               {/* Status Pill */}
               <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${status ? 'bg-primary/5 border-primary/20 opacity-100' : 'opacity-0 border-transparent'}`}>
                   {status && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>}
                   <span className="text-[10px] font-medium text-primary tracking-wide">{status}</span>
               </div>
               
               {error && (
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-[10px] font-medium animate-fade-in">
                    <AlertCircle size={12} />
                    {error}
                 </div>
               )}

               <div className="h-4 w-px bg-border mx-2"></div>
               
               {/* THEME TOGGLE */}
               <button 
                  onClick={handleThemeToggle}
                  disabled={isTransitioningTheme}
                  className="p-2 rounded-lg transition-colors border border-transparent hover:bg-surface text-text-muted hover:text-text-main hover:border-border"
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
               >
                   {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
               </button>

               <button 
                  onClick={() => setIsCollabOpen(true)}
                  className={`p-2 rounded-lg transition-colors border border-transparent ${isCollabOpen ? 'bg-surface text-text-main border-border' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
                  title="Team Chat"
               >
                   <MessageSquare size={16} />
               </button>

               <button 
                   onClick={handleExportVideo}
                   disabled={!state.aRollVideoUrl || isExporting || isAnalyzing}
                   className="flex items-center gap-2 px-4 py-1.5 bg-surface hover:bg-background border border-border text-text-main rounded-lg text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed group"
               >
                   <Download size={14} className="group-hover:text-primary transition-colors" />
                   Export
               </button>
          </div>
      </header>

      {/* TAB NAVIGATION */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* MAIN LAYOUT: Tab Content Area */}
      <main className="flex-1 min-h-0 overflow-hidden">
          {/* TEXT EDITOR TAB */}
          {activeTab === TabType.TEXT_EDITOR && (
              <TextEditorTab
                  scriptBlocks={state.scriptBlocks}
                  onScriptChange={handleScriptChange}
                  isGeneratingTTS={isGeneratingTTS}
                  onGenerateSpeech={handleGenerateSpeech}
                  onRemixScript={handleRemixScript}
                  isRemixing={isRemixing}
                  chatSessions={state.chatSessions}
                  currentChatSessionId={state.currentChatSessionId}
                  selectedContext={selectedScriptText}
                  scriptEditorRef={scriptEditorRef}
                  onNewSession={handleNewSession}
                  onSwitchSession={handleSwitchSession}
                  onUpdateSession={handleUpdateSession}
                  onDeleteSession={handleDeleteSession}
                  onAIInsert={handleAIInsert}
                  onAIReplace={handleAIReplace}
                  isAiPanelOpen={isAiPanelOpen}
                  onToggleAiPanel={() => setIsAiPanelOpen(!isAiPanelOpen)}
              />
          )}

          {/* REMIX TAB */}
          {activeTab === TabType.REMIX && (
              <RemixTab
                  variants={state.scriptVariants}
                  selectedVariantId={state.selectedVariantId}
                  onSelectVariant={(id) => setState(prev => ({ ...prev, selectedVariantId: id }))}
                  onEditVariant={(id) => {
                      const variant = state.scriptVariants.find(v => v.id === id);
                      if (variant) {
                          setState(prev => ({ ...prev, scriptBlocks: variant.blocks }));
                          setActiveTab(TabType.TEXT_EDITOR);
                      }
                  }}
                  onRegenerateVariant={(id) => {
                      setStatus("Regenerating variant...");
                  }}
                  onDeleteVariant={(id) => {
                      setState(prev => ({
                          ...prev,
                          scriptVariants: prev.scriptVariants.filter(v => v.id !== id)
                      }));
                  }}
              />
          )}

          {/* AUDIO TAB */}
          {activeTab === TabType.AUDIO && (
              <AudioTab
                  audioClips={state.audioClips}
                  selectedAudioIds={state.selectedAudioIds}
                  onAudioSelect={handleAudioSelect}
                  onDeleteAudio={handleDeleteAudio}
                  onMergeAudio={handleMergeAudio}
                  aRollVideoUrl={state.aRollVideoUrl}
                  isGeneratingVideo={state.isGeneratingVideo}
                  isAnalyzing={isAnalyzing}
                  onUploadARoll={handleUploadARoll}
                  onRemoveARoll={handleRemoveARoll}
                  onGenerateVideo={handleGenerateVeo}
                  onGenerateVideoModalOpen={() => setIsGenerateModalOpen(true)}
                  isGenerateModalOpen={isGenerateModalOpen}
                  onGenerateModalClose={() => setIsGenerateModalOpen(false)}
              />
          )}

          {/* VIDEO EDITOR TAB */}
          {activeTab === TabType.VIDEO && (
              <VideoEditorTab
                  ref={videoRef}
                  aRollVideoUrl={state.aRollVideoUrl}
                  beats={state.beats}
                  layoutMode={state.layoutMode}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  videoComments={state.videoComments}
                  videoRef={videoRef}
                  styleSettings={state.styleSettings}
                  isAnalyzing={isAnalyzing}
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
                  onLayoutChange={(layout) => setState(prev => ({ ...prev, layoutMode: layout }))}
                  onUpdateBeat={updateBeat}
                  onRegenerateImage={handleRegenerateImage}
                  onUploadImage={handleUploadImage}
                  onSplitBeat={handleSplitBeat}
                  onMergeBeats={handleMergeBeats}
                  onGenerateImage={handleGenerateImageFromPrompt}
                  onSelectImage={handleSelectImage}
                  onUpdateStyleSettings={updateStyleSettings}
                  onBulkGenerate={handleBulkGenerate}
              />
          )}
      </main>
    </div>
  );
};
