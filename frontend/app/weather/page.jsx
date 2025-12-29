"use client";
import { useState, useEffect } from 'react';
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
  const [voices, setVoices] = useState([]);
  // Weather & location states
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  // TTS & word highlighting
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [spokenWords, setSpokenWords] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      setVoices(synthVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Auto-play recommendations when available
  useEffect(() => {
    if (weatherData?.recommendations) {
      // Small timeout to ensure UI renders and speech synthesis is ready
      const timer = setTimeout(() => {
        speakRecommendations();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [weatherData?.recommendations]);

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
      const hindi = result?.candidates?.[0]?.content?.parts?.[0]?.text;
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

  /* ---------------- TEXT-TO-SPEECH ---------------- */
  const speakRecommendations = () => {
    if (!weatherData?.recommendations) return;
    const textToSpeak = isHindi && translatedText ? translatedText : weatherData.recommendations;

    const cleanText = textToSpeak.replace(/\*\*/g, '').replace(/[-*]\s/g, '');
    const words = cleanText.split(' ');
    setSpokenWords(words);
    setCurrentWordIndex(-1);

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    if (isHindi) {
      utterance.lang = 'hi-IN';
      
      // For Hindi, we need to ensure voices are loaded
      const availableVoices = window.speechSynthesis.getVoices();
      
      if (availableVoices.length === 0) {
        console.warn('⚠️ No voices loaded yet. Waiting for voices...');
        // Force reload voices
        const loadVoicesAndSpeak = () => {
          const refreshedVoices = window.speechSynthesis.getVoices();
          if (refreshedVoices.length > 0) {
            selectAndSpeak(utterance, 'hi-IN', refreshedVoices);
          }
        };
        window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak;
        setTimeout(loadVoicesAndSpeak, 500);
        return;
      }

      selectAndSpeak(utterance, 'hi-IN', availableVoices);
    } else {
      utterance.lang = 'en-US';
      const englishVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en')
        || voices.find(v => v.lang.startsWith('en'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      setupUtteranceHandlers(utterance, words);
      window.speechSynthesis.speak(utterance);
    }
  };

  const selectAndSpeak = (utterance, lang, availableVoices) => {
    let selectedVoice = null;

    if (lang === 'hi-IN') {
      // Try different methods to find Hindi voice
      selectedVoice = availableVoices.find(v => v.lang === 'hi-IN');
      
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang === 'hi');
      }
      
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang.startsWith('hi'));
      }
      
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.name.toLowerCase().includes('hindi'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`✅ Using Hindi voice: ${selectedVoice.name}`);
      } else {
        console.warn('⚠️ No Hindi voice found. Using system default for hi-IN.');
        // Don't set voice, let browser use system default for hi-IN
      }
    }

    const words = utterance.text.split(' ');
    setupUtteranceHandlers(utterance, words);
    
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error speaking:', err);
    }
  };

  const setupUtteranceHandlers = (utterance, words) => {
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        let index = 0;
        let charCount = 0;
        for (let i = 0; i < words.length; i++) {
          charCount += words[i].length + 1;
          if (charCount > charIndex) {
            index = i;
            break;
          }
        }
        setCurrentWordIndex(index);
      }
    };

    utterance.onend = () => {
      setCurrentWordIndex(-1);
      setSpokenWords([]);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      console.error('Error code:', event.error);
      if (isHindi) {
        console.warn('⚠️ Hindi TTS issue. Try: Chrome Settings > Languages > Hindi (install offline)');
      }
      setCurrentWordIndex(-1);
      setSpokenWords([]);
    };
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setCurrentWordIndex(-1);
    setSpokenWords([]);
  };

  /* ---------------- LOCATION & WEATHER ---------------- */
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
        try {
          setLocation('🌍 Getting location name...');
          const openWeatherKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
          if (!openWeatherKey) {
            setError('Weather API key not configured.');
            setDetectingLocation(false);
            return;
          }

          const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${openWeatherKey}`
          );

          if (!geoResponse.ok) {
            throw new Error('Failed to get location details');
          }

          const geoData = await geoResponse.json();
          if (geoData && geoData.length > 0) {
            const locationInfo = geoData[0];
            const detectedLocation = `${locationInfo.name}, ${locationInfo.state || locationInfo.country}`;
            setLocation(detectedLocation);
            setDetectingLocation(false);

            // Auto-fetch weather
            setTimeout(() => {
              fetchWeatherDataForCity(locationInfo.name);
            }, 300);
          } else {
            throw new Error('Location data not available');
          }
        } catch (err) {
          setError(`❌ Failed to detect location: ${err.message}`);
          setLocation('');
          setDetectingLocation(false);
        }
      },
      (error) => {
        let errorMsg = 'Location access denied.';
        if (error.code === 1) errorMsg = 'Please allow location access.';
        else if (error.code === 2) errorMsg = 'Location unavailable.';
        else if (error.code === 3) errorMsg = 'Location request timed out.';
        setError(errorMsg);
        setLocation('');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const fetchWeatherDataForCity = async (cityName) => {
    if (!cityName) {
      setError('Please enter a valid location');
      return;
    }
    setLoading(true);
    setError('');
    setWeatherData(null);
    try {
      const weatherApiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const searchQuery = encodeURIComponent(cityName.trim());
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=5&appid=${weatherApiKey}`;
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) throw new Error('Failed to search locations');
      const geoResults = await geoResponse.json();
      if (!geoResults || geoResults.length === 0) throw new Error(`No location found for "${cityName}"`);

      const location = geoResults[0];
      const { lat, lon, name, state, country } = location;

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);
      if (!weatherResponse.ok || !forecastResponse.ok) throw new Error('Failed to fetch weather data');

      const currentData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      const dailyForecast = [];
      const dailyData = {};
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = { temps: [], humidity: [], rainfall: 0, wind: [], descriptions: [], icons: [] };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].humidity.push(item.main.humidity);
        dailyData[date].rainfall += item.rain?.['3h'] || 0;
        dailyData[date].wind.push(item.wind.speed);
        dailyData[date].descriptions.push(item.weather[0].description);
        dailyData[date].icons.push(`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`);
      });

      Object.keys(dailyData).slice(0, 7).forEach(date => {
        const day = dailyData[date];
        dailyForecast.push({
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length),
          humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
          rainfall: day.rainfall,
          wind: Math.round(day.wind.reduce((a, b) => a + b) / day.wind.length * 3.6),
          description: day.descriptions[0],
          icon: day.icons[0]
        });
      });

      const geminiRecommendation = await fetchGeminiRecommendations(`${name}, ${state}, ${country}`, dailyForecast);

      setWeatherData({
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
          wind: Math.round(currentData.wind.speed * 3.6),
          condition: currentData.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`
        }
      });
    } catch (err) {
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
Format your answer using markdown.
Weather data: ${JSON.stringify(forecast)}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Could not load AI recommendations at this time.";
    } catch (err) {
      console.error(err);
      return "Could not load AI recommendations at this time.";
    }
  };

  const fetchWeatherData = async () => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) { setError('Please enter a location.'); return; }
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
            </div>
            <button type="button" onClick={detectMyLocation} disabled={detectingLocation || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:bg-blue-400">
              {detectingLocation ? 'Detecting...' : <><FiMapPin /><span>Use My Location</span></>}
            </button>
            <button type="submit" disabled={loading || detectingLocation}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:bg-green-400">
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
                    <div className="flex items-center gap-2"><FiThermometer className="w-4 h-4" /><span>Feels like {weatherData.current.feelsLike}°C</span></div>
                    <div className="flex items-center gap-2"><FiDroplet className="w-4 h-4" /><span>Humidity {weatherData.current.humidity}%</span></div>
                    <div className="flex items-center gap-2"><FiWind className="w-4 h-4" /><span>Wind {weatherData.current.wind} km/h</span></div>
                  </div>
                </div>
              )}
              {/* Forecast, Map, etc. omitted for brevity */}
            </div>

            {/* Right Column: Recommendations */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-green-800">AI-Powered Growing Recommendations</h2>
                  <div className="flex gap-2">
                    <button onClick={toggleLanguage} disabled={translating}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:bg-green-400">
                      {translating ? "Translating..." : isHindi ? "View in English" : "हिंदी में देखें"}
                    </button>
                    <button onClick={speakRecommendations} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1">🔊 Listen</button>
                    <button onClick={stopReading} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1">✋ Stop</button>
                    <button 
                      title="Click to see how to install Hindi voices for your browser"
                      onClick={() => {
                        alert('📖 How to install Hindi voice in Chrome:\n1. Open Chrome Settings\n2. Go to Languages\n3. Find "Hindi" or "हिंदी"\n4. Click the three dots next to it\n5. Select "Install offline"\n\nFor other browsers, check language settings in your OS.\n\nTip: After installing, refresh this page and try again!');
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      ❓ Hindi Voice Help
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-green-50/50 rounded-lg border-l-4 border-green-500">
                  {spokenWords.length > 0 ? (
                    <p className="text-gray-700">
                      {spokenWords.map((word, idx) => (
                        <span key={idx} className={idx === currentWordIndex ? "bg-yellow-200 font-bold" : ""}>
                          {word}{' '}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <SimpleMarkdownParser text={isHindi && translatedText ? translatedText : weatherData.recommendations} />
                  )}
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
