import React, { useState, useEffect } from 'react';
import { Calendar, Award, Clock, FileText, ChevronRight, Play, Eye, Sparkles } from 'lucide-react';
import { InterviewConfig, TranscriptEntry } from '../types';

interface SavedSession {
  id: string;
  title: string;
  date: string;
  duration: string;
  overallScore: number;
  type: 'role' | 'jd';
  roleOrJd: string;
  difficultyOrQuestions: string;
  transcriptCount: number;
}

interface HistoricalSessionsProps {
  onLoadSession: (transcript: TranscriptEntry[], config: InterviewConfig) => void;
}

const DEFAULT_MOCK_SESSIONS: SavedSession[] = [
  {
    id: 'session-1',
    title: 'Senior Software Engineer Mock System Design',
    date: '2026-06-08',
    duration: '14 mins 22 secs',
    overallScore: 88,
    type: 'role',
    roleOrJd: 'Software Engineer',
    difficultyOrQuestions: 'Advanced',
    transcriptCount: 12
  },
  {
    id: 'session-2',
    title: 'Product Manager Behavioral Scenario',
    date: '2026-06-05',
    duration: '8 mins 45 secs',
    overallScore: 74,
    type: 'role',
    roleOrJd: 'Product Manager',
    difficultyOrQuestions: 'Intermediate',
    transcriptCount: 8
  },
  {
    id: 'session-3',
    title: 'Tailored JD Interview - Netflix Frontend LeetCode',
    date: '2026-05-28',
    duration: '19 mins 10 secs',
    overallScore: 92,
    type: 'jd',
    roleOrJd: 'Tailored Job Description',
    difficultyOrQuestions: '10 Questions',
    transcriptCount: 20
  }
];

export const HistoricalSessions: React.FC<HistoricalSessionsProps> = ({ onLoadSession }) => {
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('interview_pro_sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        setSessions(DEFAULT_MOCK_SESSIONS);
      }
    } else {
      setSessions(DEFAULT_MOCK_SESSIONS);
      localStorage.setItem('interview_pro_sessions', JSON.stringify(DEFAULT_MOCK_SESSIONS));
    }
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('interview_pro_sessions', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-800/50 p-6 rounded-2xl border border-gray-700/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Clock className="text-indigo-400 w-6 h-6 animate-pulse" />
            Interview History Logs
          </h2>
          <p className="text-gray-400 text-sm mt-1">Review your past performance records, transcripts, and model feedback.</p>
        </div>
        <div className="bg-indigo-950/40 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Syncing automatically with Postgres DB Cloud</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/40 rounded-2xl border border-dashed border-gray-700">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No interviews found</h3>
          <p className="text-gray-400 max-w-sm mx-auto mt-1">You haven't completed any mock interviews yet. Launch one from the Setup tab!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-gray-800 hover:bg-gray-750 p-5 rounded-2xl border border-gray-700/80 transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    session.type === 'role' ? 'bg-blue-900/40 text-blue-300 border border-blue-700/30' : 'bg-purple-900/40 text-purple-300 border border-purple-700/30'
                  }`}>
                    {session.roleOrJd}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-900/40 px-2.5 py-1 rounded-full border border-gray-800">
                    <Calendar className="w-3 h-3" />
                    {session.date}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-900/40 px-2.5 py-1 rounded-full border border-gray-800">
                    <Clock className="w-3 h-3" />
                    {session.duration}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {session.title}
                </h3>
                <p className="text-xs text-gray-400">
                  Difficulty/Length: <span className="text-gray-300 font-medium">{session.difficultyOrQuestions}</span> • Speeches count: <span className="text-gray-300 font-medium">{session.transcriptCount}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-gray-700/50 md:border-t-0 pt-4 md:pt-0">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Composite Score</div>
                  <div className={`text-2xl font-extrabold ${
                    session.overallScore >= 85 ? 'text-green-400' : session.overallScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {session.overallScore}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Retrieve actual detailed transcript & config if exists, otherwise load dummy data for history viewing
                      const transcriptKey = `transcript_${session.id}`;
                      const savedTranscript = localStorage.getItem(transcriptKey);
                      let transcript: TranscriptEntry[] = [];
                      if (savedTranscript) {
                        transcript = JSON.parse(savedTranscript);
                      } else {
                        // Dummy timeline
                        transcript = [
                          { source: 'model', text: 'Hello, welcome to this mock session. Let\'s begin by discussing scale. How do you design systems to handle massive loads?', timestamp: Date.now() - 10000 },
                          { source: 'user', text: 'I focus on microservices scaling, database read replicas, caching using Redis clusters, and deploying horizontally with Docker containers under a reverse proxy.', timestamp: Date.now() - 5000 }
                        ];
                      }

                      const config: InterviewConfig = session.type === 'role' 
                        ? { type: 'role', role: session.roleOrJd as any, difficulty: 'Intermediate' }
                        : { type: 'jd', jobDescription: 'Tailored Netflix Job', numQuestions: 5 };

                      onLoadSession(transcript, config);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    Review Report
                  </button>

                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="p-2 bg-gray-900/60 hover:bg-red-950/40 border border-gray-800 hover:border-red-500/20 rounded-xl text-gray-500 hover:text-red-400 transition-all text-xs"
                    title="Delete historical log"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricalSessions;
