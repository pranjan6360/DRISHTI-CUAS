import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Volume2, VolumeX, Send, X, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';
import { AIAssistantMessage, NavigationTab } from '../../types';
import { voiceAssistant, AssistantContext } from '../../engine/voiceAssistantEngine';
import { soundFx } from '../../engine/soundEffectsEngine';

interface AIAssistantDrawerProps {
  context: AssistantContext;
  onNavigate?: (tab: NavigationTab) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onHighlightElement?: (id: string | null) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  context,
  onNavigate,
  isOpen,
  onToggleOpen,
  onHighlightElement
}) => {
  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Welcome to DRISHTI. I am your tactical AI instructor. Ask me "What to do", "How to do", or "Why" at any point during your training drill.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'instruction'
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    voiceAssistant.setCallbacks(
      (speechText) => {
        handleSendMessage(speechText);
      },
      (listening) => {
        setIsListening(listening);
      }
    );
  }, [context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    soundFx.playAITalkBlip();

    const userMsg: AIAssistantMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    // Process response contextually
    const response = voiceAssistant.generateResponse(text, context);
    
    // Highlight element if returned
    if (response.highlightId && onHighlightElement) {
      onHighlightElement(response.highlightId);
      setTimeout(() => onHighlightElement(null), 8000); // highlight for 8s
    }

    setTimeout(() => {
      soundFx.playAITalkBlip();
      const aiMsg: AIAssistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'instruction',
        highlightElementId: response.highlightId
      };

      setMessages(prev => [...prev, aiMsg]);
      voiceAssistant.speak(response.text);
    }, 300);
  };

  const toggleVoice = () => {
    const nextVal = !isVoiceEnabled;
    setIsVoiceEnabled(nextVal);
    voiceAssistant.setVoiceEnabled(nextVal);
  };

  const SUGGESTED_QUESTIONS = [
    'What to do & How to do?',
    'Why execute RF Jammer?',
    'What NOT to do?',
    'Explain radar RCS symbol',
    'Show my readiness score'
  ];

  return (
    <>
      {/* Floating Trigger Button on Bottom Right */}
      {!isOpen && (
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleOpen();
          }}
          className="fixed bottom-5 right-5 z-40 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold p-3.5 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center space-x-2 transition-transform hover:scale-105 group border border-cyan-200 select-none animate-pulse-glow"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="text-xs font-mono tracking-wider font-extrabold">TACTICAL AI</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950" />
        </button>
      )}

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 md:w-96 bg-slate-950/95 border-l border-slate-800 backdrop-blur-xl flex flex-col font-mono shadow-2xl transition-transform duration-300 select-none">
          
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500 text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-xs tracking-wider uppercase">TACTICAL AI INSTRUCTOR</h3>
                <p className="text-[10px] text-cyan-400">CONTEXT: {context.currentTab.toUpperCase()} | {context.traineeLevel.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Voice Mute Toggle */}
              <button 
                onClick={toggleVoice} 
                className={`p-1.5 rounded text-xs transition ${isVoiceEnabled ? 'text-cyan-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'}`}
                title={isVoiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Drawer Button */}
              <button 
                onClick={onToggleOpen} 
                className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[90%] p-3 rounded-lg border leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-cyan-950 border-cyan-700 text-cyan-200 rounded-br-none' 
                    : 'bg-slate-900 border-slate-700 text-slate-200 rounded-bl-none shadow-md'
                }`}>
                  <div className="flex items-center space-x-1.5 mb-1 text-[10px] opacity-70">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{msg.sender === 'ai' ? 'DRISHTI AI INSTRUCTOR' : 'TRAINEE'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-normal font-sans text-xs">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Pills */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-900/40 flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[10px] bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 px-2 py-1 rounded transition-all whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Bottom Controls / Text & Voice Input */}
          <div className="p-3 border-t border-slate-800 bg-slate-900 space-y-2">
            
            {/* Mic Visualizer Status */}
            {isListening && (
              <div className="flex items-center justify-center space-x-2 text-cyan-400 text-xs py-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Listening... Speak into microphone</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {/* Mic Toggle Button */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  voiceAssistant.toggleListening();
                }}
                className={`p-2.5 rounded-lg border transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white border-red-400 animate-bounce' 
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700'
                }`}
                title="Hold or click to speak"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input Field */}
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI: 'What to do?', 'How to do?'..."
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold p-2.5 rounded-lg transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
