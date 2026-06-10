
import { GoogleGenAI, Type } from '@google/genai';
import { TranscriptEntry, InterviewConfig, Feedback } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.INTEGER,
            description: "An overall score for the interview performance, from 0 to 100.",
        },
        strengths: {
            type: Type.ARRAY,
            description: "A list of key strengths demonstrated by the candidate.",
            items: { type: Type.STRING },
        },
        areasForImprovement: {
            type: Type.ARRAY,
            description: "A list of areas where the candidate can improve.",
            items: { type: Type.STRING },
        },
        questionScores: {
            type: Type.ARRAY,
            description: "A breakdown of performance for each question asked. Infer the question from the model's turn.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "The question that was asked by the interviewer.",
                    },
                    score: {
                        type: Type.INTEGER,
                        description: "A score from 0 to 100 for the answer to this specific question.",
                    },
                    feedback: {
                        type: Type.STRING,
                        description: "Specific feedback for the answer to this question.",
                    },
                },
                 required: ["question", "score", "feedback"],
            },
        },
    },
    required: ["overallScore", "strengths", "areasForImprovement", "questionScores"],
};


export const generateInterviewFeedback = async (
    transcript: TranscriptEntry[],
    interviewConfig: InterviewConfig
): Promise<Feedback> => {
    const transcriptText = transcript
        .map(entry => `${entry.source === 'model' ? 'Interviewer' : 'Candidate'}: ${entry.text}`)
        .join('\n');

    let prompt: string;

    if (interviewConfig.type === 'role') {
        prompt = `
            Analyze the following interview transcript for a ${interviewConfig.difficulty} level ${interviewConfig.role} position.
            Provide a detailed evaluation of the candidate's performance.
            Based on the transcript, generate a structured feedback report in JSON format.

            Transcript:
            ---
            ${transcriptText}
            ---
        `;
    } else {
        prompt = `
            Analyze the following interview transcript. The interview was conducted for a position based on the job description provided below. 
            Provide a detailed evaluation of the candidate's performance, specifically assessing their suitability against the requirements of this job description.
            Generate a structured feedback report in JSON format.

            Job Description:
            ---
            ${interviewConfig.jobDescription}
            ---

            Transcript:
            ---
            ${transcriptText}
            ---
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: feedbackSchema,
            },
        });
        
        const jsonText = response.text;
        const parsedJson = JSON.parse(jsonText);

        // Basic validation
        if (
            typeof parsedJson.overallScore !== 'number' ||
            !Array.isArray(parsedJson.strengths) ||
            !Array.isArray(parsedJson.areasForImprovement) ||
            !Array.isArray(parsedJson.questionScores)
        ) {
            throw new Error("Invalid feedback structure received from API");
        }
        
        return parsedJson as Feedback;
    } catch (error) {
        console.error("Error generating feedback:", error);
        throw new Error("Failed to generate interview feedback.");
    }
};

export const getAiClient = () => ai;
