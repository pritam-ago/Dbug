import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { DebugRequest, DebugResponse } from '../types';

export class AIClient {
  private gemini: GoogleGenerativeAI;
  private openai: OpenAI;
  private defaultProvider: 'gemini' | 'openai';

  constructor(
    geminiApiKey: string,
    openaiApiKey: string,
    defaultProvider: 'gemini' | 'openai' = 'gemini'
  ) {
    this.gemini = new GoogleGenerativeAI(geminiApiKey);
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.defaultProvider = defaultProvider;
  }

  async debugCode(request: DebugRequest): Promise<DebugResponse> {
    try {
      if (this.defaultProvider === 'gemini') {
        return await this.debugWithGemini(request);
      } else {
        return await this.debugWithOpenAI(request);
      }
    } catch (error) {
      throw new Error(`AI debugging failed: ${error}`);
    }
  }

  async getSuggestions(code: string, language: string): Promise<string[]> {
    try {
      const prompt = this.buildSuggestionPrompt(code, language);
      
      if (this.defaultProvider === 'gemini') {
        return await this.getSuggestionsWithGemini(prompt);
      } else {
        return await this.getSuggestionsWithOpenAI(prompt);
      }
    } catch (error) {
      throw new Error(`Failed to get suggestions: ${error}`);
    }
  }

  async analyzeCode(code: string, language: string): Promise<{
    complexity: number;
    maintainability: number;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      const prompt = this.buildAnalysisPrompt(code, language);
      
      if (this.defaultProvider === 'gemini') {
        return await this.analyzeWithGemini(prompt);
      } else {
        return await this.analyzeWithOpenAI(prompt);
      }
    } catch (error) {
      throw new Error(`Failed to analyze code: ${error}`);
    }
  }

  private async debugWithGemini(request: DebugRequest): Promise<DebugResponse> {
    const prompt = this.buildDebugPrompt(request);
    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return this.parseGeminiResponse(text, request.code);
  }

  private async debugWithOpenAI(request: DebugRequest): Promise<DebugResponse> {
    const prompt = this.buildDebugPrompt(request);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });
    
    const response = completion.choices[0]?.message?.content || '';
    return this.parseOpenAIResponse(response, request.code);
  }

  private async getSuggestionsWithGemini(prompt: string): Promise<string[]> {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return this.parseSuggestions(text);
  }

  private async getSuggestionsWithOpenAI(prompt: string): Promise<string[]> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });
    
    const response = completion.choices[0]?.message?.content || '';
    return this.parseSuggestions(response);
  }

  private async analyzeWithGemini(prompt: string): Promise<{
    complexity: number;
    maintainability: number;
    issues: string[];
    suggestions: string[];
  }> {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return this.parseAnalysis(text);
  }

  private async analyzeWithOpenAI(prompt: string): Promise<{
    complexity: number;
    maintainability: number;
    issues: string[];
    suggestions: string[];
  }> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });
    
    const response = completion.choices[0]?.message?.content || '';
    return this.parseAnalysis(response);
  }

  private buildDebugPrompt(request: DebugRequest): string {
    const { code, language, errorMessage, context, preferences } = request;
    
    let prompt = `Analyze and fix the following ${language} code:\n\n${code}\n\n`;
    
    if (errorMessage) {
      prompt += `Error message: ${errorMessage}\n\n`;
    }
    
    if (context) {
      prompt += `Context: ${context}\n\n`;
    }
    
    prompt += `Please provide:\n1. A fixed version of the code\n2. Analysis of the issues found\n3. Suggestions for improvement\n4. Code complexity and maintainability scores\n\n`;
    
    if (preferences) {
      if (preferences.style === 'concise') {
        prompt += 'Keep the response concise and focused.\n';
      }
      if (preferences.focus !== 'all') {
        prompt += `Focus on: ${preferences.focus}\n`;
      }
    }
    
    return prompt;
  }

  private buildSuggestionPrompt(code: string, language: string): string {
    return `Analyze the following ${language} code and provide 3-5 specific suggestions for improvement:\n\n${code}\n\nFocus on:\n- Code quality and readability\n- Performance optimizations\n- Best practices\n- Security considerations\n\nProvide actionable suggestions with brief explanations.`;
  }

  private buildAnalysisPrompt(code: string, language: string): string {
    return `Analyze the following ${language} code and provide a comprehensive assessment:\n\n${code}\n\nPlease provide:\n1. Code complexity score (1-10, where 1 is simple and 10 is very complex)\n2. Maintainability score (1-10, where 1 is hard to maintain and 10 is easy to maintain)\n3. List of specific issues found\n4. List of improvement suggestions\n\nFormat the response as JSON with keys: complexity, maintainability, issues, suggestions.`;
  }

  private parseGeminiResponse(response: string, originalCode: string): DebugResponse {
    try {
      const lines = response.split('\n');
      let fixedCode = originalCode;
      let analysis = { issues: [], suggestions: [], complexity: 5, maintainability: 5 };
      let explanation = '';
      let confidence = 0.8;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('```') && !line.includes('```')) {
          const codeStart = i + 1;
          let codeEnd = codeStart;
          while (codeEnd < lines.length && !lines[codeEnd].includes('```')) {
            codeEnd++;
          }
          if (codeEnd < lines.length) {
            fixedCode = lines.slice(codeStart, codeEnd).join('\n');
            break;
          }
        }
      }
      
      return {
        originalCode,
        fixedCode,
        analysis,
        explanation: explanation || 'Code analyzed and fixed using AI',
        confidence,
      };
    } catch (error) {
      return {
        originalCode,
        fixedCode: originalCode,
        analysis: { issues: [], suggestions: [], complexity: 5, maintainability: 5 },
        explanation: 'Failed to parse AI response',
        confidence: 0.5,
      };
    }
  }

  private parseOpenAIResponse(response: string, originalCode: string): DebugResponse {
    try {
      const lines = response.split('\n');
      let fixedCode = originalCode;
      let analysis = { issues: [], suggestions: [], complexity: 5, maintainability: 5 };
      let explanation = '';
      let confidence = 0.8;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('```') && !line.includes('```')) {
          const codeStart = i + 1;
          let codeEnd = codeStart;
          while (codeEnd < lines.length && !lines[codeEnd].includes('```')) {
            codeEnd++;
          }
          if (codeEnd < lines.length) {
            fixedCode = lines.slice(codeStart, codeEnd).join('\n');
            break;
          }
        }
      }
      
      return {
        originalCode,
        fixedCode,
        analysis,
        explanation: explanation || 'Code analyzed and fixed using AI',
        confidence,
      };
    } catch (error) {
      return {
        originalCode,
        fixedCode: originalCode,
        analysis: { issues: [], suggestions: [], complexity: 5, maintainability: 5 },
        explanation: 'Failed to parse AI response',
        confidence: 0.5,
      };
    }
  }

  private parseSuggestions(response: string): string[] {
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

  private parseAnalysis(response: string): {
    complexity: number;
    maintainability: number;
    issues: string[];
    suggestions: string[];
  } {
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
}
