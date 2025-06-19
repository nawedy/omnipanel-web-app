// apps/web/src/app/api/debug/store/route.ts
// Debug endpoint to check store state

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // This is a debug endpoint to help diagnose store state issues
    // In a real app, this would be removed or protected
    
    return NextResponse.json({
      message: 'This endpoint helps debug client-side store state',
      instructions: 'Check the browser console for store state or use the settings page sync button',
      timestamp: new Date().toISOString(),
      ollama_status: 'Check /api/models/sync for Ollama status'
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 