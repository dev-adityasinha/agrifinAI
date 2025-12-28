"use client";
import { useEffect, useRef, useState } from "react";

export default function GeminiChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-IN");

  const recognitionRef = useRef(null);

  /* ------------------ SPEECH TO TEXT ------------------ */
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || listening) return;
    recognitionRef.current.lang = language;
    recognitionRef.current.start();
  };

  /* ------------------ LOCATION ------------------ */
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setLocation("Location not supported");
      return;
    }

    setLocation("Detecting...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const key = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
          const res = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${key}&q=${latitude},${longitude}&aqi=no`
          );
          const data = await res.json();

          if (data?.location) {
            const loc = data.location;
            setLocation([loc.name, loc.region, loc.country].filter(Boolean).join(", "));
          } else {
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          }
        } catch {
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      },
      () => setLocation("Enable location permission")
    );
  };

  /* ------------------ SEND MESSAGE ------------------ */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          location: location || "India",
          language,
        }),
      });

      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "bot", content: data?.answer || fallback(language) },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "bot", content: fallback(language) }]);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ FALLBACK ------------------ */
  const fallback = (lang) => {
    if (lang.startsWith("hi"))
      return `**AgriConnect AI 🇮🇳**  
आप मुझसे फसल, मौसम, मिट्टी, ऋण और सरकारी योजनाओं के बारे में पूछ सकते हैं।  
📞 किसान कॉल सेंटर: 155261`;

    return `**AgriConnect AI 🇮🇳**  
Ask about crops, weather, soil, loans & schemes.  
📞 Kisan Call Center: 155261`;
  };

  /* ------------------ UI ------------------ */
  return (
    <>
      <button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-700 text-white p-4 rounded-full shadow-xl z-50"
        onClick={() => setOpen(true)}
      >
        💬
      </button>

      {open && (
        <div
          className="
            fixed z-50 bg-white border border-green-600 shadow-2xl flex flex-col
            w-full h-full bottom-0 right-0
            md:w-[420px] md:h-[620px]
            md:top-1/2 md:-translate-y-1/2 md:right-6
            md:rounded-2xl
          "
        >
          {/* Header */}
          <div className="flex justify-between p-4 bg-green-100 border-b">
            <span className="font-bold text-green-700">AgriConnect AI</span>
            <button onClick={() => setOpen(false)}>✖️</button>
          </div>

          {/* Controls */}
          <div className="flex gap-2 p-2 bg-green-50 border-b items-center">
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={detectLocation}
            >
              {location ? `📍 ${location}` : "Detect Location"}
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="en-IN">English</option>
              <option value="hi-IN">हिंदी</option>
              <option value="mr-IN">मराठी</option>
              <option value="ta-IN">தமிழ்</option>
              <option value="te-IN">తెలుగు</option>
              <option value="bn-IN">বাংলা</option>
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-3 rounded-lg ${
                  m.role === "user"
                    ? "ml-auto bg-green-200"
                    : "mr-auto bg-white border"
                }`}
                dangerouslySetInnerHTML={{
                  __html: m.content.replace(/\n/g, "<br/>"),
                }}
              />
            ))}
            {loading && <div className="text-xs text-gray-400">Typing...</div>}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-4 border-t">
            <input
              className="flex-1 border rounded-lg px-3 py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            {/* 🎤 MIC */}
            <button
              onClick={startListening}
              className={`px-3 py-2 rounded-lg text-white ${
                listening ? "bg-red-500 animate-pulse" : "bg-green-600"
              }`}
              title="Voice Input"
            >
              🎤
            </button>

            <button
              onClick={sendMessage}
              className="bg-green-700 text-white px-4 py-2 rounded-lg"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
