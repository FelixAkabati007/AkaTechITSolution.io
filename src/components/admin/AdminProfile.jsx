import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { AvatarUpload } from "@components/ui/AvatarUpload";
import { mockService } from "@lib/mockData";

export const AdminProfile = ({ user }) => {
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
    mockService.updateUser(formData);
    setProfile(formData);
    setIsEditing(false);
    // In a real app, you would show a success toast here
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

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    // In a real app, you would validate and update password
    setPasswordData({ current: "", new: "", confirm: "" });
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
                Administrator
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

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
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
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
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
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 border border-akatech-gold text-akatech-gold rounded-lg font-bold hover:bg-akatech-gold hover:text-white transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
