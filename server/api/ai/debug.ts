import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { createSuccessResponse, createErrorResponse, createUnauthorizedResponse } from '../../utils/expressResponse';

dotenv.config();

const router = express.Router();

// Middleware to check if user is authenticated (you can implement your own auth logic)
const requireAuth = (req: Request, res: Response, next: Function) => {
  // For now, we'll skip auth check - implement your own auth middleware as needed
  next();
};

// POST /api/ai/debug - Debug code using Gemini
router.post('/debug', requireAuth, async (req: Request, res: Response) => {
  try {
    const { code, language, errorMessage, context, preferences } = req.body;
    
    if (!code || !language) {
      return res.status(400).json(createErrorResponse('Code and language are required', 400));
    }
    
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(500).json(createErrorResponse('Gemini API key not configured', 500));
    }
    
    const result = await debugWithGemini(code, language, errorMessage, context, preferences);
    
    return res.json(createSuccessResponse(result));
  } catch (error) {
    console.error('AI debugging failed:', error);
    return res.status(500).json(createErrorResponse(`AI debugging failed: ${error}`, 500));
  }
});

// POST /api/ai/analyze - Analyze code using Gemini
router.post('/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json(createErrorResponse('Code and language are required', 400));
    }
    
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(500).json(createErrorResponse('Gemini API key not configured', 500));
    }
    
    const analysis = await analyzeWithGemini(code, language);
    
    return res.json(createSuccessResponse(analysis));
  } catch (error) {
    console.error('Code analysis failed:', error);
    return res.status(500).json(createErrorResponse(`Code analysis failed: ${error}`, 500));
  }
});

// POST /api/ai/suggestions - Get code suggestions using Gemini
router.post('/suggestions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json(createErrorResponse('Code and language are required', 400));
    }
    
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(500).json(createErrorResponse('Gemini API key not configured', 500));
    }
    
    const suggestions = await getSuggestionsWithGemini(code, language);
    
    return res.json(createSuccessResponse(suggestions));
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    return res.status(500).json(createErrorResponse(`Failed to get suggestions: ${error}`, 500));
  }
});

// GET /api/ai/providers - Get available AI providers
router.get('/providers', (req: Request, res: Response) => {
  try {
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    const providers = [];
    if (geminiApiKey) providers.push('gemini');
    
    return res.json(createSuccessResponse(providers));
  } catch (error) {
    return res.status(500).json(createErrorResponse(`Failed to get providers: ${error}`, 500));
  }
});

async function debugWithGemini(code: string, language: string, errorMessage?: string, context?: string, preferences?: any) {
  const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = buildDebugPrompt(code, language, errorMessage, context, preferences);
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return parseGeminiResponse(text, code);
}

async function analyzeWithGemini(code: string, language: string) {
  const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = buildAnalysisPrompt(code, language);
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return parseAnalysis(text);
}

async function getSuggestionsWithGemini(code: string, language: string) {
  const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = buildSuggestionPrompt(code, language);
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return parseSuggestions(text);
}

