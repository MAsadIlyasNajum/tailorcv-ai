import {GEMINI_API_KEY} from 'react-native-dotenv';

import {
  buildExperienceImprovementPrompt,
  buildFinalOutputPrompt,
  buildGeminiPrompt,
  buildExtractionPrompt,
} from './promptBuilder';
import {parseAnalysisResponse, createAnalysisResult} from './analysisParser';
import {
  createFinalResumeOutput,
  parseFinalOutputResponse,
} from './finalOutputParser';
import {parseExperienceImprovementResponse} from './experienceImprovementParser';
import {parseExtractionResponse} from './extractionParser';
import type {
  AnalysisResult,
  FinalResumeOutput,
  ProfessionalExperience,
  ResumeContent,
} from '../../types/resume';

export interface AIService {
  analyzeResume: (resumeText: string, jobDescription: string) => Promise<AnalysisResult>;
  generateFinalResumeOutput: (
    resumeText: string,
    jobDescription: string,
    analysisResult: AnalysisResult,
    experiences: ProfessionalExperience[],
  ) => Promise<FinalResumeOutput>;
  analyzeProfessionalExperience: (
    resumeText: string,
    jobDescription: string,
    experiences: ProfessionalExperience[],
  ) => Promise<Array<{
    jobTitle: string;
    company: string;
    improvedSummary: string;
    suggestedBullets: string[];
    keywords: string[];
    impactNotes: string[];
  }>>;
  extractStructuredResume: (resumeText: string) => Promise<ResumeContent>;
}

const API_TIMEOUT_MS = 30000;

export class GeminiService implements AIService {
  private async callGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('The AI service is not configured.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{text: prompt}],
              },
            ],
          }),
          signal: controller.signal,
        },
      );

      console.log('Gemini response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorCode = response.status;

        if (errorCode === 429) {
          throw new Error('The AI service is temporarily busy. Please try again shortly.');
        }

        if (errorCode >= 500) {
          throw new Error('The AI service is currently unavailable. Please try again.');
        }

        let errorMessage = 'We could not complete the analysis. Please try again.';
        try {
          const errorPayload = await response.json();
          const detail = errorPayload?.error?.message;
          if (detail) {
            errorMessage = detail;
          }
        } catch {
          // ignore parse errors and use default message
        }

        throw new Error(errorMessage);
      }

      const payload = await response.json();
      const candidateText =
        payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (!candidateText) {
        throw new Error('We could not safely process the AI response. Please try again.');
      }

      return candidateText;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('The analysis took too long. Please try again.');
      }

      if (error instanceof Error && error.message) {
        throw error;
      }

      throw new Error('We could not complete the analysis. Please try again.');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async analyzeResume(
    resumeText: string,
    jobDescription: string,
  ): Promise<AnalysisResult> {
    const prompt = buildGeminiPrompt(resumeText, jobDescription);
    const candidateText = await this.callGemini(prompt);
    const parsedResponse = parseAnalysisResponse(candidateText);
    const result = createAnalysisResult(
      parsedResponse,
      resumeText,
      jobDescription,
    );

    return result;
  }

  async analyzeProfessionalExperience(
    resumeText: string,
    jobDescription: string,
    experiences: ProfessionalExperience[],
  ): Promise<Array<{
    jobTitle: string;
    company: string;
    improvedSummary: string;
    suggestedBullets: string[];
    keywords: string[];
    impactNotes: string[];
  }>> {
    const prompt = buildExperienceImprovementPrompt(
      resumeText,
      jobDescription,
      experiences,
    );
    const candidateText = await this.callGemini(prompt);

    return parseExperienceImprovementResponse(candidateText);
  }

  async generateFinalResumeOutput(
    resumeText: string,
    jobDescription: string,
    analysisResult: AnalysisResult,
    experiences: ProfessionalExperience[],
  ): Promise<FinalResumeOutput> {
    const prompt = buildFinalOutputPrompt(
      resumeText,
      jobDescription,
      analysisResult,
      experiences,
    );
    const candidateText = await this.callGemini(prompt);
    const parsedResponse = parseFinalOutputResponse(candidateText);

    return createFinalResumeOutput(parsedResponse, analysisResult.id);
  }

  async extractStructuredResume(
    resumeText: string,
  ): Promise<ResumeContent> {
    const prompt = buildExtractionPrompt(resumeText);
    const candidateText = await this.callGemini(prompt);
    return parseExtractionResponse(candidateText);
  }
}

export const geminiService: AIService = new GeminiService();
