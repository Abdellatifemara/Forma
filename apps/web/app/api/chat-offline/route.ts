import { NextRequest, NextResponse } from 'next/server';

// Ollama API URL - can be local or remote
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'forma-fitness';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

/**
 * Offline Chat API - Uses local Ollama model
 * For non-premium users without OpenAI API costs
 */
export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation history
    const messages: ChatMessage[] = [
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    // Call Ollama API
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 512, // Max tokens
        },
      }),
    });

    if (!response.ok) {
      // Check if Ollama is running
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Model not found. Make sure Ollama is running and the model is installed.' },
          { status: 503 }
        );
      }
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();

    return NextResponse.json({
      response: data.message.content,
      model: data.model,
    });
  } catch (error) {
    console.error('Offline chat error:', error);

    // Check if Ollama is not running
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Offline chat service unavailable. Ollama may not be running.',
          fallback: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

/**
 * Health check for the offline chat service
 */
export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);

    if (!response.ok) {
      return NextResponse.json(
        { status: 'offline', message: 'Ollama not responding' },
        { status: 503 }
      );
    }

    const data = await response.json();
    const hasModel = data.models?.some(
      (m: { name: string }) => m.name.includes('forma-fitness')
    );

    return NextResponse.json({
      status: 'online',
      ollamaUrl: OLLAMA_URL,
      modelInstalled: hasModel,
      availableModels: data.models?.map((m: { name: string }) => m.name) || [],
    });
  } catch {
    return NextResponse.json(
      { status: 'offline', message: 'Cannot connect to Ollama' },
      { status: 503 }
    );
  }
}