function buildDebugPrompt(code: string, language: string, errorMessage?: string, context?: string, preferences?: any): string {
  let prompt = `Analyze and fix the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
  
  if (errorMessage) {
    prompt += `Error message: ${errorMessage}\n\n`;
  }
  
  if (context) {
    prompt += `Context: ${context}\n\n`;
  }
  
  prompt += `Please provide:\n1. A fixed version of the code in a code block\n2. Analysis of the issues found\n3. Suggestions for improvement\n4. Code complexity and maintainability scores (1-10)\n\n`;
  
  if (preferences) {
    if (preferences.style === 'concise') {
      prompt += 'Keep the response concise and focused.\n';
    }
    if (preferences.focus !== 'all') {
      prompt += `Focus on: ${preferences.focus}\n`;
    }
  }
  
  prompt += `\nFormat your response with clear sections and use markdown formatting.`;
  
  return prompt;
}

function buildAnalysisPrompt(code: string, language: string): string {
  return `Analyze the following ${language} code and provide a comprehensive assessment:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nPlease provide:\n1. Code complexity score (1-10, where 1 is simple and 10 is very complex)\n2. Maintainability score (1-10, where 1 is hard to maintain and 10 is easy to maintain)\n3. List of specific issues found\n4. List of improvement suggestions\n\nFormat the response as JSON with keys: complexity, maintainability, issues, suggestions.`;
}

function buildSuggestionPrompt(code: string, language: string): string {
  return `Analyze the following ${language} code and provide 3-5 specific suggestions for improvement:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nFocus on:\n- Code quality and readability\n- Performance optimizations\n- Best practices\n- Security considerations\n\nProvide actionable suggestions with brief explanations. Format as a numbered list.`;
}

function parseGeminiResponse(response: string, originalCode: string) {
  try {
    const lines = response.split('\n');
    let fixedCode = originalCode;
    let codeSnippet = '';
    let analysis: { issues: string[]; suggestions: string[]; complexity: number; maintainability: number } = { issues: [], suggestions: [], complexity: 5, maintainability: 5 };
    let explanation = '';
    let confidence = 0.8;
    
    // Extract code blocks - look for the first code block as the fixed code
    const codeBlockRegex = /```(?:[a-zA-Z]*)\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      codeBlocks.push(match[1]);
    }
    
    if (codeBlocks.length > 0) {
      fixedCode = codeBlocks[0].trim();
      
      // Create a snippet (first 3 lines + ellipsis if longer)
      const codeLines = fixedCode.split('\n');
      if (codeLines.length > 3) {
        codeSnippet = codeLines.slice(0, 3).join('\n') + '\n...';
      } else {
        codeSnippet = fixedCode;
      }
    }
    
    // Extract analysis from the response
    const analysisMatch = response.match(/complexity.*?(\d+).*?maintainability.*?(\d+)/i);
    if (analysisMatch) {
      analysis.complexity = parseInt(analysisMatch[1]);
      analysis.maintainability = parseInt(analysisMatch[2]);
    }
    
    // Extract issues and suggestions
    const issuesMatch = response.match(/issues?[:\s]+(.*?)(?=\n\n|\n\*\*|$)/is);
    if (issuesMatch) {
      analysis.issues = issuesMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, '').trim());
    }
    
    const suggestionsMatch = response.match(/suggestions?[:\s]+(.*?)(?=\n\n|\n\*\*|$)/is);
    if (suggestionsMatch) {
      analysis.suggestions = suggestionsMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, '').trim());
    }
    
    // Use the full response as explanation if no specific explanation found
    explanation = response.replace(/```[\s\S]*?```/g, '').trim();
    
    return {
      originalCode,
      fixedCode,
      codeSnippet,
      analysis,
      explanation: explanation || 'Code analyzed and fixed using Gemini AI',
      confidence,
    };
  } catch (error) {
    return {
      originalCode,
      fixedCode: originalCode,
      codeSnippet: 'Failed to parse code',
      analysis: { issues: [], suggestions: [], complexity: 5, maintainability: 5 },
      explanation: 'Failed to parse AI response',
      confidence: 0.5,
    };
  }
}

function parseAnalysis(response: string) {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        complexity: parsed.complexity || 5,
        maintainability: parsed.maintainability || 5,
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || [],
      };
    }
    
    return {
      complexity: 5,
      maintainability: 5,
      issues: ['Failed to parse analysis'],
      suggestions: ['Failed to parse analysis'],
    };
  } catch (error) {
    return {
      complexity: 5,
      maintainability: 5,
      issues: ['Failed to parse analysis'],
      suggestions: ['Failed to parse analysis'],
    };
  }
}

function parseSuggestions(response: string): string[] {
  try {
    const lines = response.split('\n').filter(line => line.trim());
    const suggestions: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^\d+\.\s/) || line.match(/^[-*]\s/)) {
        suggestions.push(line.replace(/^\d+\.\s|^[-*]\s/, '').trim());
      }
    }
    
    return suggestions.slice(0, 5);
  } catch (error) {
    return ['Failed to parse suggestions'];
  }
}

export default router;
