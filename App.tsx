import React, { useState, useCallback, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import InterviewScreen from './components/InterviewScreen';
import FeedbackScreen from './components/FeedbackScreen';
import HistoricalSessions from './components/HistoricalSessions';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CoachChat from './components/CoachChat';
import SaasPricing from './components/SaaSPricing';
import SettingsPanel from './components/SettingsPanel';
import LandingPage from './components/LandingPage';
import PlaygroundSession from './components/PlaygroundSession';
import { useAuth } from './hooks/useAuth';
import { AppState, TranscriptEntry, InterviewConfig } from './types';
import { 
  Sparkles, 
  Settings, 
  HelpCircle, 
  Video, 
  Compass, 
  BarChart3, 
  MessageSquare, 
  CreditCard, 
  Clock, 
  LogOut, 
  BrainCircuit,
  LayoutDashboard
} from 'lucide-react';

const App: React.FC = () => {
  const { user, loading, login, logout, isRealFirebase } = useAuth();
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [activeTab, setActiveTab] = useState<'setup' | 'history' | 'analytics' | 'coach' | 'pricing' | 'settings' | 'playground'>('setup');
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [showLanding, setShowLanding] = useState(true);

  // Return to landing page if user is signed out
  useEffect(() => {
    if (!loading && !user) {
      setShowLanding(true);
    }
  }, [user, loading]);

  const handleStartInterview = useCallback((config: InterviewConfig) => {
    setInterviewConfig(config);
    setTranscript([]);
    setAppState(AppState.INTERVIEW);
  }, []);

  const handleFinishInterview = useCallback((finalTranscript: TranscriptEntry[]) => {
    setTranscript(finalTranscript);
    setAppState(AppState.FEEDBACK);
  }, []);

  const handleNewInterview = useCallback(() => {
    setInterviewConfig(null);
    setTranscript([]);
    setAppState(AppState.SETUP);
    setActiveTab('setup');
  }, []);

  // Callback to view report from History tab
  const handleLoadSession = useCallback((loadedTranscript: TranscriptEntry[], loadedConfig: InterviewConfig) => {
    setTranscript(loadedTranscript);
    setInterviewConfig(loadedConfig);
    setAppState(AppState.FEEDBACK);
  }, []);

  // Render current display contents based on active status
  const renderTabContent = () => {
    switch (activeTab) {
      case 'setup':
        return <SetupScreen onStart={handleStartInterview} onEnterPlayground={() => setActiveTab('playground')} />;
      case 'playground':
        return <PlaygroundSession />;
      case 'history':
        return <HistoricalSessions onLoadSession={handleLoadSession} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'coach':
        return <CoachChat />;
      case 'pricing':
        return <SaasPricing />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <SetupScreen onStart={handleStartInterview} />;
    }
  };

  const renderContent = () => {
    if (showLanding) {
      return (
        <LandingPage 
          onEnterApp={() => {
            setShowLanding(false);
            setActiveTab('setup');
          }}
          onEnterPlans={() => {
            setShowLanding(false);
            setActiveTab('pricing');
          }}
          user={user}
          loading={loading}
          login={login}
          logout={logout}
          isRealFirebase={isRealFirebase}
        />
      );
    }

    if (appState === AppState.INTERVIEW) {
      if (!interviewConfig) {
        return <SetupScreen onStart={handleStartInterview} />;
      }
      return <InterviewScreen interviewConfig={interviewConfig} onFinish={handleFinishInterview} />;
    }

    if (appState === AppState.FEEDBACK) {
      if (!interviewConfig) {
        return <SetupScreen onStart={handleStartInterview} />;
      }
      return (
        <FeedbackScreen 
          transcript={transcript} 
          interviewConfig={interviewConfig} 
          onNewInterview={handleNewInterview}
          onSwitchToCoachTab={() => setActiveTab('coach')}
        />
      );
    }

    // Default dashboard layout
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start w-full print:block">
        
        {/* Left Side Sidebar: Tab Controllers */}
        <div className="lg:col-span-1 bg-gray-800 p-5 rounded-2xl border border-gray-750 flex flex-col justify-between h-auto lg:min-h-[640px] space-y-6 print:hidden">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg border border-indigo-400">
                F
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">InterviewForge</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">APEX Platform</p>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setShowLanding(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left text-gray-400 hover:text-white hover:bg-gray-855"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Product Home</span>
              </button>

              <button
                onClick={() => setActiveTab('setup')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'setup' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-gray-850'}`}
              >
                <Video className="w-4 h-4" />
                <span>Launch Interview</span>
              </button>

              <button
                onClick={() => setActiveTab('playground')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'playground' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-gray-850'}`}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Playground</span>
                <span className="ml-auto text-[9px] bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-300 font-bold tracking-wider">LIVE</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-gray-850'}`}
              >
                <Clock className="w-4 h-4" />
                <span>Session Logs</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-gray-850'}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Competency Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('coach')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'coach' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-gray-850'}`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Zephyr AI Coach</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-green-500"></span>
              </button>

              <button
                onClick={() => setActiveTab('pricing')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'pricing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-gray-850'}`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Upgrade License</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-gray-850'}`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings Panel</span>
              </button>
            </div>
          </div>

          {/* User badge */}
          <div className="border-t border-gray-750/80 pt-4 flex items-center justify-between gap-2.5 px-1.5 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-indigo-500/30 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-650 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {user?.displayName?.charAt(0) || "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-white leading-none truncate">{user?.displayName || "Candidate"}</p>
                <p className="text-[10px] text-gray-500 mt-1 truncate">{user?.email || "Signed In"}</p>
              </div>
            </div>
            
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-850/80 transition-all flex-shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Tab Content Screen */}
        <div className="lg:col-span-4 w-full">
          {renderTabContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto py-4 print:p-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
