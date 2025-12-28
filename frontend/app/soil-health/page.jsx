"use client";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLoader, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import SoilHealthForm from '../../components/SoilHealthForm';
import SoilHealthReport from '../../components/SoilHealthReport';

export default function SoilHealthPage() {
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalysisRequest = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      // Call Gemini API for soil health analysis
      const response = await fetch('/api/soil-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cropName: formData.cropName,
          soilType: formData.soilType,
          soilPH: formData.soilPH,
          symptoms: formData.symptoms,
          location: formData.location,
          imageData: formData.imageData || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze soil health');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze soil health. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('AI Crop & Soil Health Analysis')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('Provide details about your crop and soil to get an AI-powered health assessment and recommendations.')}</p>
          
          {/* Status Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800">
            <FiCheckCircle className="text-green-600" />
            <span className="text-sm font-medium">✓ Analysis Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <SoilHealthForm onSubmit={handleAnalysisRequest} loading={loading} />

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 min-h-[400px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('Analysis Report')}</h2>

            {loading && (
              <div className="flex flex-col items-center justify-center h-full">
                <FiLoader className="animate-spin text-green-600 w-12 h-12" />
                <p className="mt-4 text-gray-600">{t('Analyzing... Please wait.')}</p>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-50 border-2 border-red-400 rounded-xl">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="text-red-500 w-8 h-8 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 mb-2">Error</h3>
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={() => {
                        setError('');
                        setAnalysis(null);
                      }}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      ↺ Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {analysis && !loading && <SoilHealthReport report={analysis} />}

            {!analysis && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-gray-500">{t('Your report will appear here after you submit the form.')}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
