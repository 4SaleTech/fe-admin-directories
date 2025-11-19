import { NextResponse } from 'next/server';

export async function GET() {
  // Read from runtime environment variable (set by AWS/Kubernetes)
  const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

  return NextResponse.json({
    apiBaseUrl
  });
}