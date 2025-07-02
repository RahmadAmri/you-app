"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfileData {
  message: string;
  data: {
    email: string;
    username: string;
    interests: string[];
    name?: string;
    birthday?: string;
    height?: number;
    weight?: number;
    horoscope?: string;
  };
}

interface UpdateProfileData {
  name: string;
  birthday: string;
  height: number;
  weight: number;
  interests: string[];
}

const ProfilePage = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");
  const router = useRouter();

  const [editForm, setEditForm] = useState<UpdateProfileData>({
    name: "",
    birthday: "",
    height: 0,
    weight: 0,
    interests: [],
  });
  const [newInterest, setNewInterest] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setError("No access token found. Please login again.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      const response = await fetch(
        "https://techtest.youapp.ai/api/getProfile",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": accessToken,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();

      setProfileData(data);

      setEditForm({
        name: data.data?.name || "",
        birthday: data.data?.birthday || "",
        height: data.data?.height || 0,
        weight: data.data?.weight || 0,
        interests: Array.isArray(data.data?.interests)
          ? data.data.interests
          : [],
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdateLoading(true);
      setUpdateError("");
      setUpdateSuccess("");

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setUpdateError("No access token found. Please login again.");
        return;
      }

      const updatePayload = {
        name: editForm.name.trim(),
        birthday: editForm.birthday,
        height: editForm.height || 0,
        weight: editForm.weight || 0,
        interests: editForm.interests.filter(
          (interest) => interest.trim() !== ""
        ),
      };

      const response = await fetch(
        "https://techtest.youapp.ai/api/updateProfile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": accessToken,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Update failed: ${response.status}`);
      }

      setUpdateSuccess(data.message || "Profile updated successfully!");
      setIsEditing(false);

      await fetchProfile();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === "height" || name === "weight" ? parseInt(value) || 0 : value,
    }));
  };

  const addInterest = () => {
    const trimmedInterest = newInterest.trim();

    if (!trimmedInterest) {
      setUpdateError("Please enter a valid interest");
      setTimeout(() => setUpdateError(""), 3000);
      return;
    }

    if (editForm.interests.includes(trimmedInterest)) {
      setUpdateError("This interest is already added");
      setTimeout(() => setUpdateError(""), 3000);
      return;
    }

    if (editForm.interests.length >= 10) {
      setUpdateError("Maximum 10 interests allowed");
      setTimeout(() => setUpdateError(""), 3000);
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      interests: [...prev.interests, trimmedInterest],
    }));
    setNewInterest("");
    setUpdateError("");
  };

  const removeInterest = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setUpdateError("");
    setUpdateSuccess("");
    setNewInterest("");

    if (profileData) {
      setEditForm({
        name: profileData.data?.name || "",
        birthday: profileData.data?.birthday || "",
        height: profileData.data?.height || 0,
        weight: profileData.data?.weight || 0,
        interests: Array.isArray(profileData.data?.interests)
          ? profileData.data.interests
          : [],
      });
    }
  };

  // Function to calculate age from birthday
  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleInterestKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 flex items-center justify-center p-5">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 flex items-center justify-center p-5">
        <div className="w-full max-w-md mx-auto text-white text-center">
          <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-6">
            <svg
              className="w-12 h-12 text-red-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-red-400 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={fetchProfile}
                className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/login"
                className="block w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-center"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 p-5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-60 h-60 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 left-1/3 w-50 h-50 bg-teal-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-8 pt-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white text-lg font-medium hover:opacity-80 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Logout
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="transition-transform duration-200"
          >
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="16,17 21,12 16,7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="21"
              y1="12"
              x2="9"
              y2="12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Profile Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            {isEditing ? "Edit Profile" : "Profile"}
          </h1>
          <p className="text-white/70">{profileData?.message}</p>
        </div>

        {/* Success/Error Messages */}
        {updateSuccess && (
          <div className="mb-6 text-green-400 text-sm p-4 bg-green-400/10 border border-green-400/30 rounded-lg text-center animate-slideIn">
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {updateSuccess}
            </div>
          </div>
        )}

        {updateError && (
          <div className="mb-6 text-red-400 text-sm p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-center animate-shake">
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {updateError}
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
          {/* Avatar */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
              {profileData?.data?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="text-2xl font-semibold text-white">
              {profileData?.data?.username || "Unknown User"}
            </h2>
            {profileData?.data?.horoscope && (
              <p className="text-cyan-300 text-sm mt-1">
                ✨ {profileData.data.horoscope}
              </p>
            )}
          </div>

          {!isEditing ? (
            /* View Mode */
            <>
              {/* Profile Details */}
              <div className="space-y-6">
                {/* Email */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    📧 Email Address
                  </label>
                  <span className="text-white text-lg">
                    {profileData?.data?.email || "No email provided"}
                  </span>
                </div>

                {/* Name */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    👤 Full Name
                  </label>
                  <span className="text-white text-lg">
                    {profileData?.data?.name || "Not provided"}
                  </span>
                </div>

                {/* Birthday & Age */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    🎂 Birthday
                  </label>
                  <div className="text-white text-lg">
                    {profileData?.data?.birthday ? (
                      <div>
                        <span>{formatDate(profileData.data.birthday)}</span>
                        {calculateAge(profileData.data.birthday) && (
                          <span className="text-cyan-300 text-sm ml-2">
                            (Age: {calculateAge(profileData.data.birthday)})
                          </span>
                        )}
                      </div>
                    ) : (
                      "Not provided"
                    )}
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <label className="block text-sm font-medium text-cyan-300 mb-2">
                      📏 Height
                    </label>
                    <span className="text-white text-lg">
                      {profileData?.data?.height
                        ? `${profileData.data.height} cm`
                        : "Not provided"}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <label className="block text-sm font-medium text-cyan-300 mb-2">
                      ⚖️ Weight
                    </label>
                    <span className="text-white text-lg">
                      {profileData?.data?.weight
                        ? `${profileData.data.weight} kg`
                        : "Not provided"}
                    </span>
                  </div>
                </div>

                {/* Horoscope */}
                {profileData?.data?.horoscope && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <label className="block text-sm font-medium text-cyan-300 mb-2">
                      ✨ Horoscope
                    </label>
                    <span className="text-white text-lg capitalize">
                      {profileData.data.horoscope}
                    </span>
                  </div>
                )}

                {/* Interests */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    💫 Interests ({profileData?.data?.interests?.length || 0})
                  </label>
                  {profileData?.data?.interests &&
                  profileData.data.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.data.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors animate-fadeIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🌟</div>
                      <span className="text-white/60 italic">
                        No interests added yet
                      </span>
                      <p className="text-cyan-300 text-sm mt-2">
                        Click Edit Profile to add your interests!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </>
          ) : (
            /* Edit Mode */
            <>
              <div className="space-y-6">
                {/* Name */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    👤 Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Birthday */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    🎂 Birthday
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={editForm.birthday}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <label className="block text-sm font-medium text-cyan-300 mb-2">
                      📏 Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={editForm.height || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="170"
                      min="0"
                      max="300"
                    />
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <label className="block text-sm font-medium text-cyan-300 mb-2">
                      ⚖️ Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={editForm.weight || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="70"
                      min="0"
                      max="500"
                    />
                  </div>
                </div>

                {/* Interests */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    💫 Interests ({editForm.interests.length}/10)
                  </label>

                  {/* Add new interest */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={handleInterestKeyPress}
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="Add an interest (e.g., Reading, Sports, Music)..."
                      maxLength={50}
                      disabled={editForm.interests.length >= 10}
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      disabled={
                        !newInterest.trim() || editForm.interests.length >= 10
                      }
                      className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add
                    </button>
                  </div>

                  {/* Interest limit notice */}
                  {editForm.interests.length >= 10 && (
                    <div className="text-yellow-400 text-sm mb-3 p-2 bg-yellow-400/10 border border-yellow-400/30 rounded">
                      ⚠️ Maximum of 10 interests reached
                    </div>
                  )}

                  {/* Current interests */}
                  {editForm.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {editForm.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30 flex items-center gap-2 hover:bg-cyan-500/30 transition-all duration-200 animate-fadeIn group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <span className="flex-1">{interest}</span>
                          <button
                            type="button"
                            onClick={() => removeInterest(index)}
                            className="text-red-400 hover:text-red-300 transition-colors ml-1 text-lg font-bold group-hover:scale-110"
                            title="Remove interest"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-2">💭</div>
                      <span className="text-white/60 italic text-sm">
                        No interests added yet. Start adding your interests
                        above!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleUpdateProfile}
                  disabled={updateLoading}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updateLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={updateLoading}
                  className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
