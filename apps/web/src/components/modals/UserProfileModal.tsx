import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Shield, 
  Key, 
  Camera, 
  Save,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Github,
  Twitter,
  Globe,
  Check,
  Trash2
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Demo User',
    email: 'demo@omnipanel.app',
    bio: 'AI enthusiast and developer building the future with OmniPanel.',
    location: 'San Francisco, CA',
    website: 'https://demo.omnipanel.app',
    company: 'OmniPanel Inc.',
    jobTitle: 'Senior Developer',
    avatar: null as File | null,
    joinedDate: new Date('2024-01-15'),
    socialLinks: {
      github: 'https://github.com/demouser',
      twitter: 'https://twitter.com/demouser',
      linkedin: '',
    }
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: 30,
    emailNotifications: true,
    securityAlerts: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Key },
  ];

  const handleSaveProfile = () => {
    console.log('Saving profile...', profile);
    setIsEditing(false);
    // Show success message
  };

  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (security.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    console.log('Changing password...');
    setSecurity(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    alert('Password changed successfully');
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfile(prev => ({ ...prev, avatar: file }));
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...');
      // Implement account deletion logic
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-semibold">User Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-accent/30 border-r border-border p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Profile Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">{profile.name}</h4>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {profile.joinedDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Job Title</label>
                    <input
                      type="text"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Company</label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Website</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50"
                  />
                </div>

                {/* Social Links */}
                <div>
                  <label className="text-sm font-medium block mb-3">Social Links</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="url"
                        placeholder="GitHub profile URL"
                        value={profile.socialLinks.github}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, github: e.target.value }
                        }))}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Twitter className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="url"
                        placeholder="Twitter profile URL"
                        value={profile.socialLinks.twitter}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                        }))}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Security Settings</h3>

                {/* Change Password */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Change Password</h4>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={security.currentPassword}
                        onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={security.newPassword}
                        onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                  >
                    Update Password
                  </button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Enable two-factor authentication</p>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.twoFactorEnabled}
                      onChange={(e) => setSecurity(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                      className="rounded"
                    />
                  </div>
                </div>

                {/* Security Preferences */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Security Preferences</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Email security alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Get notified about important security events
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.securityAlerts}
                      onChange={(e) => setSecurity(prev => ({ ...prev, securityAlerts: e.target.checked }))}
                      className="rounded"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Session Timeout (minutes)</label>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={240}>4 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Account Settings</h3>

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Account ID</label>
                      <p className="text-sm text-muted-foreground">user_demo_12345</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Account Type</label>
                      <p className="text-sm text-muted-foreground">Pro Developer</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Member Since</label>
                      <p className="text-sm text-muted-foreground">
                        {profile.joinedDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Last Login</label>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()} (Today)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-red-600">Danger Zone</h4>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <h5 className="font-medium text-red-600 mb-2">Delete Account</h5>
                    <p className="text-sm text-red-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 