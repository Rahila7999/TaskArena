'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User as UserIcon,
  Mail,
  Building,
  Shield,
  Zap,
  Coins,
  Flame,
  Award,
  Smile,
  LogOut,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Camera,
  Trash2,
  Upload,
} from 'lucide-react';
import { Sidebar } from '@/app/components/sidebar';
import { Header } from '@/app/components/header';
import { UserAvatar } from '@/app/components/ui/user-avatar';
import { NotificationPersonality } from '@/app/lib/models/User';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  xp: number;
  coins: number;
  level: number;
  streak: number;
  notificationPersonality: NotificationPersonality;
  provider: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPersonality, setEditPersonality] = useState<NotificationPersonality>('Friendly');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Cloudinary upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch fresh profile from MongoDB via API
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      async function loadProfile() {
        try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setProfile(data.user);
              setEditName(data.user.name || '');
              setEditAvatar(data.user.avatar || '');
              setEditDepartment(data.user.department || '');
              setEditPersonality(data.user.notificationPersonality || 'Friendly');
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        } finally {
          setLoading(false);
        }
      }
      loadProfile();
    }
  }, [status, router]);

  // Handle Cloudinary Image File Upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaveError(null);
    setSaveSuccess(null);

    // 1. Validate file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setSaveError('Invalid file type. Please upload a JPG, PNG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate file size (max 2 MB)
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setSaveError(`File size exceeds 2 MB limit (selected: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingAvatar(true);
    setUploadProgress(10);

    try {
      // 3. Request signed parameters from TaskArena server
      const sigRes = await fetch('/api/user/avatar/signature', {
        method: 'POST',
      });

      const sigData = await sigRes.json();

      if (!sigRes.ok) {
        setSaveError(
          sigData.message ||
            'Cloudinary credentials are not configured in environment variables. Please check your .env.local.'
        );
        setUploadingAvatar(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(30);

      // 4. Upload file directly to Cloudinary using signed parameters
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', String(sigData.timestamp));
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);
      formData.append('public_id', sigData.public_id);
      formData.append('transformation', sigData.transformation);

      // Use XMLHttpRequest to track live upload progress
      const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;

      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 60) + 30; // 30% to 90%
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resJson = JSON.parse(xhr.responseText);
              resolve(resJson);
            } catch {
              reject(new Error('Invalid response from Cloudinary'));
            }
          } else {
            try {
              const errJson = JSON.parse(xhr.responseText);
              reject(new Error(errJson.error?.message || 'Cloudinary upload failed'));
            } catch {
              reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Network error uploading to Cloudinary'));
        xhr.send(formData);
      });

      setUploadProgress(95);

      const secureUrl = uploadResult.secure_url;

      // 5. Save Cloudinary URL to MongoDB
      const saveRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: secureUrl }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(saveData.message || 'Failed to update avatar in database.');
      }

      // 6. Update local state & NextAuth session
      setProfile(saveData.user);
      setEditAvatar(secureUrl);
      setUploadProgress(100);
      setSaveSuccess('Profile photo uploaded and updated successfully!');

      if (updateSession) {
        await updateSession({
          user: {
            avatar: secureUrl,
          },
        });
      }
    } catch (err: unknown) {
      console.error('Avatar upload error:', err);
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setSaveError(msg);
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => setUploadProgress(0), 1000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove Photo (Revert to initials)
  const handleRemoveAvatar = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: '' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.message || 'Failed to remove avatar.');
        setSaving(false);
        return;
      }

      setProfile(data.user);
      setEditAvatar('');
      setSaveSuccess('Profile photo removed. Initial fallback restored.');

      if (updateSession) {
        await updateSession({
          user: {
            avatar: '',
          },
        });
      }
    } catch {
      setSaveError('Failed to remove avatar.');
    } finally {
      setSaving(false);
    }
  };

  // Save General Profile Changes (Name, Department, Personality)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (editName.trim().length < 2) {
      setSaveError('Name must be at least 2 characters.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          avatar: editAvatar.trim(),
          department: editDepartment.trim(),
          notificationPersonality: editPersonality,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.message || 'Failed to update profile.');
        setSaving(false);
        return;
      }

      setProfile(data.user);
      setSaveSuccess('Profile details saved successfully!');
      setIsEditing(false);

      if (updateSession) {
        await updateSession({
          user: {
            name: data.user.name,
            avatar: data.user.avatar,
          },
        });
      }
    } catch {
      setSaveError('A network error occurred while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground font-medium">Loading Warrior Profile...</p>
        </div>
      </div>
    );
  }

  const currentProfile = profile || {
    id: session?.user?.id || '',
    name: session?.user?.name || 'Warrior',
    email: session?.user?.email || '',
    avatar: session?.user?.avatar || session?.user?.image || '',
    role: session?.user?.role || 'Employee',
    department: 'Engineering',
    xp: session?.user?.xp || 0,
    coins: session?.user?.coins || 0,
    level: session?.user?.level || 1,
    streak: session?.user?.streak || 0,
    notificationPersonality: session?.user?.notificationPersonality || 'Friendly',
    provider: 'credentials',
  };

  // Next level progress calculation (100 XP per level)
  const xpCurrentLevel = currentProfile.xp % 100;
  const xpProgressPercent = Math.min(100, Math.max(0, (xpCurrentLevel / 100) * 100));

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Navigation back */}
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Arena Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>

            {/* Profile Hero Card */}
            <div className="relative rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl overflow-hidden mb-8">
              {/* Background accent glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                {/* Avatar with image upload trigger */}
                <div className="relative group">
                  <UserAvatar
                    name={currentProfile.name}
                    avatar={currentProfile.avatar}
                    size="xl"
                    className="ring-4 ring-background shadow-2xl"
                  />
                  <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border-2 border-background">
                    Lv. {currentProfile.level}
                  </span>

                  {/* Quick Upload Hover Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer"
                    title="Change profile picture"
                    aria-label="Change profile picture"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Upload</span>
                  </button>
                </div>

                {/* Profile Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                        {currentProfile.name}
                      </h1>
                      <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{currentProfile.email}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-semibold border border-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                        <span>{currentProfile.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                      </button>

                      {currentProfile.avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={saving || uploadingAvatar}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-400 text-xs font-semibold border border-border transition-all cursor-pointer"
                          title="Remove custom photo and use initials"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(!isEditing);
                          setSaveSuccess(null);
                          setSaveError(null);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Cancel' : 'Edit Details'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Upload Progress Bar */}
                  {uploadingAvatar && (
                    <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 animate-bounce" />
                          Uploading to Cloudinary...
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-blue-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Shield className="w-3.5 h-3.5" />
                      <span>{currentProfile.role}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Building className="w-3.5 h-3.5" />
                      <span>{currentProfile.department || 'Workplace'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Smile className="w-3.5 h-3.5" />
                      <span>Personality: {currentProfile.notificationPersonality}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Level Progress Bar */}
              <div className="mt-8 pt-6 border-t border-border/80">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
                  <span>Level {currentProfile.level} Mastery</span>
                  <span>{xpCurrentLevel} / 100 XP to Level {currentProfile.level + 1}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Alert Messages */}
            {saveSuccess && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}
            {saveError && (
              <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="leading-snug">{saveError}</div>
              </div>
            )}

            {/* Edit Profile Form */}
            {isEditing && (
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl mb-8 animate-in fade-in duration-200">
                <h3 className="text-lg font-bold text-foreground mb-1">Edit Your Details</h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Update your display name, department, or notification personality.
                </p>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full pl-10 pr-4 py-2.5 bg-muted/60 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                        Department
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                          <Building className="w-4 h-4" />
                        </div>
                        <input
                          id="department"
                          type="text"
                          value={editDepartment}
                          onChange={(e) => setEditDepartment(e.target.value)}
                          placeholder="e.g. Engineering, Design, Product"
                          className="w-full pl-10 pr-4 py-2.5 bg-muted/60 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Avatar URL alternative */}
                  <div>
                    <label htmlFor="avatar" className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                      Or Direct Avatar URL (Optional)
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        id="avatar"
                        type="url"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="https://res.cloudinary.com/... or paste image URL"
                        className="flex-1 px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      {editAvatar && (
                        <div className="shrink-0">
                          <UserAvatar name={editName} avatar={editAvatar} size="md" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="personality" className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                      Hinglish Notification Personality
                    </label>
                    <select
                      id="personality"
                      value={editPersonality}
                      onChange={(e) => setEditPersonality(e.target.value as NotificationPersonality)}
                      className="w-full px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="Friendly">Friendly (&quot;Nice! Task complete kar diya! 🎉&quot;)</option>
                      <option value="Funny">Funny (&quot;Task toh ho gaya, ab thoda chill kar lo!&quot;)</option>
                      <option value="Savage">Savage (&quot;Deadline se pehle task complete? Aaj toh kamaal kar diya!&quot;)</option>
                      <option value="Motivational">Motivational (&quot;Keep going! Your productivity streak is growing!&quot;)</option>
                      <option value="NoMercy">NoMercy (&quot;Pending task abhi bhi zinda hai. Complete karo!&quot;)</option>
                      <option value="Corporate">Corporate (&quot;Task successfully completed. Great work!&quot;)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Gamification Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Level Card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {currentProfile.level}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Warrior Rank</p>
              </div>

              {/* Total XP Card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total XP</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {currentProfile.xp.toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Experience Points</p>
              </div>

              {/* Arena Coins Card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arena Coins</span>
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {currentProfile.coins.toLocaleString()}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Reward Currency</p>
              </div>

              {/* Streak Card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Streak</span>
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {currentProfile.streak} <span className="text-sm font-normal text-muted-foreground">days</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Active Quest Momentum</p>
              </div>
            </div>

            {/* Account Details & Metadata Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-1">User ID (MongoDB)</span>
                  <span className="font-mono text-[11px] text-foreground font-semibold break-all">
                    {currentProfile.id}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-1">Authentication Method</span>
                  <span className="text-foreground font-semibold capitalize">
                    {currentProfile.provider}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-1">Account Role</span>
                  <span className="text-blue-400 font-semibold">
                    {currentProfile.role}
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
