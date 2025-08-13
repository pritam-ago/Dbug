import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AIClient } from '../../utils/aiClient';
import { createSuccessResponse, createErrorResponse, createUnauthorizedResponse } from '../../utils/response';
import { DebugRequest } from '../../types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    const body: DebugRequest = await request.json();
    const { code, language, errorMessage, context, preferences } = body;
    
    if (!code || !language) {
      return createErrorResponse('Code and language are required', 400);
    }
    
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!geminiApiKey || !openaiApiKey) {
      return createErrorResponse('AI services not configured', 500);
    }
    
    const aiClient = new AIClient(geminiApiKey, openaiApiKey);
    const result = await aiClient.debugCode(body);
    
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(`AI debugging failed: ${error}`, 500);
  }
}

export async function POST_SUGGESTIONS(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    const body = await request.json();
    const { code, language } = body;
    
    if (!code || !language) {
      return createErrorResponse('Code and language are required', 400);
    }
    
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!geminiApiKey || !openaiApiKey) {
      return createErrorResponse('AI services not configured', 500);
    }
    
    const aiClient = new AIClient(geminiApiKey, openaiApiKey);
    const suggestions = await aiClient.getSuggestions(code, language);
    
    return createSuccessResponse(suggestions);
  } catch (error) {
    return createErrorResponse(`Failed to get suggestions: ${error}`, 500);
  }
}

export async function POST_ANALYZE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    const body = await request.json();
    const { code, language } = body;
    
    if (!code || !language) {
      return createErrorResponse('Code and language are required', 400);
    }
    
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!geminiApiKey || !openaiApiKey) {
      return createErrorResponse('AI services not configured', 500);
    }
    
    const aiClient = new AIClient(geminiApiKey, openaiApiKey);
    const analysis = await aiClient.analyzeCode(code, language);
    
    return createSuccessResponse(analysis);
  } catch (error) {
    return createErrorResponse(`Failed to analyze code: ${error}`, 500);
  }
}

export async function GET_PROVIDERS() {
  try {
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    const providers = [];
    if (geminiApiKey) providers.push('gemini');
    if (openaiApiKey) providers.push('openai');
    
    return createSuccessResponse(providers);
  } catch (error) {
    return createErrorResponse(`Failed to get providers: ${error}`, 500);
  }
}

export async function POST_BATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    const body = await request.json();
    const { snippets } = body;
    
    if (!Array.isArray(snippets) || snippets.length === 0) {
      return createErrorResponse('Snippets array is required', 400);
    }
    
    if (snippets.length > 10) {
      return createErrorResponse('Maximum 10 snippets allowed per batch', 400);
    }
    
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!geminiApiKey || !openaiApiKey) {
      return createErrorResponse('AI services not configured', 500);
    }
    
    const aiClient = new AIClient(geminiApiKey, openaiApiKey);
    const results = [];
    
    for (const snippet of snippets) {
      try {
        const result = await aiClient.debugCode(snippet);
        results.push({ snippet, result, success: true });
      } catch (error) {
        results.push({ snippet, error: (error as Error).message, success: false });
      }
    }
    
    return createSuccessResponse(results);
  } catch (error) {
    return createErrorResponse(`Batch debugging failed: ${error}`, 500);
  }
}
