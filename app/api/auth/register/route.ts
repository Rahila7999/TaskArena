import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import connectDB from '@/app/lib/mongodb';
import { User } from '@/app/lib/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: 'Name, email and password are required.',
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: 'User already exists.',
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return NextResponse.json(
      {
        message: 'User registered successfully.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const isDuplicateKey =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000;

    if (isDuplicateKey) {
      return NextResponse.json(
        {
          message: 'User already exists.',
        },
        { status: 409 }
      );
    }

    console.error('Registration error:', error);

    return NextResponse.json(
      {
        message: 'Something went wrong while registering.',
      },
      { status: 500 }
    );
  }
}
