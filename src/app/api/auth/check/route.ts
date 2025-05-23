import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';

export async function GET(request: Request) {
  try {
    const IdSession = request.headers.get('x-session-id') || 
                     new URL(request.url).searchParams.get('sessionId');
    
    if (!IdSession) {
      return NextResponse.json(
        { error: 'Session ID required' }, 
        { status: 401 }
      );
    }

    const SessionCollection = await getCollection('sessions');
    const session = await SessionCollection.findOne({ 
      idSession: IdSession 
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' }, 
        { status: 401 }
      );
    }

    return NextResponse.json({
      userId: session.userId,
      userEmail: session.userEmail,
      isTeacher: session.userIsTeacher,
      isStudent: session.userIsStudent
    });
    
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
