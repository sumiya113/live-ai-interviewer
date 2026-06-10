
export enum AppState {
    SETUP = 'SETUP',
    INTERVIEW = 'INTERVIEW',
    FEEDBACK = 'FEEDBACK',
}

export enum JobRole {
    SOFTWARE_ENGINEER = 'Software Engineer',
    PRODUCT_MANAGER = 'Product Manager',
    UX_DESIGNER = 'UX Designer',
    DATA_SCIENTIST = 'Data Scientist',
}

export enum Difficulty {
    BEGINNER = 'Beginner',
    INTERMEDIATE = 'Intermediate',
    ADVANCED = 'Advanced',
}

export interface InterviewConfigByRole {
    type: 'role';
    role: JobRole;
    difficulty: Difficulty;
}

export interface InterviewConfigByJD {
    type: 'jd';
    jobDescription: string;
    numQuestions: number;
}

export type InterviewConfig = InterviewConfigByRole | InterviewConfigByJD;


export interface TranscriptEntry {
    source: 'user' | 'model';
    text: string;
    timestamp: number;
}

export interface Feedback {
    overallScore: number;
    strengths: string[];
    areasForImprovement: string[];
    questionScores: { question: string; score: number; feedback: string }[];
}
