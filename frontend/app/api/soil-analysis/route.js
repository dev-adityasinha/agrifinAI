import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { cropName, soilType, soilPH, symptoms, location, imageData } = await request.json();

    // Validate required inputs
    if (!cropName || !symptoms || !location) {
      return Response.json(
        { message: 'Missing required fields: cropName, symptoms, location' },
        { status: 400 }
      );
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // --- Image Validation ---
    let imageValidation = null;
    if (imageData) {
      try {
        const [mimeTypePart, base64Data] = imageData.split(',');
        const mimeType = mimeTypePart.match(/:(.*?);/)?.[1] || 'image/jpeg';

        const validationPrompt = `You are an image analysis expert. Analyze this image and tell me:
1. What crop/plant is visible in the image? (tomato, wheat, rice, potato, etc.)
2. Does it match the claimed crop: "${cropName}"? (yes/no/uncertain)
3. If different, what crop do you see?
4. Rate confidence 0-100%

Respond in JSON only:
{
  "detected_crop": "crop name",
  "matches_claimed": true/false,
  "confidence": 85,
  "warning": "optional warning message"
}`;

        const validationContent = [
          { text: validationPrompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
        ];

        const validationResult = await model.generateContent(validationContent);
        const validationText = validationResult.response.text();

        try {
          const jsonMatch = validationText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            imageValidation = JSON.parse(jsonMatch[0]);
            console.log('Image validation:', imageValidation);
          }
        } catch (e) {
          console.log('Could not parse image validation');
        }

        // ❗ Stop immediately if crop mismatch detected
        if (imageValidation && imageValidation.matches_claimed === false) {
          console.log('⚠️ Crop image mismatched. Stopping analysis.');
          return Response.json(
            {
              error: true,
              message: 'Crop image mismatched',
              detectedCrop: imageValidation.detected_crop,
              claimedCrop: cropName,
              confidence: imageValidation.confidence
            },
            { status: 400 }
          );
        }

      } catch (validationError) {
        console.error('Image validation error:', validationError);
      }
    }

    // --- Build Soil Analysis Prompt ---
    const analysisPrompt = `You are an agricultural expert. Analyze the following crop and soil information ${imageData ? 'and the uploaded image' : ''} and provide a detailed soil health assessment in JSON format.

Crop: ${cropName}
Soil Type: ${soilType || 'Not specified'}
Soil pH: ${soilPH || 'Not measured'}
Symptoms: ${symptoms}
Location: ${location}

Provide a JSON response with this exact structure (no markdown, pure JSON):
{
  "soilHealth": <number 0-100>,
  "pH": <number 6-8>,
  "nitrogen": <number mg/kg>,
  "phosphorus": <number mg/kg>,
  "potassium": <number mg/kg>,
  "recommendations": [<array of 4-5 specific recommendations>],
  "crops": "${cropName}",
  "location": "${location}",
  "analysis": "<brief analysis of the condition>",
  "imageMatch": ${imageValidation ? imageValidation.matches_claimed : null},
  "detectedCrop": "${imageValidation?.detected_crop || 'Not analyzed'}"
}

Make the values realistic based on the symptoms, soil type${imageData ? ', and the uploaded soil/plant image' : ''}. Be specific and actionable in recommendations.`;

    // --- Build content for Gemini ---
    let generationContent;
    if (imageData) {
      try {
        const [mimeTypePart, base64Data] = imageData.split(',');
        const mimeType = mimeTypePart.match(/:(.*?);/)?.[1] || 'image/jpeg';
        generationContent = [
          { text: analysisPrompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
        ];
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        generationContent = [{ text: analysisPrompt }];
      }
    } else {
      generationContent = [{ text: analysisPrompt }];
    }

    // --- Call Gemini API ---
    const result = await model.generateContent(generationContent);
    const responseText = result.response.text();

    // --- Parse JSON Response ---
    let analysisData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      return Response.json({
        soilHealth: 70,
        pH: 6.8,
        nitrogen: 150,
        phosphorus: 60,
        potassium: 200,
        recommendations: [
          'Apply balanced NPK fertilizer',
          'Maintain proper soil moisture',
          'Ensure adequate drainage',
          'Monitor soil pH levels regularly'
        ],
        crops: cropName,
        location: location,
        analysis: 'Analysis completed with default values due to processing'
      });
    }

    // --- Validate Data and Return ---
    const validatedData = {
      soilHealth: Math.min(100, Math.max(0, parseInt(analysisData.soilHealth) || 75)),
      pH: parseFloat(analysisData.pH) || 6.8,
      nitrogen: parseInt(analysisData.nitrogen) || 150,
      phosphorus: parseInt(analysisData.phosphorus) || 60,
      potassium: parseInt(analysisData.potassium) || 200,
      recommendations: Array.isArray(analysisData.recommendations) 
        ? analysisData.recommendations.slice(0, 5)
        : ['Monitor soil regularly', 'Maintain proper irrigation', 'Apply balanced fertilizer', 'Check pH levels'],
      crops: cropName,
      location: location,
      analysis: analysisData.analysis || 'Soil analysis completed',
      imageValidation: imageValidation ? {
        detected_crop: imageValidation.detected_crop,
        matches: imageValidation.matches_claimed,
        confidence: imageValidation.confidence,
        warning: imageValidation.warning
      } : null
    };

    return Response.json(validatedData);

  } catch (error) {
    console.error('Soil Analysis API Error:', error);
    return Response.json(
      { message: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
