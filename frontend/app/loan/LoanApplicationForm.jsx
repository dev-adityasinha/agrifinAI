"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { banks } from './bankData';

const LoanApplicationForm = ({ bankId, loanId, loanDetails }) => {
  const [formData, setFormData] = useState({
    bankId,
    loanId,
    fullName: '',
    aadhaarNumber: '',
    panNumber: '',
    loanAmount: loanDetails?.amount.split(' ')[2] || '',
    tenure: loanDetails?.tenure.split(' ')[0] || '',
    purpose: '',
    documents: {
      aadhaarCard: null,
      panCard: null,
      landRecord: null,
      bankStatement: null
    },
    termsAccepted: false
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    aadhaarCard: null,
    panCard: null,
    landRecord: null,
    bankStatement: null
  });

  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    if(loanDetails) {
      // Extract numeric value from amount string (e.g., "₹5,00,000" -> "500000")
      const amountStr = loanDetails.amount.split(' ')[2] || loanDetails.amount;
      const numericAmount = amountStr.replace(/[₹,]/g, '');
      
      // Extract numeric value from tenure (e.g., "12 Months" -> "12")
      const tenureStr = loanDetails.tenure.split(' ')[0];
      
      setFormData(prev => ({
        ...prev,
        loanAmount: numericAmount,
        tenure: tenureStr
      }));
    }
  }, [loanDetails]);

  const router = useRouter();

  const validateFile = (file, docType) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = {
      aadhaarCard: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      panCard: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      landRecord: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      bankStatement: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    };

    if (!file) {
      return 'Please select a file';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    if (!allowedTypes[docType].includes(file.type)) {
      return 'Only PDF, JPG, and PNG files are allowed';
    }

    return null;
  };

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    
    if (!file) return;

    const error = validateFile(file, docType);
    
    if (error) {
      setUploadErrors(prev => ({
        ...prev,
        [docType]: error
      }));
      e.target.value = ''; // Reset input
      return;
    }

    // Clear any previous errors
    setUploadErrors(prev => ({
      ...prev,
      [docType]: null
    }));

    // Store file info
    setUploadedFiles(prev => ({
      ...prev,
      [docType]: {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }
    }));

    // Update form data
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: file
      }
    }));
  };

  const removeFile = (docType) => {
    setUploadedFiles(prev => ({
      ...prev,
      [docType]: null
    }));

    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: null
      }
    }));

    setUploadErrors(prev => ({
      ...prev,
      [docType]: null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if all documents are uploaded
    const requiredDocs = ['aadhaarCard', 'panCard', 'landRecord', 'bankStatement'];
    const missingDocs = requiredDocs.filter(doc => !formData.documents[doc]);
    
    if (missingDocs.length > 0) {
      alert('Please upload all required documents');
      return;
    }
    
    console.log('Form submitted with data:', formData);
    console.log('Uploaded files:', uploadedFiles);
    router.push('/loan/success');
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
              <input
                type="text"
                pattern="\d{12}"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
              <input
                type="text"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Loan Details */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Loan Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount (₹)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-16"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
                />
                <span className="absolute right-4 top-3.5 text-gray-500">INR</span>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tenure (Months)</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={formData.tenure}
                onChange={(e) => setFormData({...formData, tenure: e.target.value})}
              >
                <option value="">Select Tenure</option>
                <option value="6">6 Months</option>
                <option value="12">1 Year</option>
                <option value="24">2 Years</option>
                <option value="60">5 Years</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Loan Purpose</label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Describe your agricultural needs..."
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
            />
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Document Upload</h3>
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Aadhaar Card Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Aadhaar Card <span className="text-red-500">*</span>
                </label>
                {!uploadedFiles.aadhaarCard ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors bg-white">
                    <input
                      type="file"
                      id="aadhaarCard"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'aadhaarCard')}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="aadhaarCard" className="cursor-pointer">
                      <div className="text-green-600 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Upload Aadhaar Card</span>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-green-400 rounded-lg p-4 bg-white">
                    {uploadedFiles.aadhaarCard.preview ? (
                      <img 
                        src={uploadedFiles.aadhaarCard.preview} 
                        alt="Aadhaar preview" 
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded mb-2">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-700 truncate">{uploadedFiles.aadhaarCard.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFiles.aadhaarCard.size / 1024).toFixed(2)} KB</p>
                    <button
                      type="button"
                      onClick={() => removeFile('aadhaarCard')}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
                {uploadErrors.aadhaarCard && (
                  <p className="text-xs text-red-600 mt-1">⚠ {uploadErrors.aadhaarCard}</p>
                )}
              </div>

              {/* PAN Card Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload PAN Card <span className="text-red-500">*</span>
                </label>
                {!uploadedFiles.panCard ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors bg-white">
                    <input
                      type="file"
                      id="panCard"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'panCard')}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="panCard" className="cursor-pointer">
                      <div className="text-green-600 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Upload PAN Card</span>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-green-400 rounded-lg p-4 bg-white">
                    {uploadedFiles.panCard.preview ? (
                      <img 
                        src={uploadedFiles.panCard.preview} 
                        alt="PAN preview" 
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded mb-2">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-700 truncate">{uploadedFiles.panCard.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFiles.panCard.size / 1024).toFixed(2)} KB</p>
                    <button
                      type="button"
                      onClick={() => removeFile('panCard')}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
                {uploadErrors.panCard && (
                  <p className="text-xs text-red-600 mt-1">⚠ {uploadErrors.panCard}</p>
                )}
              </div>

              {/* Land Record Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Land Record <span className="text-red-500">*</span>
                </label>
                {!uploadedFiles.landRecord ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors bg-white">
                    <input
                      type="file"
                      id="landRecord"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'landRecord')}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="landRecord" className="cursor-pointer">
                      <div className="text-green-600 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Upload Land Record</span>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-green-400 rounded-lg p-4 bg-white">
                    {uploadedFiles.landRecord.preview ? (
                      <img 
                        src={uploadedFiles.landRecord.preview} 
                        alt="Land Record preview" 
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded mb-2">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-700 truncate">{uploadedFiles.landRecord.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFiles.landRecord.size / 1024).toFixed(2)} KB</p>
                    <button
                      type="button"
                      onClick={() => removeFile('landRecord')}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
                {uploadErrors.landRecord && (
                  <p className="text-xs text-red-600 mt-1">⚠ {uploadErrors.landRecord}</p>
                )}
              </div>

              {/* Bank Statement Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Bank Statement <span className="text-red-500">*</span>
                </label>
                {!uploadedFiles.bankStatement ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors bg-white">
                    <input
                      type="file"
                      id="bankStatement"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'bankStatement')}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="bankStatement" className="cursor-pointer">
                      <div className="text-green-600 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className="text-sm text-green-600 font-medium">Upload Bank Statement</span>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-green-400 rounded-lg p-4 bg-white">
                    {uploadedFiles.bankStatement.preview ? (
                      <img 
                        src={uploadedFiles.bankStatement.preview} 
                        alt="Bank Statement preview" 
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded mb-2">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-700 truncate">{uploadedFiles.bankStatement.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFiles.bankStatement.size / 1024).toFixed(2)} KB</p>
                    <button
                      type="button"
                      onClick={() => removeFile('bankStatement')}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
                {uploadErrors.bankStatement && (
                  <p className="text-xs text-red-600 mt-1">⚠ {uploadErrors.bankStatement}</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Terms and Submission */}
        <div className="space-y-6">
          <div className="flex items-start">
            <input
              type="checkbox"
              required
              className="mt-1 mr-3 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
            />
            <p className="text-sm text-gray-600">
              I agree to the <a href="/terms" className="text-green-600 hover:underline">terms and conditions</a> and 
              confirm that all information provided is accurate
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplicationForm;