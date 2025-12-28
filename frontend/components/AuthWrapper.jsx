"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FiLock, FiUser, FiShield } from "react-icons/fi";

const AuthWrapper = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Pages that don't require authentication
  const publicPages = ['/login', '/'];

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("agrifinai_user");
        const storedToken = localStorage.getItem("agrifinai_token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'agrifinai_user' || e.key === 'agrifinai_token') {
        checkAuth();
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogout', handleLogout);
    
    // Listen for custom login event
    const handleLogin = (e) => {
      setUser(e.detail);
    };
    
    window.addEventListener('userLogin', handleLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogout', handleLogout);
      window.removeEventListener('userLogin', handleLogin);
    };
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AgriFinAI...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated and trying to access protected page
  if (!user && !publicPages.includes(pathname)) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="w-20 h-20 bg-linear-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiLock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to login to access AgriFinAI features. Please login to continue.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-block w-full px-6 py-3 bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <FiUser className="inline mr-2" />
                Login Now
              </Link>
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated or accessing public page, show content
  return children;
};

export default AuthWrapper;