import React from 'react';
import { Radar, Home, Target, ShieldAlert, BarChart2, Award, User, Settings, Bot, ChevronDown, LucideIcon } from 'lucide-react';
import { NavigationTab, TrainingLevel } from '../../types';
import { soundFx } from '../../engine/soundEffectsEngine';

interface HeaderNavProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  level: TrainingLevel;
  onOpenLevelSelect: () => void;
  onToggleAIDrawer: () => void;
  isAIDrawerOpen: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onNavigate,
  level,
  onOpenLevelSelect,
  onToggleAIDrawer,
  isAIDrawerOpen
}) => {
  const NAV_ITEMS: Array<{ id: NavigationTab; label: string; icon: LucideIcon }> = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'train-config', label: 'TRAIN ME', icon: Target },
    { id: 'battlefield', label: 'BATTLEFIELD', icon: ShieldAlert },
    { id: 'performance', label: 'PERFORMANCE', icon: BarChart2 },
    { id: 'aar', label: 'AAR', icon: Award },
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'settings', label: 'SETTINGS', icon: Settings }
  ];

  const levelColorClass = level === 'beginner' ? 'text-emerald-400' : level === 'intermediate' ? 'text-cyan-400' : 'text-red-400';

  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between font-mono select-none z-30 shadow-xl">
      
      {/* Brand Title */}
      <div 
        onClick={() => { soundFx.playClick(); onNavigate('home'); }}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="p-1.5 bg-cyan-950 border border-cyan-500 rounded-lg text-cyan-400 group-hover:scale-105 transition-transform">
          <Radar className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-wider">
              DRISHTI
            </h1>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold border border-slate-700">
              SIH26247
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block">
            AI-Powered Drone Threat Simulation & Training Platform
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden lg:flex items-center space-x-1">
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id || (currentTab === 'simulation' && item.id === 'train-config');

          return (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                onNavigate(item.id);
              }}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border',
                isActive 
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              ].join(' ')}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Level Selector & AI Assistant Trigger */}
      <div className="flex items-center space-x-2">
        
        {/* Level Indicator Pill */}
        <button
          onClick={() => { soundFx.playClick(); onOpenLevelSelect(); }}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition"
        >
          <span className="text-[10px] text-slate-400">LEVEL:</span>
          <span className={['uppercase font-extrabold', levelColorClass].join(' ')}>
            {level}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* AI Assistant Drawer Toggle */}
        <button
          onClick={() => { soundFx.playClick(); onToggleAIDrawer(); }}
          className={[
            'p-2 rounded-lg border transition',
            isAIDrawerOpen ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800'
          ].join(' ')}
          title="Toggle AI Training Assistant"
        >
          <Bot className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
};
