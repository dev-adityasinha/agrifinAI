"use client";
import { useState, useEffect } from 'react';

const SoilHealthReport = ({ report }) => {
  const [isHindi, setIsHindi] = useState(false);
  const [translatedRecommendations, setTranslatedRecommendations] = useState([]);
  const [translating, setTranslating] = useState(false);
  
  // Speech synthesis states
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [spokenWords, setSpokenWords] = useState([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      setVoices(synthVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const translateToHindi = async () => {
    if (translatedRecommendations.length > 0) {
      setIsHindi(true);
      return;
    }

    setTranslating(true);
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      const recommendationText = report.recommendations?.join('\n') || '';
      
      const prompt = `Translate the following agricultural recommendations into clear, simple Hindi. 
Preserve the bullet point format. Keep each recommendation as a separate item.

RECOMMENDATIONS:
${recommendationText}`;

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
      
      // Split translated text into recommendations
      const hindiRecs = hindiText
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(line => line.length > 0);
      
      setTranslatedRecommendations(hindiRecs);
      setIsHindi(true);
    } catch (err) {
      console.error("Translation error:", err);
      alert("Translation failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  const toggleLanguage = () => {
    stopSpeaking(); // Stop current speech when switching languages
    if (isHindi) {
      setIsHindi(false);
    } else {
      if (translatedRecommendations.length === 0) {
        translateToHindi();
      } else {
        setIsHindi(true);
      }
    }
  };

  const speakRecommendations = () => {
    stopSpeaking();
    
    const textToSpeak = (displayRecommendations || []).join(' ');
    if (!textToSpeak) return;

    const words = textToSpeak.split(' ');
    setSpokenWords(words);
    setCurrentWordIndex(-1);
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Set language and voice
    if (isHindi) {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi') 
        || voices.find(v => v.lang.startsWith('hi'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      utterance.lang = 'en-US';
      const englishVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en')
        || voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

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
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
      setSpokenWords([]);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsSpeaking(false);
      if (isHindi) {
        alert('Hindi speech not available. Please install Hindi language pack.');
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
    setSpokenWords([]);
  };

  if (!report) return null;

  const displayRecommendations = isHindi ? translatedRecommendations : report.recommendations;

  return (
    <div className="space-y-6">
      {/* Image Validation Warning */}
      {report.imageValidation && !report.imageValidation.matches && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-red-800">Image Mismatch Detected</p>
              <p className="text-red-700 text-sm mt-1">
                Image appears to show <strong>{report.imageValidation.detected_crop}</strong>, not <strong>{report.crops}</strong>
              </p>
              <p className="text-red-600 text-xs mt-1">
                Confidence: {report.imageValidation.confidence}%
              </p>
              {report.imageValidation.warning && (
                <p className="text-red-700 text-sm mt-2 italic">{report.imageValidation.warning}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Validation Success */}
      {report.imageValidation && report.imageValidation.matches && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
          <p className="text-green-800 font-semibold">✓ Image verified: {report.crops}</p>
          <p className="text-green-600 text-xs mt-1">Confidence: {report.imageValidation.confidence}%</p>
        </div>
      )}
      {/* Soil Health Score */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Soil Health Score</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-5xl font-bold text-green-700">{report.soilHealth}</span>
          <span className="text-xl text-green-600">/100</span>
        </div>
        <div className="w-full bg-green-200 rounded-full h-2 mt-4">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all" 
            style={{ width: `${report.soilHealth}%` }}
          />
        </div>
      </div>

      {/* Soil Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 uppercase">pH Level</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{report.pH}</p>
          <p className="text-xs text-blue-600 mt-1">Optimal: 6.5-7.5</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 uppercase">Nitrogen</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{report.nitrogen} mg/kg</p>
          <p className="text-xs text-purple-600 mt-1">Range: 100-300</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-xs font-semibold text-yellow-700 uppercase">Phosphorus</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{report.phosphorus} mg/kg</p>
          <p className="text-xs text-yellow-600 mt-1">Range: 20-120</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-xs font-semibold text-red-700 uppercase">Potassium</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{report.potassium} mg/kg</p>
          <p className="text-xs text-red-600 mt-1">Range: 100-400</p>
        </div>
      </div>

      {/* Location & Crop */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Crop</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{report.crops || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Location</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{report.location || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">📋 Recommendations</h3>
          <div className="flex gap-2">
            <button
              onClick={toggleLanguage}
              disabled={translating}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:bg-green-400 transition-all"
            >
              {translating ? "Translating..." : isHindi ? "View in English" : "हिंदी में देखें"}
            </button>
            <button
              onClick={speakRecommendations}
              disabled={isSpeaking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:bg-blue-400 transition-all flex items-center gap-1"
            >
              🔊 Listen
            </button>
            <button
              onClick={stopSpeaking}
              disabled={!isSpeaking}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:bg-gray-400 transition-all flex items-center gap-1"
            >
              ✋ Stop
            </button>
          </div>
        </div>

        {spokenWords.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <p className="text-gray-700 text-sm">
              {spokenWords.map((word, idx) => (
                <span
                  key={idx}
                  className={idx === currentWordIndex ? "bg-yellow-300 font-bold px-1 rounded" : ""}
                >
                  {word}{' '}
                </span>
              ))}
            </p>
          </div>
        )}

        <ul className="space-y-2">
          {displayRecommendations && displayRecommendations.map((rec, idx) => (
            <li key={idx} className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span className="text-gray-700 text-sm">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SoilHealthReport;