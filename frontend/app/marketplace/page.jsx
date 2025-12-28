"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { productAPI } from "@/lib/api";
import {
  FiMapPin,
  FiDollarSign,
  FiPackage,
  FiPhone,
  FiMail,
  FiTruck,
  FiAward,
  FiFilter,
  FiSearch,
  FiLogIn,
  FiUser,
} from "react-icons/fi";

export default function MarketplacePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const categories = ["all", "Vegetables", "Fruits", "Grains", "Dairy", "Pulses", "Spices", "Oils & Seeds", "Other"];

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const checkAuthentication = () => {
    const token = localStorage.getItem("agrifinai_token");
    const userData = localStorage.getItem("agrifinai_user");

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch only approved products
      const response = await productAPI.getAll({ status: "approved" });
      
      if (response.success) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleInquiry = async (productId) => {
    try {
      await productAPI.incrementInquiry(productId);
      alert("Inquiry sent! Seller will contact you soon.");
    } catch (error) {
      console.error("Error sending inquiry:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Marketplace
          </h1>
          <p className="text-xl text-gray-600">
            Fresh farm products directly from sellers
          </p>
        </div>

        {/* Authentication Check */}
        {!isAuthenticated ? (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLogIn className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Login Required
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Please login to access the marketplace and browse farm products from verified sellers.
              </p>
              <div className="space-y-4">
                <Link
                  href="/login"
                  className="inline-block w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition text-center"
                >
                  <FiLogIn className="w-5 h-5 inline mr-2" />
                  Login to Continue
                </Link>
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-green-100">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by product name, district, or state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-12 pr-8 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 appearance-none bg-white min-w-[200px]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredProducts.length} products
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <FiPackage className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/fallback-product.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      {product.organicCertified && (
                        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <FiAward className="w-4 h-4" />
                          Organic
                        </div>
                      )}
                    </div>

                    {/* Product Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold">{product.productName}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-green-100">
                        <FiPackage className="w-4 h-4" />
                        <span className="text-sm">{product.category}</span>
                      </div>
                    </div>

                    {/* Product Body */}
                    <div className="p-6 space-y-4">
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiDollarSign className="w-5 h-5" />
                          <span className="text-sm">Price</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ₹{product.price}
                          </p>
                          <p className="text-xs text-gray-500">per {product.unit}</p>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-between py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Available</span>
                        <span className="font-semibold text-gray-900">
                          {product.quantity} {product.unit}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-sm">
                        <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-gray-700">
                          <p className="font-medium">{product.district}, {product.state}</p>
                          <p className="text-xs text-gray-500">{product.location}</p>
                        </div>
                      </div>

                      {/* Description */}
                      {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 pt-2 border-t border-gray-100">
                          {product.description}
                        </p>
                      )}

                      {/* Delivery Options */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Delivery Options:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.deliveryOptions.slice(0, 2).map((option) => (
                            <span
                              key={option}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              <FiTruck className="w-3 h-3" />
                              {option.replace("-", " ")}
                            </span>
                          ))}
                          {product.deliveryOptions.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{product.deliveryOptions.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{product.contactPhone}</span>
                        </div>
                        {product.contactEmail && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FiMail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{product.contactEmail}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleInquiry(product._id)}
                        className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
                      >
                        Contact Seller
                      </button>
                    </div>

                    {/* Footer Stats */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                      <span>{product.views || 0} views</span>
                      <span>{product.inquiries || 0} inquiries</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
