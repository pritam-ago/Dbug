import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Missing',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'Set' : 'Missing',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Missing',
    NODE_ENV: process.env.NODE_ENV || 'Missing',
  }

  return NextResponse.json({
    message: 'Environment variables status',
    envVars,
    timestamp: new Date().toISOString(),
  })
}
