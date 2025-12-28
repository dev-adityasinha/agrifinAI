"use client";
import "../i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import ProductImage from "../components/ProductImage";
import { foodItems } from "../data/foodItems";
import {
  FiX,
  FiSearch,
  FiNavigation,
  FiMapPin,
  FiStar,
  FiHeart,
  FiMail,
  FiShoppingBag,
  FiArrowRight,
  FiTrendingUp,
  FiShield,
  FiUsers,
  FiClock,
  FiPhone,
  FiUser,
} from "react-icons/fi";

const stateToLanguage = {
  Maharashtra: "mr",
  Gujarat: "gu",
  Punjab: "pa",
  "West Bengal": "bn",
  "Tamil Nadu": "ta",
  Karnataka: "kn",
  "Uttar Pradesh": "hi",
  Haryana: "hi",
  Bihar: "hi",
  Rajasthan: "hi",
  "Madhya Pradesh": "hi",
  Kerala: "en", // add 'ml' later if translations added
  Telangana: "hi",
  "Andhra Pradesh": "hi",
  Odisha: "en", // add 'or' later
  Jharkhand: "hi",
  Chhattisgarh: "hi",
  Delhi: "hi",
};

// Helper to safely switch
function switchLanguageForState(state, manual = false) {
  if (!state || typeof window === 'undefined') return;
  const code = stateToLanguage[state];
  if (code && i18n.language !== code) {
    // If user manually selected or no manual selection stored yet
    const userPref = localStorage.getItem("userLangPref");
    if (manual || !userPref) {
      i18n.changeLanguage(code);
      if (!manual) localStorage.setItem("autoLangSet", "1");
      if (manual) localStorage.setItem("userLangPref", code);
    }
  }
}

