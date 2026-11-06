import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import connectDB from '@/app/lib/mongodb';
import { User, NotificationPersonality } from '@/app/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        role: user.role,
        department: user.department || '',
        xp: user.xp,
        coins: user.coins,
        level: user.level,
        streak: user.streak,
        notificationPersonality: user.notificationPersonality,
        provider: user.provider || 'credentials',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve profile data.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatar, department, notificationPersonality } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
        return NextResponse.json(
          { message: 'Name must be between 2 and 50 characters.' },
          { status: 400 }
        );
      }
    }

    // Validate avatar if provided
    if (avatar !== undefined && typeof avatar !== 'string') {
      return NextResponse.json(
        { message: 'Avatar must be a valid image URL string.' },
        { status: 400 }
      );
    }

    // Validate department if provided
    if (department !== undefined && typeof department !== 'string') {
      return NextResponse.json(
        { message: 'Department must be a string.' },
        { status: 400 }
      );
    }

    // Validate notification personality if provided
    const validPersonalities: NotificationPersonality[] = [
      'Friendly',
      'Funny',
      'Savage',
      'Motivational',
      'NoMercy',
      'Corporate',
    ];

    if (
      notificationPersonality !== undefined &&
      !validPersonalities.includes(notificationPersonality)
    ) {
      return NextResponse.json(
        { message: 'Invalid notification personality.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Prepare strictly authorized updates (NEVER overwrite role, xp, coins, level, streak, or email)
    const updateData: {
      name?: string;
      avatar?: string;
      department?: string;
      notificationPersonality?: NotificationPersonality;
    } = {};

    if (name !== undefined) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar.trim();
    if (department !== undefined) updateData.department = department.trim();
    if (notificationPersonality !== undefined) {
      updateData.notificationPersonality = notificationPersonality;
    }

    // Update ONLY the logged-in user
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar || '',
        role: updatedUser.role,
        department: updatedUser.department || '',
        xp: updatedUser.xp,
        coins: updatedUser.coins,
        level: updatedUser.level,
        streak: updatedUser.streak,
        notificationPersonality: updatedUser.notificationPersonality,
        provider: updatedUser.provider || 'credentials',
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile.' },
      { status: 500 }
    );
  }
}

