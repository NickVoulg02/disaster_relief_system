import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';
import { ensureDatabaseInitialized } from '@/lib/db-init';

export async function POST(request: Request) {
  try {
    await ensureDatabaseInitialized();
    const body = await request.json();
    const { username, password, firstName, lastName, phone, latitude, longitude } = body;

    if (
      !username ||
      !password ||
      !firstName ||
      !lastName ||
      !phone ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        { error: 'Fill in all fields (including location coordinates).' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { user_name: username.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username already taken.' },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          user_name: username.trim(),
          user_pass: password,
          user_type: 'citizen',
        },
      });

      await tx.citizen.create({
        data: {
          cit_id: newUser.user_id,
          cit_name: firstName.trim(),
          cit_laname: lastName.trim(),
          cit_number: String(phone).trim(),
          cit_lat: Number(latitude),
          cit_long: Number(longitude),
        },
      });

      return newUser;
    });

    const sessionPayload = {
      userId: result.user_id,
      username: result.user_name,
      userType: result.user_type,
    };

    const token = await createSessionToken(sessionPayload);
    const response = NextResponse.json({
      message: 'Citizen account created successfully!',
      user: sessionPayload,
      redirectUrl: '/citizen',
    });

    response.cookies.set('drs_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to register citizen account.' },
      { status: 500 }
    );
  }
}

