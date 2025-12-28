const SoilHealthReport = ({ report }) => {
  if (!report) return null;

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
        <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Recommendations</h3>
        <ul className="space-y-2">
          {report.recommendations && report.recommendations.map((rec, idx) => (
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