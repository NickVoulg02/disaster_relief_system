import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function getEncodedSecret(): Uint8Array {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return new TextEncoder().encode(secretKey);
}

export interface SessionUser {
  userId: number;
  username: string;
  userType: 'admin' | 'volunteer' | 'citizen';
}

export async function createSessionToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getEncodedSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
      algorithms: ['HS256'],
    });
    return {
      userId: Number(payload.userId),
      username: String(payload.username),
      userType: payload.userType as 'admin' | 'volunteer' | 'citizen',
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('drs_session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
