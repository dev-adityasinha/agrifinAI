"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { productAPI } from "@/lib/api";
import {
  FiArrowLeft,
  FiCamera,
  FiMapPin,
  FiDollarSign,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiUser,
} from "react-icons/fi";

export default function SellPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    quantity: "",
    unit: "kg",
    price: "",
    description: "",
    location: "",
    district: "",
    state: "",
    pincode: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    deliveryOptions: [],
    organicCertified: false,
    images: [],
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("agrifinai_user");
        const storedToken = localStorage.getItem("agrifinai_token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'agrifinai_user' || e.key === 'agrifinai_token') {
        checkAuth();
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogout', handleLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogout', handleLogout);
    };
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AgriFinAI...</p>
        </div>
      </div>
    );
  }

  // Show authentication required if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="w-20 h-20 bg-linear-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiLock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to login to sell products on AgriFinAI. Please login to continue.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-block w-full px-6 py-3 bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <FiUser className="inline mr-2" />
                Login Now
              </Link>
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    "Vegetables",
    "Fruits",
    "Grains",
    "Dairy",
    "Pulses",
    "Spices",
    "Oils & Seeds",
    "Other",
  ];

  const units = ["kg", "quintal", "ton", "liter", "dozen", "piece"];

  const deliveryOptions = [
    { id: "farm-pickup", label: "Farm Pickup" },
    { id: "local-delivery", label: "Local Delivery (within 50km)" },
    { id: "regional-delivery", label: "Regional Delivery" },
    { id: "nationwide", label: "Nationwide Shipping" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDeliveryToggle = (optionId) => {
    setFormData((prev) => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.includes(optionId)
        ? prev.deliveryOptions.filter(id => id !== optionId)
        : [...prev.deliveryOptions, optionId]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Convert files to base64 data URLs
    const newImages = [];
    let processedCount = 0;
    
    files.slice(0, 5 - formData.images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        processedCount++;
        
        if (processedCount === files.slice(0, 5 - formData.images.length).length) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 1: {
        const errors = [];
        if (!formData.productName.trim()) errors.push('Product Name');
        if (!formData.category) errors.push('Category');
        if (!formData.quantity || Number(formData.quantity) <= 0) errors.push('Quantity (must be greater than 0)');
        if (!formData.price || Number(formData.price) <= 0) errors.push('Price (must be greater than 0)');
        return errors.length ? `Please fill: ${errors.join(', ')}` : '';
      }
      case 2: {
        const errors = [];
        if (!formData.location.trim()) errors.push('Farm/Village Name');
        if (!formData.district.trim()) errors.push('District');
        if (!formData.state.trim()) errors.push('State');
        if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) errors.push('Pincode (must be 6 digits)');
        return errors.length ? `Please fill: ${errors.join(', ')}` : '';
      }
      case 3: {
        const errors = [];
        if (!formData.contactName.trim()) errors.push('Contact Name');
        if (!formData.contactPhone.trim()) errors.push('Phone Number');
        if (formData.deliveryOptions.length === 0) errors.push('at least one Delivery Option');
        return errors.length ? `Please fill: ${errors.join(', ')}` : '';
      }
      default:
        return '';
    }
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      alert(error);
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const validateAll = () => {
    const errors = [];
    if (!formData.productName.trim()) errors.push('Product Name');
    if (!formData.category) errors.push('Category');
    if (!formData.quantity || Number(formData.quantity) <= 0) errors.push('Quantity (must be greater than 0)');
    if (!formData.price || Number(formData.price) <= 0) errors.push('Price (must be greater than 0)');
    if (!formData.location.trim()) errors.push('Farm/Village Name');
    if (!formData.district.trim()) errors.push('District');
    if (!formData.state.trim()) errors.push('State');
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) errors.push('Pincode (must be 6 digits)');
    if (!formData.contactName.trim()) errors.push('Contact Name');
    if (!formData.contactPhone.trim()) errors.push('Phone Number');
    if (formData.deliveryOptions.length === 0) errors.push('at least one Delivery Option');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateAll();
    if (errors.length > 0) {
      alert(`Please fill all required fields: ${errors.join(', ')}`);
      return;
    }
    
    setLoadingSubmit(true);

    try {
      // Prepare data for API
      const productData = {
        productName: formData.productName,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        price: Number(formData.price),
        description: formData.description,
        location: formData.location,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        deliveryOptions: formData.deliveryOptions,
        organicCertified: formData.organicCertified,
        images: formData.images // Now contains base64 data URLs
      };

      // Call API to create product
      const response = await productAPI.create(productData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2500);
      } else {
        alert(response.error || 'Failed to submit product. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Failed to submit product. Please try again.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Product Listed Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your product has been submitted for review. Buyers will be able to see it once
              approved.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-6 transition"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-linear-to-r from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-2xl">
              A
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sell Your Products</h1>
              <p className="text-gray-600">
                List your farm products and reach thousands of buyers
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                      s <= step
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {s < step ? <FiCheckCircle className="w-6 h-6" /> : s}
                  </div>
                  <span className="text-xs mt-2 font-medium text-gray-600">
                    {["Product", "Location", "Contact", "Review"][s - 1]}
                  </span>
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition ${
                      s < step ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Product Details */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiPackage className="w-6 h-6 text-green-600" />
                  Product Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="e.g., Fresh Tomatoes"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <input
                        type="checkbox"
                        name="organicCertified"
                        checked={formData.organicCertified}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Organic Certified
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="100"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900"
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per {formData.unit} (₹) *
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="50"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe your product quality, freshness, etc..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images (Max 5)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <FiCamera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <label className="cursor-pointer">
                      <span className="text-green-600 font-medium hover:text-green-700">
                        Upload images
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB each</p>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiMapPin className="w-6 h-6 text-green-600" />
                  Location Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm/Village Name *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Green Valley Farm"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g., Pune"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g., Maharashtra"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="411001"
                    maxLength="6"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Contact & Delivery */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiTruck className="w-6 h-6 text-green-600" />
                  Contact & Delivery Options
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Delivery Options * (Select at least one)
                  </label>
                  <div className="space-y-3">
                    {deliveryOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                          formData.deliveryOptions.includes(option.id)
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.deliveryOptions.includes(option.id)}
                          onChange={() => handleDeliveryToggle(option.id)}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                  Review Your Listing
                </h3>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Product Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">{formData.productName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <p className="font-medium">{formData.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <p className="font-medium">
                          {formData.quantity} {formData.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Price:</span>
                        <p className="font-medium">₹{formData.price}/{formData.unit}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                    <p className="text-sm">
                      {formData.location}, {formData.district}, {formData.state} - {formData.pincode}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                    <div className="text-sm space-y-1">
                      <p>{formData.contactName}</p>
                      <p>{formData.contactPhone}</p>
                      {formData.contactEmail && <p>{formData.contactEmail}</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Options</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.deliveryOptions.map((id) => {
                        const option = deliveryOptions.find((o) => o.id === id);
                        return (
                          <span
                            key={id}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                          >
                            {option?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <FiAlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Your listing will be reviewed by our team and published within 24 hours. You'll
                    receive notifications when buyers express interest.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50 transition"
                >
                  Previous
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 rounded-xl bg-linear-to-r from-green-600 to-emerald-500 text-white font-semibold hover:shadow-lg transition"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="ml-auto px-6 py-3 rounded-xl bg-linear-to-r from-green-600 to-emerald-500 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingSubmit ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Listing"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
