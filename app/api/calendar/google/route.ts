import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect('https://accounts.google.com/o/oauth2/v2/auth');
}
