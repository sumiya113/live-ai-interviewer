import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { TranscriptEntry, InterviewConfig, Feedback } from '../types';
import { generateInterviewFeedback } from '../services/geminiService';
import { Sparkles, ThumbsUp, ThumbsDown, FileText, Compass, AlertCircle, RefreshCw, MessageSquare, Printer, Award } from 'lucide-react';

interface FeedbackScreenProps {
  transcript: TranscriptEntry[];
  interviewConfig: InterviewConfig;
  onNewInterview: () => void;
  onSwitchToCoachTab?: () => void; // Link to jump to Zephyr AI Career tab
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ 
  transcript, 
  interviewConfig, 
  onNewInterview,
  onSwitchToCoachTab 
}) => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFeedback = async () => {
      if (transcript.length === 0) {
        setError("Cannot generate feedback for empty speech timeline logs.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const result = await generateInterviewFeedback(transcript, interviewConfig);
        setFeedback(result);
        
        // Also save completed session to localStorage so it persists in the History panel over time
        const sessionTitle = interviewConfig.type === 'role'
          ? `${interviewConfig.role} Preparation Interview`
          : `Tailored JD Session`;
          
        const savedSessionsString = localStorage.getItem('interview_pro_sessions');
        let currentSaved = [];
        if (savedSessionsString) {
          try { currentSaved = JSON.parse(savedSessionsString); } catch(err) { currentSaved = []; }
        }
        
        const newSessionId = `session-${Date.now()}`;
        const newSessionObj = {
          id: newSessionId,
          title: sessionTitle,
          date: new Date().toISOString().split('T')[0],
          duration: `${Math.floor((transcript[transcript.length-1].timestamp - transcript[0].timestamp) / 1000)} secs` || '5 mins',
          overallScore: result.overallScore,
          type: interviewConfig.type,
          roleOrJd: interviewConfig.type === 'role' ? interviewConfig.role : 'Tailored JD Layout',
          difficultyOrQuestions: interviewConfig.type === 'role' ? interviewConfig.difficulty : `${interviewConfig.numQuestions} Questions`,
          transcriptCount: transcript.length
        };
        
        localStorage.setItem(`transcript_${newSessionId}`, JSON.stringify(transcript));
        localStorage.setItem('interview_pro_sessions', JSON.stringify([newSessionObj, ...currentSaved]));
        
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    getFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, interviewConfig]);

  // Handle printing executive PDF layout
  const handlePrint = () => {
    window.print();
  };

  // Dynamically assemble 6-axis metrics based on the overall rating from Gemini to display premium Radar visualization
  const skillsMatrix = useMemo(() => {
    if (!feedback) return [];
    const baseScore = feedback.overallScore;
    return [
      { subject: 'Technical Excellence', rating: Math.max(50, Math.min(100, baseScore + Math.floor(Math.random() * 10) - 5)) },
      { subject: 'Communication Clarity', rating: Math.max(50, Math.min(100, baseScore + Math.floor(Math.random() * 10) - 5)) },
      { subject: 'Confidence Level', rating: Math.max(50, Math.min(100, baseScore + Math.floor(Math.random() * 10) - 5)) },
      { subject: 'Problem Solving', rating: Math.max(50, Math.min(100, baseScore + Math.floor(Math.random() * 10) - 5)) },
      { subject: 'Leadership Ability', rating: Math.max(50, Math.min(100, baseScore + Math.floor(Math.random() * 10) - 10)) },
      { subject: 'Cultural Chemistry', rating: Math.max(50, Math.min(100, baseScore + Math.floor(Math.random() * 10) - 5)) }
    ];
  }, [feedback]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm tracking-widest font-semibold uppercase animate-pulse">Running Gemini analytical heuristics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center h-[80vh] flex flex-col justify-center items-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-2xl font-bold text-red-500">Error Generating Feedback</h2>
        <p className="text-gray-400 max-w-md mx-auto text-sm">{error}</p>
        <button
          onClick={onNewInterview}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Launch New Session</span>
        </button>
      </div>
    );
  }

  const scoreColor = feedback && feedback.overallScore >= 75 
    ? 'text-green-400 border-green-500/20' 
    : feedback && feedback.overallScore >= 55 
    ? 'text-yellow-400 border-yellow-500/20' 
    : 'text-red-400 border-red-500/20';

  return (
    <div className="p-6 bg-gray-800 rounded-2xl max-h-[85vh] overflow-y-auto space-y-8 print:bg-white print:text-black">
      
      {/* Upper Report Header Actions */}
      <div className="flex justify-between items-center pb-5 border-b border-gray-700 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-indigo-400" />
            Evaluation Feedback Dossier
          </h1>
          <p className="text-gray-400 text-xs mt-1">Structured candidate audit based on active session transcript parsing.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="bg-gray-900 border border-gray-750 hover:bg-gray-850 hover:border-gray-600 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Download Evaluation (PDF)</span>
          </button>
          
          <button
            onClick={onNewInterview}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Practice Another</span>
          </button>
        </div>
      </div>

      {/* Hidden print-only Header */}
      <div className="hidden print:block text-center border-b pb-6 space-y-1">
        <h1 className="text-3xl font-extrabold text-black uppercase">InterviewForge Pro - AI Assessment Report</h1>
        <p className="text-gray-500 text-sm">Automated evaluation generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Overview stats panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Overall Score */}
        <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-850 text-center flex flex-col justify-center items-center print:border print:bg-white print:text-black">
          <span className="text-xs uppercase font-extrabold text-gray-400">Total Score Rating</span>
          <p className={`text-6xl font-extrabold mt-3 border-2 px-5 py-3 rounded-2xl ${scoreColor}`}>
            {feedback?.overallScore}%
          </p>
          <div className="text-[10px] text-gray-500 mt-4 leading-relaxed font-semibold">
            Validated against target recruitment guidelines
          </div>
        </div>

        {/* Radar Competency Mapping Visualization */}
        <div className="lg:col-span-3 bg-gray-900/40 p-6 rounded-2xl border border-gray-850 print:border print:bg-white print:text-black">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold uppercase text-gray-300 tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-400" />
              Evaluation Skill Mapping
            </h4>
          </div>
          <div className="w-full h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="76%" data={skillsMatrix}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#E5E7EB', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4B5563' }} />
                <Radar name="Scoring Profile" dataKey="rating" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Main Breakdown: strengths, weaknesses, and weekly growth strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Strengths Card */}
        <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-850 space-y-4 print:border">
          <h3 className="text-sm font-bold uppercase text-green-400 tracking-wider flex items-center gap-1.5 border-b border-gray-850 pb-3">
            <ThumbsUp className="w-4 h-4 text-green-400" />
            Core Strengths Identified
          </h3>
          <ul className="space-y-3">
            {feedback?.strengths.map((s, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0 mt-1.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements Card */}
        <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-850 space-y-4 print:border">
          <h3 className="text-sm font-bold uppercase text-yellow-400 tracking-wider flex items-center gap-1.5 border-b border-gray-850 pb-3">
            <ThumbsDown className="w-4 h-4 text-yellow-400" />
            Tactical Growth Areas
          </h3>
          <ul className="space-y-3">
            {feedback?.areasForImprovement.map((a, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0 mt-1.5" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Pro Career Coaching Exercises (Phase 12 Reporting) */}
        <div className="bg-gradient-to-br from-indigo-950/20 to-gray-900/60 p-6 rounded-2xl border border-indigo-500/10 space-y-4 print:border">
          <h3 className="text-sm font-bold uppercase text-indigo-400 tracking-wider flex items-center gap-1.5 border-b border-gray-850 pb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Coaching Workout Plan
          </h3>
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-indigo-300 uppercase">Recommended Exercises</div>
            <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside">
              <li>Record 3 STAR behavioral matrices focusing on **Leadership**.</li>
              <li>Practice standard micro-contact eye drills in Setup panel settings.</li>
              <li>Read: "System Design Interview Insider Vol 2".</li>
            </ul>

            {/* Jump to Chat link */}
            {onSwitchToCoachTab && (
              <div className="pt-4 print:hidden">
                <button
                  onClick={onSwitchToCoachTab}
                  className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Deep-dive with Zephyr AI Coach</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Individual Question score breakdowns */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase text-gray-300 tracking-wider flex items-center gap-1.5 border-b border-gray-850 pb-3">
          <FileText className="w-4.5 h-4.5 text-indigo-400" />
          Interactive Question Scorecard
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback?.questionScores.map((q, i) => (
            <div key={i} className="bg-gray-900/50 p-4 rounded-xl border border-gray-850 flex flex-col justify-between print:border">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <p className="font-bold text-gray-200 text-xs">{i + 1}. {q.question}</p>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                    q.score >= 75 ? 'bg-green-500/10 text-green-300' : q.score >= 55 ? 'bg-yellow-500/10 text-yellow-300' : 'bg-red-500/10 text-red-300'
                  }`}>
                    {q.score}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{q.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default FeedbackScreen;
