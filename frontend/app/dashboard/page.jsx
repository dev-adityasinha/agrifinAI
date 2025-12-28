"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiPackage,
  FiActivity,
  FiCalendar,
  FiArrowRight,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("agrifinai_user");
      const token = localStorage.getItem("agrifinai_token");
      
      if (!user || !token) {
        router.push("/login");
        return;
      }
      
      setUserData(JSON.parse(user));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("agrifinai_user");
    localStorage.removeItem("agrifinai_token");
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('userLogout'));
    router.push("/");
  };

  if (!userData) {
    return null; // Don't show loading, just redirect
  }

  const stats = [
    { label: "Active Listings", value: "12", icon: FiPackage },
    { label: "Total Sales", value: "₹45,230", icon: FiDollarSign },
    { label: "Saved Items", value: "8", icon: FiHeart },
    { label: "Profile Views", value: "234", icon: FiUsers },
  ];

  const recentActivity = [
    { action: "Listed Organic Tomatoes", time: "2 hours ago", icon: FiPackage },
    { action: "Saved Wheat Seeds listing", time: "5 hours ago", icon: FiHeart },
    { action: "Applied for Crop Loan", time: "1 day ago", icon: FiDollarSign },
    { action: "Updated profile picture", time: "2 days ago", icon: FiUser },
  ];

  const quickActions = [
    { label: "Sell Products", href: "/sell", icon: FiShoppingBag },
    { label: "Browse Market", href: "/", icon: FiHome },
    { label: "Apply for Loan", href: "/loan", icon: FiDollarSign },
    { label: "Weather Forecast", href: "/weather", icon: FiActivity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userData.name}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your AgriFinAI account today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-green-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <stat.icon className="text-green-600 text-2xl" />
                </div>
                <FiTrendingUp className="text-green-500 text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white border border-green-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group"
              >
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <action.icon className="text-green-600 text-2xl" />
                  </div>
                  <p className="font-semibold text-gray-900">{action.label}</p>
                </div>
                <FiArrowRight className="text-green-600 text-2xl opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <activity.icon className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <FiCalendar className="mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
                <FiArrowRight className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
