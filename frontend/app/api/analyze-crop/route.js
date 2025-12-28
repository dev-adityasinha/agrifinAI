import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.json();
    const { cropName, soilType, soilPH, symptoms, location, imageBase64, modelPrediction } = formData;

    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // If model prediction is provided, include it in the analysis
    let modelPredictionText = '';
    if (modelPrediction && modelPrediction.length > 0) {
      modelPredictionText = `\n\n**🤖 AI Model Prediction Results:**
The trained model has analyzed the uploaded image and detected:
${modelPrediction.map((pred, idx) => `${idx + 1}. **${pred.class}** - Confidence: ${pred.percentage}%`).join('\n')}

Please verify this prediction against the symptoms and provide comprehensive treatment advice.`;
    }

    // Build comprehensive prompt (text-only for now due to API limitations)
    const imageNote = imageBase64 
      ? "\n**Note:** An image was uploaded and analyzed by our AI model. The model's predictions are included below."
      : "\n**Note:** No image was provided. Diagnosis is based solely on text description. For better accuracy, farmers should upload clear photos.";

    const prompt = `You are an expert Indian agricultural scientist and plant pathologist. Analyze this crop health issue with precision.

**IMPORTANT INSTRUCTIONS:**
1. VERIFY if the symptoms match the stated crop type. If symptoms are unlikely for "${cropName}", mention this concern.
2. Consider the AI model prediction results if provided
3. Provide specific, actionable advice tailored to Indian farming conditions
4. Consider the local context and climate of ${location}

**Farmer's Input:**
- **Crop:** ${cropName}
- **Soil Type:** ${soilType}
- **Soil pH:** ${soilPH || 'Not provided'}
- **Symptoms Observed:** ${symptoms}
- **Location:** ${location}
${imageNote}
${modelPredictionText}

**Your Detailed Analysis:**

**1. Symptom Verification:**
- Do these symptoms match ${cropName}? (Yes/No with explanation)
- Symptom severity level (Mild/Moderate/Severe)

**2. Most Likely Diagnosis (in order of probability):**
- Primary cause with 70%+ confidence
- Secondary possible causes
- Explain WHY these are likely based on symptoms

**3. Detailed Treatment Plan:**

**Immediate Actions (Next 24-48 hours):**
- Specific steps farmer should take NOW

**Treatment Options:**
A) **Organic/Natural Methods:**
   - Detailed recipes and application methods
   - Locally available materials
   
B) **Chemical Treatment (if needed):**
   - Specific product names available in India
   - Exact dosage and application timing
   - Safety precautions

**4. Preventive Measures:**
- Crop rotation suggestions
- Soil health improvement
- Disease prevention practices for Indian conditions

**5. When to Seek Expert Help:**
- Warning signs that need immediate professional consultation

**6. Expected Recovery Timeline:**
- How long before improvements are visible

**Format:** Use **Bold** for headings, bullet points for clarity.

**Disclaimer:** This is AI-generated guidance. For critical issues or confirmation, consult your local Krishi Vigyan Kendra or agricultural officer. Call Kisan Call Center: 1800-180-1551 (Toll Free)`;

    // Use text-only Gemini Pro model
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      
      // Provide intelligent fallback response
      const fallbackAnalysis = generateFallbackAnalysis(cropName, symptoms, soilType, location);
      return NextResponse.json({ analysis: fallbackAnalysis });
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysis) {
      const fallbackAnalysis = generateFallbackAnalysis(cropName, symptoms, soilType, location);
      return NextResponse.json({ analysis: fallbackAnalysis });
    }

    return NextResponse.json({ analysis });

  } catch (error) {
    console.error('Crop Analysis Error:', error);
    
    // Return helpful fallback instead of error
    const { cropName, symptoms, soilType, location } = await request.json();
    const fallbackAnalysis = generateFallbackAnalysis(cropName, symptoms, soilType, location);
    return NextResponse.json({ analysis: fallbackAnalysis });
  }
}

