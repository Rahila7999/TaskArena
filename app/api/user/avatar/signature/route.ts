import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { authOptions } from '@/app/lib/auth';

export async function POST() {
  try {
    // 1. Require active authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in to upload an avatar.' },
        { status: 401 }
      );
    }

    // 2. Validate environment credentials
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          message:
            'Cloudinary credentials are not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.',
          configured: false,
        },
        { status: 503 }
      );
    }

    // 3. Define server-controlled upload parameters (enforcing strict security)
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'taskarena/avatars';
    const publicId = `avatar_${session.user.id}_${timestamp}`;
    const transformation = 'c_fill,g_face,w_400,h_400,q_auto,f_auto';

    // 4. Sign parameters alphabetically according to Cloudinary signing specification
    // Parameters to sign: folder, public_id, timestamp, transformation
    const paramsToSign: Record<string, string | number> = {
      folder,
      public_id: publicId,
      timestamp,
      transformation,
    };

    const sortedParamString = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&');

    // SHA-1 signature with API Secret appended
    const signature = crypto
      .createHash('sha1')
      .update(sortedParamString + apiSecret)
      .digest('hex');

    // 5. Return signature and parameters (NEVER exposing CLOUDINARY_API_SECRET)
    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      folder,
      public_id: publicId,
      transformation,
      apiKey,
      cloudName,
    });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json(
      { message: 'Failed to generate upload signature.' },
      { status: 500 }
    );
  }
}

