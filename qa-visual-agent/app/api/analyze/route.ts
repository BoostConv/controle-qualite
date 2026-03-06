import { NextRequest, NextResponse } from 'next/server';
import { analyzeImages } from '@/lib/anthropic';
import { AnalyzeRequest } from '@/types';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();

    const hasDesktop = body.figmaD && body.shotD;
    const hasMobile = body.figmaM && body.shotM;

    if (!hasDesktop && !hasMobile) {
      return NextResponse.json(
        { error: 'At least one complete pair (Figma + Dev) is required' },
        { status: 400 }
      );
    }

    const result = await analyzeImages(body);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Analysis error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
