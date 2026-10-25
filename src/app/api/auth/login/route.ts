import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';
import { ensureDatabaseInitialized } from '@/lib/db-init';

export async function POST(request: Request) {
  try {
    await ensureDatabaseInitialized();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Please fill in all fields.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { user_name: username.trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Incorrect username.' },
        { status: 401 }
      );
    }

    if (user.user_pass !== password) {
      return NextResponse.json(
        { error: 'Incorrect password.' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user.user_id,
      username: user.user_name,
      userType: user.user_type,
    };

    const token = await createSessionToken(sessionPayload);
    const response = NextResponse.json({
      user: sessionPayload,
      redirectUrl:
        user.user_type === 'admin'
          ? '/admin'
          : user.user_type === 'volunteer'
          ? '/volunteer'
          : '/citizen',
    });

    response.cookies.set('drs_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Database or server error during login.' },
      { status: 500 }
    );
  }
}

