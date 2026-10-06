import React, { useState } from 'react';
import { NavigationTab, TrainingLevel, ScenarioConfig, AARData, PerformanceHistoryEntry, TraineeProfile } from './types';
import { CinematicIntro } from './components/tactical/CinematicIntro';
import { LevelSelectModal } from './components/tactical/LevelSelectModal';
import { HeaderNav } from './components/tactical/HeaderNav';
import { AIAssistantDrawer } from './components/tactical/AIAssistantDrawer';

import { HomePage } from './pages/HomePage';
import { TrainConfigPage } from './pages/TrainConfigPage';
import { SimulationPage } from './pages/SimulationPage';
import { BattlefieldPage } from './pages/BattlefieldPage';
import { PerformancePage } from './pages/PerformancePage';
import { AARPage } from './pages/AARPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

import { SCRIPTED_SCENARIOS } from './engine/scenarioEngine';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('intro');
  const [traineeLevel, setTraineeLevel] = useState<TrainingLevel>('beginner');
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState<boolean>(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Editable Defense Personnel Profile State
  const [traineeProfile, setTraineeProfile] = useState<TraineeProfile>(() => {
    const saved = localStorage.getItem('drishti_trainee_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      name: 'Capt. Arjun Verma',
      rank: 'Captain',
      serviceId: 'IC-78942-DEF',
      unit: '14th Air Defense Regiment',
      branch: 'Indian Army',
      baseLocation: 'Western Command Headquarters'
    };
  });

  const handleUpdateProfile = (updated: TraineeProfile) => {
    setTraineeProfile(updated);
    localStorage.setItem('drishti_trainee_profile', JSON.stringify(updated));
  };

  const [activeScenario, setActiveScenario] = useState<ScenarioConfig>(SCRIPTED_SCENARIOS[0]);
  const [aarData, setAarData] = useState<AARData | null>(null);

  const [sessionHistory, setSessionHistory] = useState<PerformanceHistoryEntry[]>([
    { id: '1', date: '2026-10-01', scenarioTitle: 'Perimeter Breach Alpha', level: 'beginner', overallScore: 68, detectionScore: 75, classificationScore: 70, decisionScore: 60, threatsCount: 1, environment: 'critical_infra', weather: 'clear' },
    { id: '2', date: '2026-10-02', scenarioTitle: 'Urban Fog Incursion', level: 'intermediate', overallScore: 76, detectionScore: 82, classificationScore: 74, decisionScore: 72, threatsCount: 3, environment: 'urban', weather: 'fog' },
    { id: '3', date: '2026-10-03', scenarioTitle: 'Night Mountain Stealth', level: 'professional', overallScore: 85, detectionScore: 90, classificationScore: 82, decisionScore: 83, threatsCount: 5, environment: 'mountain', weather: 'low_vis' }
  ]);

  const handleIntroComplete = () => {
    setCurrentTab('level-select');
    setIsLevelModalOpen(true);
  };

  const handleStartScenario = (scenario: ScenarioConfig) => {
    setActiveScenario(scenario);
    setCurrentTab('simulation');
  };

  const handleFinishScenario = (aar: AARData) => {
    setAarData(aar);
    
    // Add to session history
    const newEntry: PerformanceHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      scenarioTitle: aar.scenarioTitle,
      level: traineeLevel,
      overallScore: aar.metrics.overallScore,
      detectionScore: Math.round(100 - (aar.metrics.detectionTimeAvg * 4)),
      classificationScore: aar.metrics.classificationAccuracy,
      decisionScore: aar.metrics.decisionAccuracy,
      threatsCount: aar.threatCount,
      environment: aar.environment,
      weather: aar.weather
    };
    setSessionHistory(prev => [...prev, newEntry]);

    setCurrentTab('aar');
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col font-mono overflow-hidden">
      
      {/* 1. Cinematic Intro Screen */}
      {currentTab === 'intro' && (
        <CinematicIntro onComplete={handleIntroComplete} />
      )}

      {/* 2. Level Selection Screen Modal */}
      {isLevelModalOpen && (
        <LevelSelectModal
          currentLevel={traineeLevel}
          onSelectLevel={setTraineeLevel}
          onProceed={() => {
            setIsLevelModalOpen(false);
            if (currentTab === 'level-select' || currentTab === 'intro') {
              setCurrentTab('home');
            }
          }}
        />
      )}

      {/* 3. Main Workspace Navigation & Pages (Visible after Intro) */}
      {currentTab !== 'intro' && (
        <>
          <HeaderNav
            currentTab={currentTab}
            onNavigate={setCurrentTab}
            level={traineeLevel}
            onOpenLevelSelect={() => setIsLevelModalOpen(true)}
            onToggleAIDrawer={() => setIsAIDrawerOpen(!isAIDrawerOpen)}
            isAIDrawerOpen={isAIDrawerOpen}
          />

          {/* Main Body Page Render */}
          <main className="flex-1 relative overflow-hidden">
            {currentTab === 'home' && (
              <HomePage
                onNavigate={setCurrentTab}
                level={traineeLevel}
                history={sessionHistory}
              />
            )}

            {currentTab === 'train-config' && (
              <TrainConfigPage
                onStartScenario={handleStartScenario}
              />
            )}

            {currentTab === 'simulation' && (
              <SimulationPage
                scenario={activeScenario}
                onFinishScenario={handleFinishScenario}
                highlightId={highlightId}
              />
            )}

            {currentTab === 'battlefield' && (
              <BattlefieldPage
                onStartScenario={handleStartScenario}
              />
            )}

            {currentTab === 'performance' && (
              <PerformancePage
                history={sessionHistory}
                onStartScenario={handleStartScenario}
              />
            )}

            {currentTab === 'aar' && (
              <AARPage
                aarData={aarData}
                onNavigateHome={() => setCurrentTab('home')}
                onStartNewScenario={() => setCurrentTab('train-config')}
              />
            )}

            {currentTab === 'profile' && (
              <ProfilePage 
                level={traineeLevel} 
                profile={traineeProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPage />
            )}
          </main>

          {/* Persistent AI Training Assistant */}
          <AIAssistantDrawer
            context={{
              currentTab,
              traineeLevel,
              activeScenario,
              scoreSoFar: 85
            }}
            onNavigate={setCurrentTab}
            isOpen={isAIDrawerOpen}
            onToggleOpen={() => setIsAIDrawerOpen(!isAIDrawerOpen)}
            onHighlightElement={setHighlightId}
          />
        </>
      )}

    </div>
  );
}

export default App;
