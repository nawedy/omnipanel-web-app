// apps/web/src/app/api/models/sync/route.ts
// API endpoint for syncing local models with Ollama

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Check if Ollama is available
    const ollamaResponse = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!ollamaResponse.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ollama service not available',
          details: `HTTP ${ollamaResponse.status}` 
        },
        { status: 503 }
      );
    }

    const data = await ollamaResponse.json();
    const models = data.models || [];

    return NextResponse.json({
      success: true,
      models: models.map((model: any) => ({
        id: model.name,
        name: model.name,
        status: 'available',
        details: model.details || {},
        size: model.size,
        modified_at: model.modified_at,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Model sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req); // Allow both GET and POST for convenience
} 