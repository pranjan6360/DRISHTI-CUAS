import { TrainingLevel, NavigationTab, ScenarioConfig, AerialThreat, WorkflowPhase } from '../types';

export interface AssistantContext {
  currentTab: NavigationTab;
  traineeLevel: TrainingLevel;
  activeScenario?: ScenarioConfig | null;
  activePhase?: WorkflowPhase;
  selectedThreat?: AerialThreat | null;
  scoreSoFar?: number;
  lastMistake?: string | null;
  geminiApiKey?: string;
}

// Declarations for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceAssistantEngine {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private isVoiceEnabled: boolean = true;
  private speechRate: number = 0.95; // Slightly slower for clear tactical instruction
  private onSpeechResultCallback?: (text: string) => void;
  private onListeningStateChange?: (listening: boolean) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (this.onSpeechResultCallback) {
            this.onSpeechResultCallback(transcript);
          }
          this.setListening(false);
        };

        this.recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          this.setListening(false);
        };

        this.recognition.onend = () => {
          this.setListening(false);
        };
      }

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public isSpeechSupported(): boolean {
    return !!this.recognition;
  }

  public setCallbacks(
    onResult: (text: string) => void,
    onListeningChange: (listening: boolean) => void
  ) {
    this.onSpeechResultCallback = onResult;
    this.onListeningStateChange = onListeningChange;
  }

  public toggleListening(): boolean {
    if (!this.recognition) return false;

    if (this.isListening) {
      this.recognition.stop();
      this.setListening(false);
    } else {
      try {
        this.recognition.start();
        this.setListening(true);
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
        this.setListening(false);
      }
    }
    return this.isListening;
  }

  private setListening(val: boolean) {
    this.isListening = val;
    if (this.onListeningStateChange) {
      this.onListeningStateChange(val);
    }
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  public speak(text: string) {
    if (!this.isVoiceEnabled || !this.synth) return;
    this.synth.cancel(); // Stop prior speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;
    
    // Select an English voice if available
    const voices = this.synth.getVoices();
    const engVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Zira')));
    if (engVoice) {
      utterance.voice = engVoice;
    }

    this.synth.speak(utterance);
  }

  // Enhanced local rule-based tactical intelligence engine
  public generateResponse(userPrompt: string, context: AssistantContext): { text: string; highlightId?: string } {
    const q = userPrompt.toLowerCase();
    const { currentTab, traineeLevel, activeScenario, activePhase, selectedThreat, lastMistake } = context;

    // 1. COMPREHENSIVE PLATFORM KNOWLEDGE BASE ANSWERS

    if (q.includes('classify') || q.includes('how to classify')) {
      return {
        text: "CLASSIFICATION GUIDANCE: Open the yellow 'CLASSIFY TARGET PROFILE' modal. Compare the target RCS (m²) & Speed (km/h):\n• Micro Multirotor: RCS ~0.05m², Speed <50 km/h.\n• Fixed-Wing Recon: RCS ~0.15m², Speed 60-140 km/h.\n• Fast Strike UAV: RCS >0.20m², Speed >150 km/h.\n• Decoy / Non-Threat: Non-hostile thermal signature.",
        highlightId: 'classify-btn'
      };
    }

    if (q.includes('multiple') || q.includes('select drone') || q.includes('swarm') || q.includes('switch target')) {
      return {
        text: "MULTIPLE DRONE THREAT SELECTION: Use the TARGET ACQUISITION STRIP above the radar scope (showing T-01, T-02, T-03...) to switch focus between active drones. Once you engage one drone, the system will automatically advance to the next active threat!",
        highlightId: 'radar-panel'
      };
    }

    if (q.includes('jam') || q.includes('rf') || q.includes('countermeasure') || q.includes('protocol')) {
      return {
        text: "COUNTER-MEASURE PROTOCOLS:\n1) Soft-Kill Directional RF Jammer: Disrupts 2.4/5.8 GHz control frequencies (Best for Micro Multirotors).\n2) Kinetic Catch Net: Deploys net tether capture (Best in populated urban zones).\n3) Track & Monitor: Maintains surveillance without active engagement (Best for Decoys/Wildlife).",
        highlightId: 'decision-btn'
      };
    }

    if (q.includes('battlefield') || q.includes('field') || q.includes('regenerate')) {
      return {
        text: "SIMULATED FIELD ASSESSMENT: Generates procedural scenarios using a seed. Clicking 'GENERATE NEW FIELD' updates the seed, environment, weather, sensor dropouts, and threat trajectories dynamically to test adaptiveness without rote learning."
      };
    }

    if (q.includes('replay') || q.includes('aar') || q.includes('timeline')) {
      return {
        text: "AFTER ACTION REVIEW (AAR): Inspect your decision tree audit logs, score breakdown, and use the 2D/3D Trajectory Replay scrubber (with Play, Pause, 1X, 2X, 4X playback speeds) to analyze your drill performance."
      };
    }

    if (q.includes('profile') || q.includes('rank') || q.includes('service id')) {
      return {
        text: "DEFENSE PROFILE: Edit your Full Name, Rank (Captain, Major, Colonel), Service ID, Armed Forces Branch (Army, Air Force, Navy), Unit, and Base Location in the Profile tab."
      };
    }

    if (q.includes('start training') || q.includes('begin scenario')) {
      return { 
        text: "Navigating to Scenario Configurator. Select your operational environment, weather, sensor degradation, and threat parameters." 
      };
    }

    if (q.includes('performance') || q.includes('show score') || q.includes('readiness')) {
      return { 
        text: "Opening Performance Analytics. Reviewing historical readiness progression across detection speed, classification precision, and decision accuracy." 
      };
    }

    if (q.includes('why did i lose points') || q.includes('mistake')) {
      if (lastMistake) {
        return { text: `Point Deduction Rationale: ${lastMistake}` };
      }
      return { 
        text: "WHAT CAUSES POINT DEDUCTION: 1) Misclassifying non-hostile decoys or wildlife as hostile drones (-25 PTS). 2) Executing kinetic soft-kill jammer strikes against non-threat tracks (-35 PTS). 3) Delaying radar track acquisition beyond 15 seconds (-10 PTS)." 
      };
    }

    if (q.includes('explain this screen') || q.includes('where am i') || q.includes('overview')) {
      switch (currentTab) {
        case 'home':
          return { text: "Central Command Dashboard. Use 'TRAIN ME' to customize a scenario, 'SIMULATED FIELD' for a blind assessment, or 'PERFORMANCE' to inspect capability analytics." };
        case 'train-config':
          return { text: "Scenario Configurator. Customize environment terrain, weather visibility, sensor noise condition, and threat count from 1 to 10 aerial objects." };
        case 'simulation':
          return { 
            text: "Tactical Operational Workstation. On the left is the 3D visual viewport and EO/IR thermal scope. On the right is the 360° P-80 circular radar scope. At the top is your 8-phase workflow bar.",
            highlightId: 'radar-panel'
          };
        case 'battlefield':
          return { text: "Simulated Field Exercise. This is a blind evaluation mode where scenario parameters are procedurally seeded without pre-briefing." };
        case 'aar':
          return { text: "After Action Review Dashboard. Inspect metrics breakdown, decision tree event audit timeline, and 2D/3D trajectory replay." };
        case 'performance':
          return { text: "Performance Analytics. View your 5-axis capability radar chart and launch AI-recommended adaptive drills." };
        default:
          return { text: "You are navigating DRISHTI AI-Enabled Drone Threat Simulation Trainer." };
      }
    }

    // 2. DETAILED STEP-BY-STEP GUIDANCE DURING SIMULATION WORKSTATION
    if (currentTab === 'simulation' || currentTab === 'battlefield') {
      
      if (q.includes('what to do') || q.includes('how to do') || q.includes('why') || q.includes('guide me') || q.includes('help') || q.includes('next step') || q.includes('what should i do')) {
        
        if (traineeLevel === 'professional') {
          return { 
            text: "PROFESSIONAL ASSESSMENT MODE ACTIVE: Monitor the 360° radar sweep for track blips, cross-reference RCS and thermal signatures, and execute counter-measures independently without direct hints." 
          };
        }

        switch (activePhase) {
          case 1:
          case 2:
            return { 
              text: `PHASE 2: DETECT & LOCK TARGET TRACK.
• WHAT TO DO: Locate and lock onto an approaching aerial track blip on the radar scope.
• HOW TO DO IT: Look at the circular radar scope on the right side of your workstation. Click directly on track blip '${selectedThreat?.id || 'T-01'}' or click the glowing 'LOCK & TRACK TARGET' button.
• WHY TO DO IT: Military air-defense doctrine dictates rapid track acquisition within 10 seconds of perimeter entry to maintain track continuity.
• WHAT NOT TO DO: Do not delay track acquisition. Unchecked tracks increase tactical response latency.`,
              highlightId: 'radar-panel'
            };

          case 3:
            return { 
              text: `PHASE 3: TRACKING & TELEMETRY INSPECTION.
• WHAT TO DO: Monitor telemetry parameters for target ${selectedThreat?.id || 'T-01'}.
• HOW TO DO IT: Inspect altitude (${selectedThreat?.altitude || 120}m), speed (${selectedThreat?.speed || 45} km/h), Radar Cross-Section (${selectedThreat?.sensorSignature.radarRCS || 0.05} m²), and switch to the EO/IR Thermal Camera view on the left viewport.
• WHY TO DO IT: Tracking establishes speed, trajectory, and thermal signature profile before making classification decisions.
• WHAT NOT TO DO: Do not execute engagement actions before completing target classification!`,
              highlightId: 'eo-camera-panel'
            };

          case 4:
            return { 
              text: `PHASE 4: TARGET PROFILE CLASSIFICATION.
• WHAT TO DO: Classify the target into its exact drone profile category.
• HOW TO DO IT: Click the yellow 'CLASSIFY TARGET PROFILE' button. Inspect the RCS and thermal parameters: RCS ~0.05m² indicates Micro Multirotor; RCS ~0.25m² with high thermal exhaust indicates Fast Strike UAV; non-threat signatures indicate Decoy.
• WHY TO DO IT: Accurate classification prevents collateral damage and ensures selection of the appropriate counter-measure protocol.
• WHAT NOT TO DO: Do not guess blindly! Verify signatures in the thermal camera scope first.`,
              highlightId: 'classify-btn'
            };

          case 5:
            return { 
              text: `PHASE 5: THREAT INTENT ASSESSMENT.
• WHAT TO DO: Assess whether target ${selectedThreat?.id || 'T-01'} is HOSTILE or NON-THREAT/DECOY.
• HOW TO DO IT: Click 'FLAG HOSTILE' if the drone is heading toward critical infrastructure. Click 'FLAG DECOY/NON-THREAT' if it is a bird flock or civilian balloon.
• WHY TO DO IT: Threat assessment determines whether rules of engagement permit active containment.
• WHAT NOT TO DO: Do not flag non-hostile decoys as hostile; doing so wastes counter-measures and degrades your readiness score.`,
              highlightId: 'assess-btn'
            };

          case 6:
            return { 
              text: `PHASE 6: COUNTER-MEASURE DECISION EXECUTION.
• WHAT TO DO: Select and execute an abstract simulated counter-measure protocol.
• HOW TO DO IT: Click the green 'EXECUTE COUNTER-MEASURE' button and choose:
  - Directional RF Jamming for multirotors & quadcopters.
  - Kinetic Catch Net for low-altitude urban targets.
  - Track & Monitor for non-hostile decoys.
• WHY TO DO IT: Soft-kill directional jamming disables control frequencies without explosive collateral disruption in civilian zones.
• WHAT NOT TO DO: Do not fire kinetic interceptors at passive non-hostile decoys!`,
              highlightId: 'decision-btn'
            };

          case 7:
          case 8:
            return { 
              text: `PHASE 8: DRILL EVALUATION & AAR GENERATION.
• WHAT TO DO: Click 'FINISH SCENARIO & GENERATE AAR' to open your after-action review.
• HOW TO DO IT: Click the trophy button at the bottom right control panel.
• WHY TO DO IT: Inspecting decision tree audit logs and trajectory replays reinforces correct tactical habits.`
            };

          default:
            return { 
              text: "Review target telemetry on the radar scope and follow the 8-phase workflow bar at the top.",
              highlightId: 'radar-panel'
            };
        }
      }
    }

    // Default Contextual Response
    if (traineeLevel === 'beginner') {
      return { 
        text: "BEGINNER GUIDANCE ONLINE: I will provide complete step-by-step instructions. Ask me 'What to do', 'How to classify', or 'How to select drones' at any point during your drill." 
      };
    } else if (traineeLevel === 'intermediate') {
      return { 
        text: "INTERMEDIATE PROFICIENCY MODE: Contextual warnings active. I will alert you if sensor ambiguities occur on radar or thermal scopes." 
      };
    } else {
      return { 
        text: "PROFESSIONAL ASSESSMENT MODE: All tactical decisions are recorded silently and evaluated in the After Action Review." 
      };
    }
  }
}

export const voiceAssistant = new VoiceAssistantEngine();
