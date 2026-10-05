import mongoose, { Document } from 'mongoose';

export type NotificationPersonality =
  | 'Friendly'
  | 'Funny'
  | 'Savage'
  | 'Motivational'
  | 'NoMercy'
  | 'Corporate';

export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface UserDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  xp: number;
  coins: number;
  level: number;
  streak: number;
  notificationPersonality: NotificationPersonality;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Employee'],
      default: 'Employee',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    xp: {
      type: Number,
      default: 0,
    },
    coins: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    streak: {
      type: Number,
      default: 0,
    },
    notificationPersonality: {
      type: String,
      enum: ['Friendly', 'Funny', 'Savage', 'Motivational', 'NoMercy', 'Corporate'],
      default: 'Friendly',
    },
  },
  {
    timestamps: true,
  },
);

// Index for email uniqueness (explicit, in case schema options don't catch it)
UserSchema.index({ email: 1 }, { unique: true });

// Method to get public user data (excluding passwordHash)
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

export const User = mongoose.models.User || mongoose.model<UserDoc>('User', UserSchema);

export default User;