"use client";

import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/Footer";

const categoryOptions = ["all", "agriculture", "farming", "crops", "livestock", "technology"];

const NewsPage = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isHindi, setIsHindi] = useState(false);
  const [translatedNews, setTranslatedNews] = useState({});
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await fetch(`/api/farmer-news?category=${selectedCategory}`);
      if (!response.ok) {
        throw new Error("Failed to fetch live news");
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.news)) {
        setNewsData(data.news);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      if (!newsData.length) {
        setNewsData([]);
      }
      setErrorMessage("Live news is temporarily unavailable. Showing the latest cached stories when available.");
    } finally {
      setLoading(false);
    }
  };

  const translateNews = async () => {
    if (Object.keys(translatedNews).length > 0) {
      setIsHindi(true);
      return;
    }

    setTranslating(true);
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      const newsToTranslate = newsData.slice(0, 20);
      const newsText = newsToTranslate.map(n => `Title: ${n.title}\nDescription: ${n.description}`).join('\n---\n');
      
      const prompt = `Translate the following news articles into clear, simple Hindi. 
Keep the format with "Title:" and "Description:" labels.
Preserve the meaning and context for farming/agriculture content.

NEWS ARTICLES:
${newsText}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const result = await response.json();
      const hindiText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Parse translated news
      const translated = {};
      newsToTranslate.forEach((news, idx) => {
        translated[`${news.title}-${idx}`] = {
          title: news.title,
          description: news.description
        };
      });
      
      // Extract Hindi translations from response
      const sections = hindiText.split('---');
      sections.forEach((section, idx) => {
        if (idx < newsToTranslate.length) {
          const titleMatch = section.match(/(?:Title:|शीर्षक:)\s*(.+?)(?:\n|Description|विवरण)/);
          const descMatch = section.match(/(?:Description:|विवरण:)\s*(.+?)$/s);
          
          const key = `${newsToTranslate[idx].title}-${idx}`;
          translated[key] = {
            title: titleMatch ? titleMatch[1].trim() : newsToTranslate[idx].title,
            description: descMatch ? descMatch[1].trim() : newsToTranslate[idx].description
          };
        }
      });
      
      setTranslatedNews(translated);
      setIsHindi(true);
    } catch (err) {
      console.error("Translation error:", err);
      alert("Translation failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  const toggleLanguage = () => {
    if (isHindi) {
      setIsHindi(false);
    } else {
      if (Object.keys(translatedNews).length === 0) {
        translateNews();
      } else {
        setIsHindi(true);
      }
    }
  };

  const getNewsTitle = (news, index) => {
    if (isHindi && translatedNews[`${news.title}-${index}`]) {
      return translatedNews[`${news.title}-${index}`].title;
    }
    return news.title;
  };

  const getNewsDescription = (news, index) => {
    if (isHindi && translatedNews[`${news.title}-${index}`]) {
      return translatedNews[`${news.title}-${index}`].description;
    }
    return news.description;
  };

  const headlinesData = useMemo(() => newsData.slice(0, 8), [newsData]);
  const featuredData = useMemo(() => newsData.slice(0, 3), [newsData]);

  const getCategoryIcon = (category) => {
    const icons = {
      agriculture: "🌱",
      farming: "🚜",
      crops: "🌾",
      livestock: "🐄",
      technology: "💻",
      all: "📰",
    };
    return icons[category?.toLowerCase()] || "📰";
  };

  const getHoursDifference = (dateString) => {
    if (!dateString) return 999;
    const now = new Date();
    const newsDate = new Date(dateString);
    return Math.floor((now - newsDate) / (1000 * 60 * 60));
  };

  const getTrendingBadge = (date, index) => {
    const hoursDiff = getHoursDifference(date);
    if (hoursDiff < 1) {
      return (
        <span className="inline-block bg-linear-to-r from-rose-500 to-orange-400 text-white text-xs font-semibold px-3 py-1 rounded-full ml-2 animate-pulse">
          🔥 JUST NOW
        </span>
      );
    }
    if (hoursDiff < 2) {
      return (
        <span className="inline-block bg-linear-to-r from-amber-500 to-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full ml-2">
          ⚡ NEW
        </span>
      );
    }
    if (index < 3) {
      return (
        <span className="inline-block bg-linear-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full ml-2">
          📈 TRENDING
        </span>
      );
    }
    if (hoursDiff < 6) {
      return (
        <span className="inline-block bg-linear-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full ml-2">
          🔥 HOT
        </span>
      );
    }
    return null;
  };

  const formattedDate = (dateString, format = "short") => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      ...(format === "full"
        ? { hour: "2-digit", minute: "2-digit", hour12: true }
        : {}),
    });
  };

  const hasNews = newsData.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-slate-100">

      <section className="bg-linear-to-r from-emerald-600 via-emerald-500 to-cyan-500 text-white py-14 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80')" }} />
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-6xl animate-bounce">🌾</div>
            <button
              onClick={toggleLanguage}
              disabled={translating}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all backdrop-blur"
            >
              {translating ? "Translating..." : isHindi ? "English में देखें" : "हिंदी में देखें"}
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">{isHindi ? "किसान समाचार केंद्र" : "Farmers News Hub"}</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {isHindi 
              ? "किसानों, सहकारिता और कृषि स्टार्टअप के लिए तैयार किए गए लाइव कृषि समाचार। हर पाँच मिनट में अपडेट होता है।"
              : "Live agricultural headlines, curated for farmers, cooperatives, and agri-startups. Updated every five minutes."
            }
          </p>
          {errorMessage && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm bg-white/20 backdrop-blur px-4 py-2 rounded-full">
              <span className="h-2 w-2 rounded-full bg-yellow-300 animate-pulse" />
              {errorMessage}
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-lg border border-emerald-50 p-6 mb-10">
          <h3 className="text-xl font-semibold text-slate-900 text-center mb-6">{isHindi ? "श्रेणी के अनुसार फ़िल्टर करें" : "Filter by Category"}</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {categoryOptions.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition flex items-center gap-2 border ${
                  selectedCategory === category
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-white"
                }`}
              >
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <span className="capitalize">{category}</span>
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-slate-500 mt-4 text-lg">Fetching live headlines...</p>
          </div>
        )}

        {!loading && hasNews && (
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr] mb-12">
            <div className="bg-white rounded-3xl shadow-xl border border-white/60 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">📰</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-500">{isHindi ? "लाइव हाइलाइट्स" : "Live Highlights"}</p>
                  <h2 className="text-3xl font-bold text-slate-900">{isHindi ? "ताज़ा समाचार शीर्षक" : "Breaking News Headlines"}</h2>
                </div>
              </div>
              <div className="space-y-5">
                {headlinesData.map((news, index) => (
                  <div key={`${news.title}-${index}`} className="border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition bg-slate-50/50">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getCategoryIcon(news.category)}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 leading-snug">
                          {getNewsTitle(news, index)}
                          {getTrendingBadge(news.date, index)}
                        </h3>
                        <p className="text-sm text-slate-500 mt-2">
                          {news.source || "Agri Desk"} • {formattedDate(news.date, "full")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-white/60 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">⭐</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-500">{isHindi ? "संपादक की पसंद" : "Editor's Picks"}</p>
                  <h2 className="text-2xl font-bold text-slate-900">{isHindi ? "विशेष कहानियाँ" : "Featured Stories"}</h2>
                </div>
              </div>
              <div className="space-y-6">
                {featuredData.map((news, index) => (
                  <article key={`${news.title}-feature-${index}`} className="rounded-2xl border border-slate-100 p-5 hover:border-emerald-200 transition">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                        {getCategoryIcon(news.category)} {news.category || (isHindi ? "खेती" : "Farming")}
                      </span>
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                        {isHindi ? "शीर्ष कहानी" : "Top Story"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      {getNewsTitle(news, index)}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3">{getNewsDescription(news, index)}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
                      <span>{news.source || "Agri Bureau"}</span>
                      <span>{formattedDate(news.date)}</span>
                    </div>
                    {news.link && (
                      <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600"
                      >
                        {isHindi ? "पूरी कहानी पढ़ें" : "Read Full Story"}
                        <span aria-hidden>→</span>
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && hasNews && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📋</span>
              <h2 className="text-3xl font-bold text-slate-900">{isHindi ? "सभी कृषि समाचार" : "All Farming News"}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsData.map((news, index) => (
                <article
                  key={`${news.title}-grid-${index}`}
                  className="bg-white rounded-2xl border border-slate-100 shadow hover:shadow-2xl transition flex flex-col"
                >
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{getCategoryIcon(news.category)}</span>
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                        {news.category || (isHindi ? "खेती" : "Farming")}
                      </span>
                      {getHoursDifference(news.date) < 1 && (
                        <span className="bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                          {isHindi ? "लाइव" : "LIVE"}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                      {getNewsTitle(news, index)}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3">{getNewsDescription(news, index)}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{news.source || "Agri Desk"}</span>
                      <span>{formattedDate(news.date)}</span>
                    </div>
                    {news.link && (
                      <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition px-4 py-2 rounded-lg"
                      >
                        {isHindi ? "और पढ़ें" : "Read More"}
                        <span aria-hidden>→</span>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {!loading && !hasNews && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-inner border border-dashed border-emerald-200">
            <div className="text-8xl mb-4">🌾</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{isHindi ? "कोई समाचार उपलब्ध नहीं" : "No News Available"}</h3>
            <p className="text-slate-500">{isHindi ? "कुछ मिनट में फिर से कोशिश करें—हम हर पाँच मिनट में कहानियों को ताज़ा करते हैं।" : "Try again in a few minutes—we refresh stories every five minutes."}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm font-semibold">
        <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
        Auto-refresh every 5 minutes
      </div>

      <Footer />
    </div>
  );
};

export default NewsPage;
