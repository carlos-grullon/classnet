import { SignJWT } from 'jose';
import { User } from '@/interfaces/User';

// Constantes para la autenticación de Google
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

// Asegúrate de que esta URL coincida exactamente con la configurada en Google Cloud Console
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback';

// URL para la autorización de Google
export const getGoogleAuthURL = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};

// Obtener tokens de acceso de Google
export const getGoogleTokens = async (code: string) => {
  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(values),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error getting Google tokens:', error);
    throw new Error('Failed to get Google tokens');
  }
};

// Obtener información del usuario de Google
export const getGoogleUserInfo = async (access_token: string) => {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error getting Google user info:', error);
    throw new Error('Failed to get Google user info');
  }
};

// Crear JWT para la sesión del usuario
export const createUserSession = async (user: User) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new SignJWT({
    userId: user._id?.toString(),
    userIsStudent: user.user_is_student,
    userIsTeacher: user.user_is_teacher,
    userEmail: user.email,
    userImage: user.image_path
  })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .sign(secret);

  return token;
};
