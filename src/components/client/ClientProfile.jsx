import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { AvatarUpload } from "@components/ui/AvatarUpload";
import { mockService } from "@lib/mockData";
import { useToast } from "@components/ui/ToastProvider";
import { getApiUrl } from "@lib/config";

export const ClientProfile = ({ user, onUserUpdate }) => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    setProfile(user);
    setFormData(user);
  }, [user]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // For now keeping mockService for profile details, but user might expect real update
    // Ideally this should also call an API
    mockService.updateUser(formData);
    setProfile(formData);
    setIsEditing(false);
    addToast("Profile updated", "success");
  };

  const handleAvatarUpload = (dataUrl) => {
    const newAvatar = mockService.updateAvatar(user.id, dataUrl);
    setProfile({ ...profile, avatarUrl: newAvatar });
  };

  const handleGoogleSync = () => {
    const newAvatar = mockService.syncGoogleAvatar(user.id);
    setProfile({ ...profile, avatarUrl: newAvatar });
  };

  const handleRemoveAvatar = () => {
    mockService.updateAvatar(user.id, null);
    setProfile({ ...profile, avatarUrl: null });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.new !== passwordData.confirm) {
      addToast("New passwords do not match", "error");
      return;
    }

    if (user.hasPassword && !passwordData.current) {
      addToast("Current password is required", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiUrl()}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      addToast("Password updated successfully", "success");
      setPasswordData({ current: "", new: "", confirm: "" });

      // Update local user state if we just set a password for the first time
      if (!user.hasPassword && onUserUpdate) {
        onUserUpdate({ ...user, hasPassword: true });
      }
    } catch (error) {
      console.error(error);
      addToast(error.message, "error");
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
        Profile Settings
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-akatech-card p-6 rounded-lg border border-gray-200 dark:border-white/10 text-center">
            <div className="mb-6">
              <AvatarUpload
                currentAvatar={profile.avatarUrl}
                userName={profile.name}
                onUpload={handleAvatarUpload}
                onGoogleSync={handleGoogleSync}
                onRemove={handleRemoveAvatar}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {profile.email}
            </p>

            <div className="flex justify-center gap-4">
              <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-xs text-gray-600 dark:text-gray-400">
                {profile.role ? profile.role.replace("_", " ") : "No Role"}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information */}
          <div className="bg-white dark:bg-akatech-card p-6 rounded-lg border border-gray-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.User className="w-5 h-5 text-akatech-gold" /> General
                Information
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-akatech-gold hover:underline font-bold"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none disabled:opacity-50"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none disabled:opacity-50"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-akatech-card p-6 rounded-lg border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Icons.Lock className="w-5 h-5 text-akatech-gold" /> Security
            </h3>

            {profile.accountType === "google" && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-3 border border-blue-100 dark:border-blue-900/30">
                <Icons.Google className="w-5 h-5" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Connected with Google
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    You can sign in securely using your Google account.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {user.hasPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                    value={passwordData.current}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {user.hasPassword ? "New Password" : "Set Password"}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 border border-akatech-gold text-akatech-gold rounded-lg font-bold hover:bg-akatech-gold hover:text-white transition-all"
                >
                  {user.hasPassword ? "Update Password" : "Set Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
