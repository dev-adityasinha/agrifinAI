"use client";
import { useState } from 'react';
import { FiMapPin, FiSearch, FiSun, FiDroplet, FiWind, FiCloudRain, FiThermometer, FiArrowRight } from 'react-icons/fi';

// A more robust component to parse simple markdown (bold and list items)
const SimpleMarkdownParser = ({ text }) => {
  const lines = text.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Handle list items
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const itemContent = line.trim().substring(2);
      const parts = itemContent.split(/(\*\*.*?\*\*)/g); // Split by bold tags
      elements.push(
        <li key={i} className="ml-5 list-disc text-gray-700">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </li>
      );
      continue;
    }

    // Handle bold-only lines as headings
    if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      elements.push(
        <h3 key={i} className="font-bold text-lg text-green-900 mt-4 mb-2">{line.trim().slice(2, -2)}</h3>
      );
      continue;
    }

    // Handle regular paragraphs
    if (line.trim()) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      elements.push(
        <p key={i} className="my-1 text-gray-700">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }
  }
  return <div>{elements}</div>;
};


const WeatherPage = () => {
  // Translation states
  const [isHindi, setIsHindi] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [translating, setTranslating] = useState(false);

  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  // English to hindi translation
  /* ---------------- TRANSLATE USING GEMINI ---------------- */
  const translateToHindi = async () => {
    if (!weatherData?.recommendations) return;

    setTranslating(true);
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      const prompt = `
Translate the following agricultural advisory into clear, simple Hindi.
Preserve headings, bullet points, and formatting.

TEXT:
${weatherData.recommendations}
`;

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
      const hindi =
        result?.candidates?.[0]?.content?.parts?.[0]?.text;

      setTranslatedText(hindi || "अनुवाद उपलब्ध नहीं है।");
      setIsHindi(true);
    } catch (err) {
      console.error("Translation error:", err);
      setTranslatedText("अनुवाद में त्रुटि हुई।");
      setIsHindi(true);
    } finally {
      setTranslating(false);
    }
  };

  const toggleLanguage = () => {
    if (isHindi) {
      setIsHindi(false);
    } else {
      if (!translatedText) translateToHindi();
      else setIsHindi(true);
    }
  };

  const detectMyLocation = async () => {
    if (!navigator.geolocation) {
      setError('❌ Geolocation not supported by your browser. Please enter location manually.');
      return;
    }

    setDetectingLocation(true);
    setError('');
    setLocation('📍 Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log('📍 GPS Coordinates:', lat, lon);

        try {
          setLocation('🌍 Getting location name...');
          // Use OpenWeather Geocoding API to get city name from coordinates
          const openWeatherKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

          if (!openWeatherKey) {
            console.warn('Weather API key not configured');
            setError('Weather API key not configured. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to .env.local');
            setDetectingLocation(false);
            return;
          }

          const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${openWeatherKey}`
          );

          if (!geoResponse.ok) {
            console.error('Geo API response not OK:', geoResponse.status);
            setError('Failed to get location details. Please try entering city manually.');
            setDetectingLocation(false);
            return;
          }

          const geoData = await geoResponse.json();

          if (geoData && geoData.length > 0) {
            const locationInfo = geoData[0];
            const detectedLocation = `${locationInfo.name}, ${locationInfo.state || locationInfo.country}`;
            setLocation(detectedLocation);
            console.log('✅ Location detected:', detectedLocation);

            setDetectingLocation(false);

            // Auto-fetch weather after detecting location
            setTimeout(() => {
              fetchWeatherDataForCity(locationInfo.name);
            }, 300);
          } else {
            throw new Error('Location data not available');
          }
        } catch (err) {
          console.error('Location detection error:', err);
          setError(`❌ Failed to detect location: ${err.message}. Please try again or enter manually.`);
          setLocation('');
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Location access denied.';

        if (error.code === 1) {
          errorMsg = 'Please allow location access in your browser settings.';
        } else if (error.code === 2) {
          errorMsg = 'Location information is unavailable. Check your device settings.';
        } else if (error.code === 3) {
          errorMsg = 'Location request timed out. Please try again.';
        } else {
          errorMsg = 'An unknown error occurred.';
        }

        setError(errorMsg);
        setLocation('');
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const fetchWeatherDataForCity = async (cityName) => {
    if (!cityName || cityName.trim() === '') {
      setError('Please enter a valid location');
      return;
    }

    console.log('🔍 Searching weather for:', cityName);

    setLoading(true);
    setError('');
    setWeatherData(null); // Clear old data first

    try {
      const weatherApiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      if (!weatherApiKey) {
        setError('Weather API key not configured. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to .env.local');
        setLoading(false);
        return;
      }

      const searchQuery = encodeURIComponent(cityName.trim());

      // Use OpenWeatherMap Geocoding API to get coordinates
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=5&appid=${weatherApiKey}`;
      console.log('🔎 Searching locations...');

      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) {
        throw new Error('Failed to search locations');
      }

      const geoResults = await geoResponse.json();
      console.log('📍 Found locations:', geoResults);

      if (!geoResults || geoResults.length === 0) {
        throw new Error(`No location found for "${cityName}". Please check spelling.`);
      }

      // Use the first result
      const location = geoResults[0];
      const { lat, lon, name, state, country } = location;

      console.log('✅ FINAL MATCH:', name, state, country);

      // Fetch current weather and forecast using OpenWeatherMap
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;

      console.log('📡 Fetching weather data...');
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const currentData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
      console.log('✅ Weather data received for:', name, state);

      // Process forecast data - OpenWeatherMap gives 3-hour intervals
      const dailyForecast = [];
      const dailyData = {};

      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            temps: [],
            humidity: [],
            rainfall: 0,
            wind: [],
            descriptions: [],
            icons: []
          };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].humidity.push(item.main.humidity);
        dailyData[date].rainfall += item.rain?.['3h'] || 0;
        dailyData[date].wind.push(item.wind.speed);
        dailyData[date].descriptions.push(item.weather[0].description);
        dailyData[date].icons.push(`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`);
      });

      // Convert to array and get first 7 days
      Object.keys(dailyData).slice(0, 7).forEach(date => {
        const day = dailyData[date];
        dailyForecast.push({
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length),
          humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
          rainfall: day.rainfall,
          wind: Math.round(day.wind.reduce((a, b) => a + b) / day.wind.length * 3.6), // m/s to km/h
          description: day.descriptions[0],
          icon: day.icons[0]
        });
      });

      console.log('🤖 Fetching AI recommendations...');
      const geminiRecommendation = await fetchGeminiRecommendations(
        `${name}, ${state}, ${country}`,
        dailyForecast
      );

      const newWeatherData = {
        city: name,
        country: country,
        region: state || '',
        lat: lat,
        lon: lon,
        forecast: dailyForecast,
        recommendations: geminiRecommendation,
        current: {
          temp: Math.round(currentData.main.temp),
          feelsLike: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          wind: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
          condition: currentData.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`
        }
      };

      console.log('💾 Setting weather data:', newWeatherData.city);
      setWeatherData(newWeatherData);

    } catch (err) {
      console.error('❌ Weather fetch error:', err);
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeminiRecommendations = async (location, forecast) => {
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + 3);
      const dateRange = `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;

      const prompt = `
You are an expert agronomist and AI advisor for Indian farmers.
Based on the weather forecast for ${location} from ${dateRange}, provide a crop growing plan for the next 3 months.

For each month, list:
- Recommended crops (based on weather and seasonality)
- Key actions (land prep, sowing, irrigation, fertilization, pest/disease management, harvesting)
- Any important local advice for ${location}

Requirements:
- Limit your answer to 200-250 words.
- Format your answer using markdown: use double asterisks (**) for headings and bold text, bullet points for lists.
- Always cite your sources (public datasets, government portals, etc.) and explain your reasoning for reliability.
- If possible, respond in the user's local language if specified.

Weather data: ${JSON.stringify(forecast)}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const result = await response.json();
      if (result.candidates && result.candidates.length > 0) {
        return result.candidates[0].content.parts[0].text;
      }
      throw new Error("Failed to get recommendation from AI.");
    } catch (err) {
      console.error("Error fetching Gemini recommendations:", err);
      return "Could not load AI recommendations at this time.";
    }
  };

  const fetchWeatherData = async () => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) {
      setError('Please enter a location.');
      return;
    }
    console.log('🔎 Manual search for:', trimmedLocation);
    await fetchWeatherDataForCity(trimmedLocation);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Search Section */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Weather & Farming Advisory</h1>
          <p className="text-gray-600 mb-6">Get real-time weather forecasts and AI-powered farming recommendations for better crop planning.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter city name (e.g., Mumbai, Delhi, Pune)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1 ml-10">
                💡 For accurate results, include state name (e.g., "Durg, Chhattisgarh")
              </p>
            </div>
            <button
              type="button"
              onClick={detectMyLocation}
              disabled={detectingLocation || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:bg-blue-400"
            >
              {detectingLocation ? 'Detecting...' : <><FiMapPin /><span>Use My Location</span></>}
            </button>
            <button
              type="submit"
              disabled={loading || detectingLocation}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:bg-green-400"
            >
              {loading ? 'Loading...' : <><FiSearch /><span>Get Forecast</span></>}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </section>

        {/* Weather Display Section */}
        {weatherData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Forecast */}
            <div className="lg:col-span-1 space-y-6">
              {/* Current Weather Card */}
              {weatherData.current && (
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{weatherData.city}</h2>
                      <p className="text-blue-100">{weatherData.region}, {weatherData.country}</p>
                      <p className="text-xs text-blue-200 mt-1">📍 {weatherData.lat.toFixed(4)}°N, {weatherData.lon.toFixed(4)}°E</p>
                    </div>
                    <img src={weatherData.current.icon} alt={weatherData.current.condition} className="w-16 h-16" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">{weatherData.current.temp}°</span>
                    <span className="text-xl">C</span>
                  </div>
                  <p className="text-blue-100 mb-4 capitalize">{weatherData.current.condition}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FiThermometer className="w-4 h-4" />
                      <span>Feels like {weatherData.current.feelsLike}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiDroplet className="w-4 h-4" />
                      <span>Humidity {weatherData.current.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiWind className="w-4 h-4" />
                      <span>Wind {weatherData.current.wind} km/h</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Map */}
              {weatherData && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FiMapPin className="text-green-600" />
                    Location Map
                  </h3>
                  <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                    <iframe
                      width="100%"
                      height="300"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${weatherData.lon - 0.1},${weatherData.lat - 0.1},${weatherData.lon + 0.1},${weatherData.lat + 0.1}&layer=mapnik&marker=${weatherData.lat},${weatherData.lon}`}
                      style={{ border: 0 }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <a
                      href={`https://www.google.com/maps?q=${weatherData.lat},${weatherData.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                    >
                      <FiArrowRight />
                      Open in Google Maps
                    </a>
                    <span className="text-gray-500">
                      Zoom: 14x
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">7-Day Forecast</h2>
                <div className="space-y-4">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img src={day.icon} alt={day.description} className="w-10 h-10" />
                        <div>
                          <p className="font-bold text-gray-800">{day.day}</p>
                          <p className="text-sm text-gray-500 capitalize">{day.description}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg text-gray-800">{day.temp}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Recommendations */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-green-800">
                    AI-Powered Growing Recommendations
                  </h2>

                  {/* Translate Button (appears after data loads) */}
                  <button
                    onClick={toggleLanguage}
                    disabled={translating}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:bg-green-400"
                  >
                    {translating
                      ? "Translating..."
                      : isHindi
                        ? "View in English"
                        : "हिंदी में देखें"}
                  </button>
                </div>

                <div className="p-4 bg-green-50/50 rounded-lg border-l-4 border-green-500">
                  <SimpleMarkdownParser
                    text={
                      isHindi && translatedText
                        ? translatedText
                        : weatherData.recommendations
                    }
                  />

                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <FiSun className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Your Weather Insights Await</h3>
            <p className="mt-2 text-gray-500">Enter a location above to get started.</p>
          </div>
        )}
      </main>

    </div>
  );
};

export default WeatherPage;