// Intelligent fallback analysis function
function generateFallbackAnalysis(cropName, symptoms, soilType, location) {
  const lowerSymptoms = symptoms.toLowerCase();
  
  let diagnosis = [];
  let treatment = [];
  
  // Common Indian crop diseases detection
  if (lowerSymptoms.includes('yellow') || lowerSymptoms.includes('पीला')) {
    diagnosis.push('**Nitrogen Deficiency or Chlorosis** - Common in Indian soils');
    treatment.push('Apply Urea (20-30 kg/acre) or organic compost (500 kg/acre)');
  }
  
  if (lowerSymptoms.includes('spot') || lowerSymptoms.includes('धब्बे')) {
    diagnosis.push('**Fungal Leaf Spot Disease** - Common during monsoon');
    treatment.push('Spray Mancozeb (2g/liter) or Copper Oxychloride (3g/liter)');
  }
  
  if (lowerSymptoms.includes('wilt') || lowerSymptoms.includes('मुरझा')) {
    diagnosis.push('**Wilt Disease (Fusarium/Verticillium)** - Serious condition');
    treatment.push('Remove affected plants, improve drainage, apply Carbendazim (1g/liter)');
  }
  
  if (lowerSymptoms.includes('curl') || lowerSymptoms.includes('मुड़')) {
    diagnosis.push('**Leaf Curl Virus or Aphid Infestation**');
    treatment.push('Spray Imidacloprid (0.5ml/liter) for aphids, use yellow sticky traps');
  }

  return `**🌾 AgriFinAI Crop Health Analysis**
**Crop:** ${cropName}
**Location:** ${location}
**Soil Type:** ${soilType}

---

**📋 SYMPTOM ANALYSIS:**
Based on your description: "${symptoms}"

**🔍 Most Likely Issues:**
${diagnosis.length > 0 ? diagnosis.map((d, i) => `${i + 1}. ${d}`).join('\n') : '1. **Nutrient Imbalance or Environmental Stress**'}

---

**💊 RECOMMENDED TREATMENT:**

**Immediate Actions (Next 24-48 hours):**
- Isolate severely affected plants
- Check soil moisture - avoid overwatering
- Inspect undersides of leaves for pests
${treatment.length > 0 ? '\n**Specific Treatments:**\n' + treatment.map((t, i) => `${i + 1}. ${t}`).join('\n') : ''}

**Organic Solutions:**
- Neem oil spray (5ml/liter water) - effective against pests and mild fungus
- Cow urine solution (1:10 with water) - natural fungicide
- Trichoderma viride - biological fungicide

**Chemical Options (if needed):**
- Contact your nearest Krishi Vigyan Kendra for soil-specific recommendations
- Always follow label instructions and safety gear

---

**🛡️ PREVENTION FOR FUTURE:**
- **Crop Rotation:** Don't plant same crop family in same field consecutively
- **Proper Spacing:** Ensure good air circulation between plants
- **Soil Health:** Add organic matter regularly, maintain pH 6-7
- **Water Management:** Avoid waterlogging and water stress
- **Early Detection:** Check crops weekly for early signs

---

**⚠️ WHEN TO GET EXPERT HELP:**
- If symptoms worsen after 7 days of treatment
- If disease spreads rapidly to other plants
- For confirmation of diagnosis

**📞 HELPLINE NUMBERS:**
- Kisan Call Center: **1800-180-1551** (24x7, Toll Free)
- Krishi Vigyan Kendra - ${location}
- Agriculture Department helpline for ${location}

---

**📸 For Better Diagnosis:**
Upload clear, close-up photos showing:
- Affected leaves (top and bottom)
- Plant stem and roots if possible
- Entire plant to show extent of damage

**💡 TIP:** This analysis is based on symptom description. For 100% accurate diagnosis, consult local agriculture expert with plant samples.

**🌱 Government Schemes:**
- Soil Health Card Scheme - Free soil testing
- PM-KISAN - Financial support
- Pradhan Mantri Fasal Bima Yojana - Crop insurance

**Stay connected with your local Krishi Vigyan Kendra for ongoing support!**`;
}
