"use client";
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUploadCloud } from 'react-icons/fi';

const SoilHealthForm = ({ onSubmit, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    cropName: '',
    soilType: '',
    soilPH: '',
    symptoms: '',
    location: '',
    image: null,
  });
  const [fileName, setFileName] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');

  // Start camera
  const startCamera = async () => {
    setCameraError('');
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('❌ Camera not supported on this device/browser. Please use File Upload instead.');
        console.error('getUserMedia not supported');
        return;
      }

      console.log('📷 Requesting camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      console.log('✅ Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setShowCamera(true);
        setCameraError('');
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded');
          videoRef.current?.play().catch(err => {
            console.error('Play error:', err);
            setCameraError('Failed to play video. Please try again.');
          });
        };
      }
    } catch (error) {
      console.error('❌ Camera Error:', error);
      
      let errorMsg = 'Cannot access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMsg += 'Camera permission denied. Please:\n1. Check browser permissions\n2. Allow camera access\n3. Try again\n\nOr use File Upload instead.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No camera found on this device. Please use File Upload instead.';
      } else if (error.name === 'NotSupportedError') {
        errorMsg += 'Camera not supported on this browser. Please use File Upload instead.';
      } else if (error.name === 'SecurityError') {
        errorMsg += 'Camera access requires HTTPS or localhost. Please ensure you\'re on a secure connection.';
      }
      
      setCameraError(errorMsg);
      alert(errorMsg);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      stopCamera();
      
      // Set form data
      setFormData(prev => ({ ...prev, imageData }));
      setFileName('camera_capture.jpg');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  // Clear captured image
  const clearCapture = () => {
    setCapturedImage(null);
    setFormData(prev => ({ ...prev, imageData: null }));
    setFileName('');
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('📁 File selected:', file.name, file.type, file.size);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setFormData(prev => ({ ...prev, imageData: base64String }));
      };
      reader.readAsDataURL(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert image to base64 if present
    let imageBase64 = null;
    if (formData.image) {
      try {
        imageBase64 = await convertImageToBase64(formData.image);
      } catch (error) {
        console.error('Image conversion error:', error);
      }
    }

    // Send data with base64 image
    onSubmit({
      ...formData,
      image: imageBase64
    });
  };

  // Function to convert image file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('Enter Crop & Soil Details / फसल और मिट्टी के विवरण दर्ज करें')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="cropName" className="block text-sm font-medium text-gray-700 mb-1">{t('Crop Name / फसल का नाम')}</label>
          < input
            type="text"
            name="cropName"
            id="cropName"
            value={formData.cropName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
            placeholder={t('e.g., Tomato, Wheat')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="soilType" className="block text-sm font-medium text-gray-700 mb-1">{t('Soil Type / मिट्टी का प्रकार')}</label>
            <select
              name="soilType"
              id="soilType"
              value={formData.soilType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
            >
              <option value="">{t('Select Type')}</option>
              <option value="Loam">{t('Loam / दोमट')}</option>
              <option value="Clay">{t('Clay / दोमट')}</option>
              <option value="Sandy">{t('Sandy / रेतीली')}</option>
              <option value="Silt">{t('Silt / गाद')}</option>
              <option value="Peat">{t('Peat / पीट')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="soilPH" className="block text-sm font-medium text-gray-700 mb-1">{t('Soil pH (if known) / मिट्टी का पी.एच')}</label>
            <input
              type="number"
              step="0.1"
              name="soilPH"
              id="soilPH"
              value={formData.soilPH}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
              placeholder="e.g., 6.5"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">{t('Location (District, State) / स्थान (जिला, राज्य)')}</label>
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
            placeholder={t('e.g., Pune, Maharashtra')}
          />
        </div>

        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">{t('Describe Symptoms / लक्षणों का वर्णन करें')}</label>
          <textarea
            name="symptoms"
            id="symptoms"
            rows="4"
            value={formData.symptoms}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
            placeholder={t('e.g., Yellow leaves with brown spots, wilting, stunted growth...')}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('Upload Photo (Optional) / फोटो अपलोड करें (वैकल्पिक)')}</label>
          
          {!showCamera && !capturedImage && (
            <div className="space-y-3">
              {cameraError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm whitespace-pre-line">{cameraError}</p>
                </div>
              )}
              
              <label htmlFor="image-upload" className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                <span className="flex items-center space-x-2">
                  <FiUploadCloud className="w-6 h-6 text-gray-600" />
                  <span className="font-medium text-gray-600">
                    {fileName || t('Drop files to attach, or browse')}
                  </span>
                </span>
                <input
                  type="file"
                  id="image-upload"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                📷 Take Photo with Camera
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                💡 Tip: Make sure to allow camera access when prompted by your browser
              </p>
            </div>
          )}

          {showCamera && (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-300">
                <p className="text-blue-700 text-sm font-semibold">📷 Camera Active</p>
                <p className="text-blue-600 text-xs mt-1">Position your soil sample in the frame and click Capture</p>
              </div>
              
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video object-cover"
                  onError={() => setCameraError('Failed to load camera feed')}
                />
                <div className="absolute inset-0 border-4 border-dashed border-yellow-400 opacity-30"></div>
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  ✓ Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  ✕ Cancel Camera
                </button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-300 mb-2">
                <p className="text-green-700 text-sm font-semibold">✓ Photo Captured Successfully!</p>
                <p className="text-green-600 text-xs mt-1">This image will be submitted with your analysis</p>
              </div>
              
              <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-green-400">
                <img src={capturedImage} alt="Captured soil" className="w-full aspect-video object-cover" />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ✓ Ready
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  📷 Retake Photo
                </button>
                <button
                  type="button"
                  onClick={clearCapture}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all disabled:bg-green-400"
        >
          {loading ? t('Analyzing... / विश्लेषण कर रहे हैं') : t('Get Analysis / विश्लेषण प्राप्त करें')}
        </button>
      </form>
    </div>
  );
};

export default SoilHealthForm;