const LandingPage = () => {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [detectedArea, setDetectedArea] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(foodItems);
  const [realProducts, setRealProducts] = useState([]); // Products from backend
  const [categories] = useState(["all", "vegetables", "fruits", "grains", "dairy"]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [toast, setToast] = useState(null);
  const [manualLang, setManualLang] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  
  // News state
  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsCategory, setNewsCategory] = useState('all');

  // Fetch approved products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/products?status=approved`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.log('Backend API not available, using static data');
          return;
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Transform backend products to match foodItems format
          const transformed = data.data.map(p => ({
            id: p._id,
            name: p.productName,
            price: `₹${p.price}/${p.unit}`,
            origin: `${p.district}, ${p.state}`,
            category: p.category.toLowerCase(),
            rating: 4.5,
            image: p.images[0] || '/fallback-product.jpg',
            description: p.description || '',
            quantity: `${p.quantity} ${p.unit}`,
            organic: p.organicCertified,
            seller: p.contactName,
            phone: p.contactPhone,
          }));
          setRealProducts(transformed);
          // Mix real products with static foodItems
          setFilteredProducts([...transformed, ...foodItems]);
        } else {
          // Use static products if no backend data
          setFilteredProducts(foodItems);
        }
      } catch (error) {
        console.log('Backend not available, using static products');
        // Fallback to static products
        setFilteredProducts(foodItems);
      }
    };

    fetchProducts();
  }, []);

  // Fetch news data
  useEffect(() => {
    loadNews();
  }, [newsCategory]);

  const loadNews = async () => {
    try {
      setNewsLoading(true);
      const response = await fetch(`/api/farmer-news?category=${newsCategory}`);
      const data = await response.json();
      
      if (data.success && data.news) {
        setNewsData(data.news.slice(0, 6)); // Show 6 news items on home page
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setNewsLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      agriculture: '🌱',
      farming: '🚜',
      crops: '🌾',
      livestock: '🐄',
      technology: '💻',
      all: '📰'
    };
    return icons[category?.toLowerCase()] || '📰';
  };

  // Initialize manualLang only on client
  useEffect(() => {
    setManualLang(localStorage.getItem("userLangPref") || "");
  }, []);

  // Check login status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("agrifinai_user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserName(parsed.name || parsed.email.split('@')[0]);
      }
    }
  }, []);

  // Auto language adjust
  useEffect(() => {
    if (navigator.language) {
      const browserLanguage = navigator.language.substring(0, 2);
      if (i18n.language !== browserLanguage) i18n.changeLanguage(browserLanguage);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  // Load persisted language once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("userLangPref");
      if (stored && stored !== i18n.language) {
        i18n.changeLanguage(stored);
      }
    }
  }, []);

  // Slight toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 3800);
      return () => clearTimeout(id);
    }
  }, [toast]);

  // Filtering + sorting
  useEffect(() => {
    // Combine real products with static foodItems
    let allItems = [...realProducts, ...foodItems];
    let fp = allItems;
    
    if (selectedCategory !== "all") {
      fp = fp.filter((p) => p.category.toLowerCase() === selectedCategory);
    }
    if (searchQuery.trim()) {
      fp = fp.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.origin.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    fp = fp.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price.replace(/[^\d.]/g, "")) - parseFloat(b.price.replace(/[^\d.]/g, ""));
        case "price-high":
          return parseFloat(b.price.replace(/[^\d.]/g, "")) - parseFloat(a.price.replace(/[^\d.]/g, ""));
        case "rating":
          return b.rating - a.rating;
        default:
          return b.id - a.id;
      }
    });
    setFilteredProducts(fp);
  }, [searchQuery, selectedCategory, sortBy, realProducts]);

  const getLocation = () => {
    setIsLocating(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError(t("Geolocation not supported"));
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Use WeatherAPI for better location data
          const weatherApiKey = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
          const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${latitude},${longitude}&aqi=no`
          );
          if (response.ok) {
            const data = await response.json();
            const loc = data.location;
            const detectedLocation = `${loc.name}, ${loc.region}, ${loc.country}`;
            setDetectedArea(detectedLocation);
            filterProductsByLocation(loc.region);
            // Auto language switch if user has not chosen manually
            if (!localStorage.getItem("userLangPref")) {
              const prev = i18n.language;
              switchLanguageForState(loc.region);
              if (i18n.language !== prev && stateToLanguage[loc.region]) {
                setToast({ type: "lang", msg: t("Language switched for your region") + ": " + i18n.language.toUpperCase() });
              }
            }
          }
        } catch {
          setLocationError(t("Unable to detect location. Please try again."));
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setLocationError(t("Location access denied. Please enable location services."));
        setIsLocating(false);
      }
    );
  };

  const filterProductsByLocation = (state) => {
    const allItems = [...realProducts, ...foodItems];
    const filtered = allItems.filter(
      (p) => p.origin.includes(state) || p.name.toLowerCase().includes("local")
    );
    setFilteredProducts(filtered.length ? filtered : allItems.slice(0, 8));
  };

  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      filterProductsByLocation(searchQuery.trim());
      setDetectedArea(searchQuery.trim());
    }
  };

  const clearFilters = () => {
    const allItems = [...realProducts, ...foodItems];
    setFilteredProducts(allItems);
    setDetectedArea("");
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
    if (i18n.language !== "en") i18n.changeLanguage("en");
  };

  // Manual language change handler
  const handleManualLanguage = (e) => {
    if (typeof window === 'undefined') return;
    const val = e.target.value;
    setManualLang(val);
    if (val) {
      localStorage.setItem("userLangPref", val);
      i18n.changeLanguage(val);
      setToast({ type: "lang", msg: t("Language set to") + ": " + val.toUpperCase() });
    } else {
      localStorage.removeItem("userLangPref");
      setToast({ type: "lang", msg: t("Using automatic language") });
    }
  };

  return (
    <div className="flex flex-col min-h-screen transition-colors bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:bg-gray-950">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999]">
          <div className="flex items-center gap-3 px-5 py-3 text-sm text-white bg-green-600 shadow-lg rounded-xl animate-slide-down">
            <FiShield className="w-4 h-4" />
            <span>{toast.msg}</span>
            <button onClick={() => setToast(null)} className="text-white/70 hover:text-white">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-transparent to-emerald-600/10" />
          <div className="relative px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-32">
            <div className="grid items-center lg:grid-cols-2 gap-14">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 border border-green-100 rounded-full shadow-sm bg-white/80 backdrop-blur">
                  🌱 {t("Empowering Farmers with AI")}
                </div>
                <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
                  <span className="text-transparent bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text">
                    {t("Direct Farm")}
                  </span>{" "}
                  {t("Marketplace & Intelligence")}
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-gray-600">
                  {t(
                    "Discover verified farm-fresh produce, negotiate directly with growers, and access actionable insights for smarter sourcing."
                  )}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="#marketplace"
                    className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl hover:shadow-xl hover:scale-105"
                  >
                    {t("Browse Products")} <FiShoppingBag className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    href="/sell"
                    className="inline-flex items-center justify-center px-8 py-4 font-semibold text-green-700 transition-all border-2 border-green-600 rounded-xl hover:bg-green-50"
                  >
                    {t("Become a Seller")}
                  </Link>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col gap-4 p-4 mt-4 shadow-lg bg-white/70 backdrop-blur rounded-2xl md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <FiSearch className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                      placeholder={t("Enter location or product...")}
                      className="w-full py-3 pr-4 border border-gray-200 pl-11 rounded-xl focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={getLocation}
                      disabled={isLocating}
                      className="flex items-center gap-2 px-5 py-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <FiNavigation className="w-4 h-4" />
                      {t("Locate")}
                    </button>
                    <button
                      onClick={handleManualSearch}
                      className="px-6 py-3 font-semibold text-white transition rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg"
                    >
                      {t("Search")}
                    </button>
                  </div>
                </div>
                {locationError && <p className="text-sm text-red-500">{locationError}</p>}
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl opacity-20 rotate-3" />
                <div className="relative grid grid-cols-2 gap-4">
                  {filteredProducts.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="overflow-hidden transition-all duration-300 bg-white shadow-md rounded-2xl group hover:shadow-xl"
                    >
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        className="object-cover w-full h-40 transition group-hover:scale-105"
                      />
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs font-medium text-green-600">{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-20 md:grid-cols-4">
              {[
                { number: "5,000+", label: t("Active Farmers"), icon: FiUsers },
                { number: "₹2Cr+", label: t("Transactions"), icon: FiTrendingUp },
                { number: "50+", label: t("Cities Covered"), icon: FiMapPin },
                { number: "4.8★", label: t("Platform Rating"), icon: FiStar },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-5 text-center transition-all duration-300 border border-green-100 group bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl dark:border-gray-700 hover:shadow-lg hover:scale-105"
                >
                  <item.icon className="mx-auto mb-2 text-green-600 w-7 h-7" />
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">{item.number}</h3>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Marketplace */}
        <section id="marketplace" className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                {t("Fresh")}{" "}
                <span className="text-transparent bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text">
                  {t("Marketplace")}
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                {t("Discover premium produce directly from verified local farmers")}
              </p>
              {detectedArea && (
                <p className="mt-3 text-sm text-green-700 inline-flex items-center gap-2 bg-green-100 px-4 py-1.5 rounded-full">
                  <FiMapPin className="w-4 h-4" />
                  {t("Showing products near")} {detectedArea}
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="p-6 mb-10 bg-white border border-green-100 shadow-lg rounded-2xl">
              <div className="flex flex-col items-center justify-between gap-6 xl:flex-row">
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedCategory === c
                          ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow"
                          : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700"
                      }`}
                    >
                      {c === "all"
                        ? t("All Products")
                        : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="newest">{t("Newest")}</option>
                    <option value="price-low">{t("Price: Low → High")}</option>
                    <option value="price-high">{t("Price: High → Low")}</option>
                    <option value="rating">{t("Rating")}</option>
                  </select>
                  {(selectedCategory !== "all" || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-red-600 transition rounded-lg hover:bg-red-50"
                    >
                      {t("Clear")}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{filteredProducts.length} {t("results")}</span>
                {searchQuery && <span>{t("Query")}: “{searchQuery}”</span>}
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white shadow rounded-2xl">
                <FiShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <h3 className="text-xl font-semibold text-gray-800">
                  {t("No products found")}
                </h3>
                <p className="mt-2 text-gray-500">
                  {t("Try adjusting filters or search criteria")}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 mt-6 font-semibold text-white transition rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg"
                >
                  {t("Show All Products")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col overflow-hidden transition-all bg-white border border-transparent shadow group rounded-2xl hover:shadow-xl hover:border-green-200 dark:hover:border-green-500"
                  >
                    <div className="relative">
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        className="object-cover w-full h-56 transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute px-3 py-1 text-xs font-semibold text-green-700 rounded-full top-4 left-4 bg-white/90">
                        {p.category}
                      </span>
                      <button
                        className="absolute p-2 transition rounded-full shadow top-4 right-4 bg-white/90 hover:bg-white"
                        aria-label="Wishlist"
                      >
                        <FiHeart className="w-4 h-4 text-gray-600 transition group-hover:text-red-500" />
                      </button>
                      <div className="absolute text-white bottom-4 left-4">
                        <h3 className="text-lg font-bold">{p.name}</h3>
                        <p className="flex items-center gap-1 text-xs opacity-90">
                          <FiMapPin className="w-3 h-3" /> {p.origin}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 gap-4 p-5">
                      <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
                        {p.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-green-700">{p.price}</p>
                          <p className="flex items-center gap-1 text-xs text-gray-400">
                            <FiClock className="w-3 h-3" /> {t("Fresh today")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <FiStar className="w-4 h-4 fill-current" />
                          <span className="text-sm font-semibold text-gray-700">
                            {p.rating}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/inquiry/${p.id}`}
                        className="mt-auto inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:shadow-lg hover:scale-[1.02] transition"
                      >
                        <FiMail className="w-4 h-4" />
                        {t("Send Inquiry")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                {t("Why Choose")}{" "}
                <span className="text-transparent bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text">
                  AgriFinAI
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                {t("A unified platform connecting sustainable supply with intelligent demand")}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: FiShield,
                  title: t("Verified Farmers"),
                  desc: t("Ensuring trust, traceability and quality sourcing"),
                },
                {
                  icon: FiTrendingUp,
                  title: t("Fair Pricing"),
                  desc: t("Equitable pricing empowering growers & buyers"),
                },
                {
                  icon: FiMail,
                  title: t("Direct Negotiation"),
                  desc: t("No middlemen – build lasting supplier relations"),
                },
                {
                  icon: FiUsers,
                  title: t("Community Growth"),
                  desc: t("Strengthening local agri ecosystems"),
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="relative p-6 overflow-hidden transition-all duration-300 group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-xl"
                >
                  <div className="absolute inset-0 transition opacity-0 group-hover:opacity-100 bg-gradient-to-br from-green-100/40 to-emerald-100/40" />
                  <f.icon className="relative w-10 h-10 mb-4 text-green-600" />
                  <h3 className="relative mb-2 text-lg font-bold text-gray-900">
                    {f.title}
                  </h3>
                  <p className="relative text-sm leading-relaxed text-gray-600">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />
            <div className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                {t("Ready to Transform Agriculture?")}
              </h2>
              <p className="max-w-2xl mx-auto mb-8 text-lg text-green-100">
                {t(
                  "Join thousands of farmers and buyers already creating a more resilient and transparent food system."
                )}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-green-600 transition-all bg-white rounded-xl hover:shadow-xl hover:scale-105"
                >
                  {t("Start Selling Today")}
                  <FiArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all border-2 border-white rounded-xl hover:bg-white hover:text-green-600"
                >
                  {t("Contact Us")}
                  <FiMail className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
        </section>

        {/* Farming News Section */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* News Header */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-5xl">🌾</span>
                <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
                  {t("Latest")}{" "}
                  <span className="text-transparent bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text">
                    {t("Farming News")}
                  </span>
                </h2>
              </div>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                {t("Stay updated with the latest agriculture and farming news")}
              </p>
            </div>

            {/* Category Filters */}
            <div className="p-6 mb-10 border border-green-100 shadow-lg bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl">
              <div className="flex flex-wrap justify-center gap-3">
                {['all', 'agriculture', 'farming', 'crops', 'livestock', 'technology'].map(category => (
                  <button
                    key={category}
                    onClick={() => setNewsCategory(category)}
                    className={`${
                      newsCategory === category
                        ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-green-100 hover:text-green-700'
                    } px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm border border-gray-200`}
                  >
                    <span className="text-xl">{getCategoryIcon(category)}</span>
                    <span className="capitalize">{t(category)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* News Loading State */}
            {newsLoading && (
              <div className="py-12 text-center">
                <div className="inline-block w-16 h-16 border-t-4 border-b-4 border-green-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-lg text-gray-600">{t("Loading farming news...")}</p>
              </div>
            )}

            {/* News Grid */}
            {!newsLoading && newsData.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {newsData.map((news, index) => (
                    <div
                      key={index}
                      className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-2xl hover:border-green-300 group"
                    >
                      {/* News Image or Icon Placeholder */}
                      {news.image ? (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={news.image} 
                            alt={news.title}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="items-center justify-center hidden h-48 bg-gradient-to-br from-green-400 to-emerald-500"
                            style={{display: 'none'}}
                          >
                            <span className="text-8xl">{getCategoryIcon(news.category)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-green-400 to-emerald-500">
                          <span className="text-8xl">{getCategoryIcon(news.category)}</span>
                        </div>
                      )}

                      <div className="p-6">
                        {/* Category Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-green-700 capitalize bg-green-100 rounded-full">
                            <span>{getCategoryIcon(news.category)}</span>
                            {news.category || 'Farming'}
                          </span>
                          {new Date(news.date) > new Date(Date.now() - 48 * 60 * 60 * 1000) && (
                            <span className="px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>

                        {/* News Title */}
                        <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-green-600">
                          {news.title}
                        </h3>

                        {/* News Description */}
                        <p className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-3">
                          {news.description}
                        </p>

                        {/* News Meta */}
                        <div className="flex items-center justify-between pb-4 mb-4 text-xs text-gray-500 border-b border-gray-100">
                          <span className="font-semibold">{news.source}</span>
                          <span>{new Date(news.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>

                        {/* Read More Button */}
                        {news.link && (
                          <a
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all font-semibold text-sm"
                          >
                            {t("Read Full Story")} <FiArrowRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All News Button */}
                <div className="mt-12 text-center">
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-white transition-all transform bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl hover:shadow-2xl hover:scale-105"
                  >
                    <span>🌾</span>
                    {t("View All Farming News")}
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </>
            )}

            {/* No News State */}
            {!newsLoading && newsData.length === 0 && (
              <div className="py-16 text-center border border-green-100 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl">
                <div className="mb-4 text-7xl">🌾</div>
                <h3 className="mb-2 text-2xl font-bold text-gray-800">{t("No News Available")}</h3>
                <p className="text-gray-600">{t("Check back soon for the latest farming updates!")}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-gray-300 bg-gray-950">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl">
                  A
                </div>
                <span className="text-xl font-semibold">AgriFinAI</span>
              </div>
              <p className="text-sm leading-relaxed">
                {t("Connecting farmers with buyers for a sustainable agricultural future.")}
              </p>
              <div className="flex gap-3">
                {["f", "t", "in"].map((s) => (
                  <span
                    key={s}
                    className="flex items-center justify-center text-sm transition bg-gray-800 rounded-lg cursor-pointer w-9 h-9 hover:bg-green-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                {t("Quick Links")}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="transition hover:text-white">
                    {t("About Us")}
                  </Link>
                </li>
                <li>
                  <Link href="/weather" className="transition hover:text-white">
                    {t("Weather")}
                  </Link>
                </li>
                <li>
                  <Link href="/loan" className="transition hover:text-white">
                    {t("Loans")}
                  </Link>
                </li>
                <li>
                  <Link href="/soil-health" className="transition hover:text-white">
                    {t("Soil Health")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                {t("Support")}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/faq" className="transition hover:text-white">
                    {t("FAQ")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition hover:text-white">
                    {t("Contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition hover:text-white">
                    {t("Privacy Policy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition hover:text-white">
                    {t("Terms of Service")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                {t("Contact")}
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-green-500" /> +91 123 456 7890
                </li>
                <li className="flex items-center gap-2">
                  <FiMail className="w-4 h-4 text-green-500" /> hello@agrifinai.com
                </li>
                <li className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-green-500" /> Mumbai, India
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 mt-12 text-xs text-center text-gray-500 border-t border-gray-800">
            © {new Date().getFullYear()} AgriFinAI. {t("All rights reserved.")} 
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;