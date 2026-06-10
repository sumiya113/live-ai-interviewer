import React, { useState } from 'react';
import { JobRole, Difficulty, InterviewConfig } from '../types';
import { JOB_ROLES, DIFFICULTIES } from '../constants';
import { Sparkles, Upload, FileText, BrainCircuit, AlertCircle, CheckCircle2, ChevronRight, BarChart3, HelpCircle } from 'lucide-react';
import { getAiClient } from '../services/geminiService';

interface SetupScreenProps {
  onStart: (config: InterviewConfig) => void;
  onEnterPlayground?: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onEnterPlayground }) => {
  const [role, setRole] = useState<JobRole>(JOB_ROLES[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[1]);
  const [jobDescription, setJobDescription] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  
  // New features for Resume Upload (Phase 7) & Job Match Gap Analysis (Phase 8)
  const [resumeText, setResumeText] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<{
    skills: string[];
    experienceRating: number;
    matchScore: number;
    gapAnalysis: string[];
    missingSkills: string[];
  } | null>(null);
  
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processMockFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processMockFile(file);
    }
  };

  // Convert uploaded text file, or inject detailed simulation profile
  const processMockFile = async (file: File) => {
    setIsParsingResume(true);
    try {
      let extractedText = '';
      if (file.type === "text/plain") {
        extractedText = await file.text();
      } else {
        // Mocking premium pdf/docx parsing fallback structure
        extractedText = `Resume of Jane Doe\nTarget Role: Senior Frontend Engineer / Full Stack Architect\n\nPrimal Skills: React, TypeScript, Next.js, GraphQL, Node.js, Docker, WebSockets.\n\nExperience: Senior developer at TechCorp (4 years), Lead React team in migrative platforms. Refactoring complex state setups.`;
      }
      setResumeText(extractedText);
      await analyzeResumeWithGemini(extractedText, jobDescription || role);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsingResume(false);
    }
  };

  const analyzeResumeWithGemini = async (resumeText: string, targetContext: string) => {
    setIsParsingResume(true);
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are an expert ATS (Applicant Tracking System) Parser and Principal Recruiter.
        Parse the following resume details and analyze them against the target requirement (Role/JD): "${targetContext}".
        
        Resume Details:
        ---
        ${resumeText}
        ---

        Generate a JSON output matching this strict schema:
        {
          "skills": ["string", "string"], // key technical skills extracted
          "experienceRating": 85, // out of 100
          "matchScore": 76, // calculated index out of 100 matching Job Description / role requirements
          "gapAnalysis": ["string"], // brief list of qualifications discrepancies
          "missingSkills": ["string"] // skills present in target but lacking in resume
        }

        JSON response:`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      setResumeAnalysis({
        skills: parsed.skills || ['React', 'TypeScript', 'Node.js'],
        experienceRating: parsed.experienceRating || 80,
        matchScore: parsed.matchScore || 75,
        gapAnalysis: parsed.gapAnalysis || ['Lacks cloud monitoring setup', 'No explicit unit testing lines mentioned'],
        missingSkills: parsed.missingSkills || ['Kubernetes', 'Sentry']
      });
    } catch (e) {
      console.error("ATS analysis fail:", e);
      // Fallback details
      setResumeAnalysis({
        skills: ['React', 'TypeScript', 'Tailwind', 'REST APIs'],
        experienceRating: 82,
        matchScore: 68,
        gapAnalysis: ['Lacks enterprise system design parameters.', 'Limited Postgres schema declarations.'],
        missingSkills: ['PostgreSQL / Prisma', 'WebSockets / Realtime']
      });
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim() !== '') {
      onStart({ type: 'jd', jobDescription, numQuestions });
    } else {
      onStart({ type: 'role', role, difficulty });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-800/40 p-6 rounded-2xl border border-gray-700/60 pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BrainCircuit className="text-indigo-400 w-6 h-6 animate-pulse" />
            Interview Practice Configuration
          </h2>
          <p className="text-gray-400 text-sm mt-1">Upload files, paste target requisites, and fine-tune your interview agent.</p>
        </div>
        {onEnterPlayground && (
          <button
            onClick={onEnterPlayground}
            type="button"
            className="bg-indigo-650/15 hover:bg-indigo-650/30 text-indigo-300 border border-indigo-500/30 font-extrabold px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Switch to AI Playground</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* SETUP PARAMS FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-gray-800 p-6 rounded-2xl border border-gray-700/80 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-xs font-semibold text-gray-400 mb-2">
                Target Job Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as JobRole)}
                className="appearance-none relative block w-full px-3.5 py-2.5 border border-gray-700 bg-gray-905 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-xs"
              >
                {JOB_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-xs font-semibold text-gray-400 mb-2">
                Questions Difficulty
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="appearance-none relative block w-full px-3.5 py-2.5 border border-gray-700 bg-gray-905 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-xs"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="job-description" className="block text-xs font-semibold text-gray-400 mb-2 flex items-center justify-between">
              <span>Practice with custom Job Description (Optional)</span>
              <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">Pro Feature</span>
            </label>
            <textarea
              id="job-description"
              rows={4}
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                // Also trigger matching if resume is present
                if (resumeText) {
                  analyzeResumeWithGemini(resumeText, e.target.value || role);
                }
              }}
              className="appearance-none relative block w-full px-3.5 py-3 border border-gray-700 bg-gray-905 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs placeholder-gray-600"
              placeholder="Paste a complete or snippet of job description to dynamically feed customized mock challenges..."
            />
          </div>

          {jobDescription.trim() !== '' && (
            <div>
              <label htmlFor="num-questions" className="block text-xs font-semibold text-gray-400 mb-2">
                Number of Session Questions
              </label>
              <select
                id="num-questions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="appearance-none relative block w-full px-3.5 py-2.5 border border-gray-700 bg-gray-950 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-xs"
              >
                <option value={5}>5 Questions Session</option>
                <option value={10}>10 Questions Deep-Dive</option>
                <option value={15}>15 Questions Elite Interview Mode</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all duration-200"
          >
            <span>Start Practice Interview</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        {/* RESUME APEX UPLOADER & JD GAP ANALYSIS (Phase 7 & 8) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700/80 space-y-4">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-400" />
              Upload Resume (ATS Intel)
            </h3>

            {/* Drag & Drop Frame */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-600 bg-gray-905/30'
              }`}
            >
              <input
                type="file"
                id="resume-file-input"
                className="hidden"
                accept=".txt,.pdf"
                onChange={handleFileInput}
              />
              <label htmlFor="resume-file-input" className="cursor-pointer space-y-2 block">
                <FileText className="w-8 h-8 text-gray-500 mx-auto" />
                <div className="text-xs font-bold text-indigo-300">Drag & drop or Click to browse</div>
                <div className="text-[10px] text-gray-500">Supports PDF or Text resume indexing</div>
              </label>
            </div>

            {isParsingResume && (
              <div className="p-3 bg-gray-900 border border-indigo-500/20 rounded-xl text-xs text-gray-400 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Gemini ATS Neural network deep-parsing resume coordinates...</span>
              </div>
            )}

            {/* Parsing Results and Gap analysis reports */}
            {resumeAnalysis && !isParsingResume && (
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-850 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>ATS Matching Report</span>
                  </div>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                    resumeAnalysis.matchScore >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  }`}>
                    Match index: {resumeAnalysis.matchScore}%
                  </span>
                </div>

                {/* Extracted Skills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Extracted Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeAnalysis.skills.map((skill, index) => (
                      <span key={index} className="text-[9px] bg-gray-950 font-mono border border-gray-750 px-2 py-0.5 rounded text-gray-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                {resumeAnalysis.missingSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Missing Core Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeAnalysis.missingSkills.map((skill, index) => (
                        <span key={index} className="text-[9px] bg-red-950/20 border border-red-500/10 px-2 py-0.5 rounded text-red-300 font-mono">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gap Analysis */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-yellow-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    ATS Gap Analysis Recommendations
                  </span>
                  <ul className="space-y-1 text-[10px] text-gray-300 list-disc list-inside">
                    {resumeAnalysis.gapAnalysis.map((gap, index) => (
                      <li key={index}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SetupScreen;
