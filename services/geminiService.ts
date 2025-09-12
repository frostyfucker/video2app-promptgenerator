
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export interface AnalysisResult {
  prompt: string;
  sources: any[];
}

const getPromptStructure = () => `
The prompt you generate MUST be structured with the following sections in Markdown format:

### 1. App Overview
A brief, high-level summary of the application's purpose and main goal.

### 2. Core Features
A detailed, numbered list of all the features described or implied. For each feature, explain what it does and how the user might interact with it.

### 3. User Stories
Write a few user stories in the format: "As a [user type], I want to [action] so that [benefit]." If the user type isn't specified, use a general persona like "As a user...".

### 4. Tech Stack Suggestions
Based on the app's requirements, suggest a suitable tech stack. Default to a modern stack like Frontend: React with TypeScript and Tailwind CSS; Backend: Node.js with Express; Database: PostgreSQL, but adjust if the video implies other needs. Justify your choices briefly.

### 5. UI/UX Design Guidelines
Describe the visual style, color palette, and layout principles mentioned or shown. If not specified, suggest a modern, clean, and user-friendly design aesthetic (e.g., "minimalist with a dark theme and a single accent color").

### 6. Data Model / Schema
Propose a basic database schema or data model. Outline the main tables/collections, their fields (with types), and their relationships.

Your final output should be ONLY the generated prompt in clean Markdown. Do not include any of your own conversational text, greetings, or explanations before or after the prompt. Start directly with "### 1. App Overview".
`;

const handleApiError = (error: any): never => {
    console.error("Gemini API call failed:", error);
    if (error.message.includes('API_KEY_INVALID')) {
        throw new Error("The provided API Key is invalid. Please check your environment configuration.");
    }
    throw new Error(`Failed to get a response from the AI model. Details: ${error.message}`);
};

export const analyzeVideoFrames = async (frames: string[]): Promise<AnalysisResult> => {
  const systemPrompt = `
You are an expert software engineering project manager and prompt engineer.
Analyze the following sequence of video frames. The user is describing or showing a concept for a web application they want to build.
Based on the visuals (like drawings, wireframes, existing apps, gestures) and any visible text in these frames, generate a comprehensive and detailed prompt that a developer could give to another AI to create this application.
${getPromptStructure()}
`;

  const textPart = {
    text: systemPrompt,
  };

  const imageParts = frames.map(base64Data => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Data,
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, ...imageParts] },
    });
    
    return { prompt: response.text, sources: [] };
  } catch (error: any) {
    handleApiError(error);
  }
};

export const analyzeYouTubeVideo = async (url: string): Promise<AnalysisResult> => {
    const systemPrompt = `
You are an expert software engineering project manager and prompt engineer.
A user has provided the following YouTube URL: ${url}
Your task is to use your search capabilities to understand the content of this video. Based on the video's topic, title, description, and likely content, infer the web application idea the user is trying to conceptualize. Then, generate a comprehensive and detailed prompt that a developer could give to another AI to create this application.
${getPromptStructure()}
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: systemPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

        return { prompt: response.text, sources };
    } catch (error: any) {
        handleApiError(error);
    }
};

export const refinePrompt = async (originalPrompt: string, feedback: string): Promise<AnalysisResult> => {
  const systemPrompt = `
You are an expert prompt engineer. Your task is to refine an existing project prompt based on user feedback.
The user wants to modify the following prompt:

---
**ORIGINAL PROMPT:**
${originalPrompt}
---

**USER'S REFINEMENT REQUEST:**
"${feedback}"

Your goal is to generate a new, complete prompt that incorporates the user's request.
You MUST maintain the exact same Markdown structure as the original prompt (e.g., ### 1. App Overview, ### 2. Core Features, etc.).
Do not add any conversational text, greetings, or explanations before or after the refined prompt. Output ONLY the complete, refined prompt in clean Markdown.
`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: systemPrompt,
    });
    
    // Refinement doesn't generate new sources.
    return { prompt: response.text, sources: [] };
  } catch (error: any) {
    handleApiError(error);
  }
};
