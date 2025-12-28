import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, location } = await request.json();

    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const prompt = `You are an expert Indian farming assistant. Provide practical advice in 100-150 words.

Location: ${location || 'India'}
Question: ${message}

Guidelines:
- Give actionable farming tips for Indian conditions
- Mention specific crops, seasons, or techniques
- If question is in Hindi/regional language, respond in that language
- Include relevant government schemes if applicable`;

    // Use Gemini 2.0 Flash (latest model)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return NextResponse.json(
        { error: 'AI temporarily unavailable', fallback: true },
        { status: 503 }
      );
    }

    // Parse Gemini response
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer || answer.length < 20) {
      return NextResponse.json(
        { error: 'Empty response', fallback: true },
        { status: 503 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message, fallback: true },
      { status: 500 }
    );
  }
}
