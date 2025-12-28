"use client";

import Link from "next/link";
import Image from "next/image";
import { assets } from "@/assets";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = () => {
      const storedUser = localStorage.getItem("agrifinai_user");
      const storedToken = localStorage.getItem("agrifinai_token");
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    
    checkUser();
    
    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'agrifinai_user' || e.key === 'agrifinai_token') {
        checkUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom logout event
    const handleLogout = () => {
      setUser(null);
    };
    
    window.addEventListener('userLogout', handleLogout);
    
    // Also listen for custom login event
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

  const navItems = [
    { href: "/home", label: "Home", icon: "🏠" },
    { href: "/weather", label: "Weather", icon: "⛅" },
    { href: "/news", label: "News", icon: "📰" },
    { href: "/loan", label: "Loan", icon: "💰" },
    { href: "/soil-health", label: "Soil Health", icon: "🌱" }
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-green-100 shadow-sm">
        <div className="max-w-full px-6 mx-auto sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-24">
            
            {/* Logo Section */}
            <Link href="/home" className="flex items-center shrink-0 gap-3 transition-opacity duration-300 group hover:opacity-90">
              <div className="bg-linear-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl p-2.5 font-bold text-2xl w-14 h-14 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                A
              </div>
              <div className="flex-col hidden sm:flex">
                <div className="text-2xl font-black tracking-tight text-gray-900">
                  Agri<span className="text-green-600">Fin</span>AI
                </div>
                <div className="text-xs font-bold tracking-wide text-green-600">SMART FARMING</div>
              </div>
            </Link>

            {/* Desktop Navigation - Only show when logged in */}
            {user && (
              <div className="items-center flex-1 hidden gap-8 ml-12 lg:flex">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-0 py-2.5 text-gray-700 font-bold text-sm rounded-xl hover:text-green-700 hover:bg-green-50 transition-all duration-300 group relative whitespace-nowrap"
                  >
                    <span className="text-xl transition-transform duration-300 group-hover:scale-125">{item.icon}</span>
                    <span className="hidden md:inline">{item.label}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-1 transition-all duration-300 rounded-full bg-linear-to-r from-green-500 to-green-600 group-hover:w-full"></span>
                  </Link>
                ))}
              </div>
            )}

            {/* Right Actions */}
            <div className="items-center shrink-0 hidden gap-4 ml-6 lg:flex">
              {/* Admin Button */}
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 py-3 text-sm font-bold text-white transition-all duration-300 transform bg-blue-500 shadow-lg hover:bg-blue-600 px-7 rounded-xl hover:shadow-xl hover:scale-105 group"
              >
                <span>⚙️</span>
                <span>Admin</span>
              </Link>

              {/* Sell Button - Only show when logged in */}
              {user && (
                <Link
                  href="/sell"
                  className="flex items-center gap-2 py-3 text-sm font-bold text-white transition-all duration-300 transform shadow-lg bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-7 rounded-xl hover:shadow-xl hover:scale-105 group"
                >
                  <span>🚀</span>
                  <span>Sell</span>
                </Link>
              )}

              {/* Theme Toggle */}
              <button className="px-5 py-3 text-lg font-bold text-gray-800 transition-all duration-300 bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 rounded-xl hover:border-green-400 hover:text-green-600">
                🌙
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-300"></div>

              {/* Profile Section - Only show when logged in */}
              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-3 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-all duration-300 group border-2 border-transparent hover:border-green-200"
                >
                  <div className="relative">
                    <Image
                      src={assets.noAvatar}
                      alt="Profile"
                      height={44}
                      width={44}
                      className="transition-shadow border-green-500 rounded-full shadow-md border-3 group-hover:shadow-lg"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="hidden text-left xl:block">
                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                    <div className="text-xs font-semibold text-green-600">👨‍🌾 {user.role || 'Farmer'}</div>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-3 font-bold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl hover:shadow-xl"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-3xl p-2.5 hover:bg-gray-100 rounded-xl transition-colors duration-300 text-gray-800"
            >
              {isMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="bg-white border-b-2 border-green-100 shadow-lg lg:hidden">
          <div className="px-6 py-6 space-y-3">
            {/* Navigation items - Only show when logged in */}
            {user && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-5 py-4 font-bold text-gray-800 transition-all duration-300 border-l-4 border-transparent rounded-xl hover:bg-green-50 hover:text-green-700 group hover:border-green-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-2xl transition-transform duration-300 group-hover:scale-125">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 space-y-3 border-t-2 border-gray-200">
              {/* Admin Button Mobile */}
              <Link
                href="/admin/dashboard"
                className="flex items-center justify-center gap-2 px-5 py-4 font-bold text-white transition-all duration-300 shadow-md bg-blue-500 hover:bg-blue-600 rounded-xl hover:shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>⚙️</span>
                <span>Admin Panel</span>
              </Link>

              {/* Sell Button Mobile - Only show when logged in */}
              {user && (
                <Link
                  href="/sell"
                  className="flex items-center justify-center gap-2 px-5 py-4 font-bold text-white transition-all duration-300 shadow-md bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl hover:shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>🚀</span>
                  <span>Sell Product</span>
                </Link>
              )}

              {/* Profile Mobile - Only show when logged in */}
              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center justify-center gap-2 px-5 py-4 font-bold text-gray-800 transition-all duration-300 border-2 border-gray-200 hover:bg-green-50 rounded-xl hover:text-green-700 hover:border-green-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>👤</span>
                  <span>Profile - {user.name}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-5 py-4 font-bold text-white transition-all duration-300 bg-green-600 shadow-md hover:bg-green-700 rounded-xl hover:shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>🔐</span>
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header