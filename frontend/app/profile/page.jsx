"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit,
  FiLogOut,
  FiArrowLeft,
  FiPackage,
  FiHeart,
  FiSettings,
  FiTrendingUp,
} from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("agrifinai_user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setEditForm(parsed);
      } else {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("agrifinai_user");
      localStorage.removeItem("agrifinai_token");
      setUser(null);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('userLogout'));
      // Redirect to home page
      router.push("/");
    }
  };

  const handleSaveProfile = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agrifinai_user", JSON.stringify(editForm));
      setUser(editForm);
      setIsEditing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUser className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Please Login
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to view your profile.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                AgriFinAI
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Main Content - Full Width */}
          <div>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-semibold hover:bg-green-100 transition"
                      >
                        <FiEdit className="w-4 h-4" />
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editForm.email || ""}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone || ""}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={editForm.location || ""}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          placeholder="City, State"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
                      >
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiUser className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiMail className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold text-gray-900">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiPhone className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-semibold text-gray-900">
                              {user.phone || "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiMapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-semibold text-gray-900">
                              {user.location || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Active Listings</p>
                      <FiPackage className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Saved Items</p>
                      <FiHeart className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Inquiries</p>
                      <FiMail className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            )}

            {/* My Listings Tab */}
            {activeTab === "listings" && (
              <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Listings</h2>
                <div className="text-center py-12">
                  <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't listed any products yet</p>
                  <Link
                    href="/sell"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Create Your First Listing
                  </Link>
                </div>
              </div>
            )}

            {/* Saved Items Tab */}
            {activeTab === "saved" && (
              <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Items</h2>
                <div className="text-center py-12">
                  <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No saved items yet</p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300 text-green-600" defaultChecked />
                        <span className="text-gray-700">Email notifications for new inquiries</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300 text-green-600" defaultChecked />
                        <span className="text-gray-700">SMS alerts for urgent messages</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                        <span className="text-gray-700">Marketing and promotional emails</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Privacy</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300 text-green-600" defaultChecked />
                        <span className="text-gray-700">Show my profile to other users</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300 text-green-600" defaultChecked />
                        <span className="text-gray-700">Allow buyers to contact me directly</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Danger Zone</h3>
                    <button className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition">
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
