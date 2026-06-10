import React, { useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Award, Zap, Trophy, TrendingUp, Compass, Target, BrainCircuit } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  // Mock data for beautiful data-driven rendering of Pro-level reports
  const skillMatrixData = [
    { subject: 'Technical Knowledge', rating: 85, fullMark: 100 },
    { subject: 'Communication Clarity', rating: 78, fullMark: 100 },
    { subject: 'Confidence Level', rating: 92, fullMark: 100 },
    { subject: 'Problem Solving', rating: 88, fullMark: 100 },
    { subject: 'Leadership Ability', rating: 68, fullMark: 100 },
    { subject: 'Cultural Chemistry', rating: 84, fullMark: 100 },
  ];

  const historicalTrends = [
    { session: 'Session 1', Technical: 68, Communication: 72, Confidence: 80, Overall: 73 },
    { session: 'Session 2', Technical: 75, Communication: 74, Confidence: 85, Overall: 78 },
    { session: 'Session 3', Technical: 84, Communication: 80, Confidence: 88, Overall: 84 },
    { session: 'Session 4', Technical: 85, Communication: 78, Confidence: 92, Overall: 88 },
  ];

  const behavioralMetrics = [
    { name: 'Eye Contact Compliance', percentage: 94 },
    { name: 'Attention Focus Index', percentage: 88 },
    { name: 'Smile & Warmth Index', percentage: 76 },
    { name: 'Swaying/Stability Alignment', percentage: 90 },
  ];

  // Calculate stats based on trends
  const averageOverallScore = useMemo(() => {
    return Math.round(historicalTrends.reduce((acc, curr) => acc + curr.Overall, 0) / historicalTrends.length);
  }, []);

  return (
    <div className="space-y-6">
      {/* Upper Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-900/60 to-gray-800 p-5 rounded-2xl border border-indigo-500/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-indigo-300 font-semibold tracking-wider uppercase">Composite rating</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{averageOverallScore}%</h3>
            </div>
            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-green-400 mt-4 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+15% increase past 30 days</span>
          </div>
        </div>

        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Interviews Done</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{historicalTrends.length}</h3>
            </div>
            <div className="p-3 bg-gray-900/60 rounded-xl text-gray-400">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Required level for Pro certification: 10</p>
        </div>

        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Peak Competency</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">Confidence</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-green-400 mt-4 flex items-center gap-1 font-medium">
            <span>92% - Outstanding Skill Level</span>
          </p>
        </div>

        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Area of Growth</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">Leadership</h3>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Compass className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-yellow-400 mt-4">Needs structured behavioral answers</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart: Skill Breakdown */}
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700/60">
          <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Interviewer Competency Matrix
          </h4>
          <p className="text-xs text-gray-400 mb-4">6-dimension feedback coverage mapped over standard executive requirements.</p>
          <div className="w-full h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="80%" data={skillMatrixData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4B5563' }} />
                <Radar name="Candidate Rating" dataKey="rating" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#fff' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Progression over sessions */}
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700/60">
          <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Performance Trend Lines
          </h4>
          <p className="text-xs text-gray-400 mb-4">Visualization of score upgrades mapped across preceding mock sessions.</p>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrends} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="session" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis domain={[50, 100]} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Overall" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Technical" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="Communication" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Bar Chart: Face/Video Behavioral intelligence */}
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700/60 lg:col-span-2">
          <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-green-400" />
            Computer Vision Video Intelligence Pipeline (Phase 11)
          </h4>
          <p className="text-xs text-gray-400 mb-4">Simulated computer vision metrics scoring eye alignment, attention posture stability, and greeting micro-movements.</p>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={behavioralMetrics} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
                <CartesianGrid stroke="#374151" strokeDasharray="2 2" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#E5E7EB', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#fff' }} />
                <Bar dataKey="percentage" fill="#10b981" radius={[0, 10, 10, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
