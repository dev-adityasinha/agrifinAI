"use client";
import { useState, useEffect } from "react";
import { productAPI } from "@/lib/api";
import {
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiTrash2,
  FiFilter,
  FiRefreshCw,
  FiPackage,
  FiAlertCircle,
  FiUser,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch all products first, then filter on client side
      const response = await fetch('/api/admin/products?status=' + (filter !== "all" ? filter : ""));
      const data = await response.json();
      
      if (data.success) {
        let allProducts = data.data;
        
        // If filter is "all", fetch from all status endpoints
        if (filter === "all") {
          const [pending, approved, rejected] = await Promise.all([
            fetch('/api/admin/products?status=pending').then(r => r.json()),
            fetch('/api/admin/products?status=approved').then(r => r.json()),
            fetch('/api/admin/products?status=rejected').then(r => r.json()),
          ]);
          
          allProducts = [
            ...(pending.success ? pending.data : []),
            ...(approved.success ? approved.data : []),
            ...(rejected.success ? rejected.data : []),
          ];
        }
        
        setProducts(allProducts);
        calculateStats(allProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter((p) => p.status === "pending").length,
      approved: data.filter((p) => p.status === "approved").length,
      rejected: data.filter((p) => p.status === "rejected").length,
    });
  };

  const handleStatusUpdate = async (productId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Product ${newStatus} successfully!`);
        fetchProducts();
        setSelectedProduct(null);
      } else {
        alert('Failed to update status: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Check if backend is running.");
    }
  };

  const handleDelete = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert("Product deleted successfully!");
          fetchProducts();
          setSelectedProduct(null);
        } else {
          alert('Failed to delete: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Check if backend is running.");
      }
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      sold: "bg-blue-100 text-blue-800 border-blue-300",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage and approve product listings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-yellow-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="mt-1 text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                <FiAlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-green-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="mt-1 text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-red-200 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="mt-1 text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                <FiXCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Refresh */}
        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-lg rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Filter:</span>
              <div className="flex gap-2">
                {["all", "pending", "approved", "rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filter === status
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 font-semibold text-white transition bg-green-600 rounded-lg hover:bg-green-700"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <FiPackage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg text-gray-600">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                      Location
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{product.productName}</p>
                          <p className="text-sm text-gray-500">
                            {product.quantity} {product.unit}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 rounded-full bg-blue-50">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          ₹{product.price}/{product.unit}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{product.district}</p>
                        <p className="text-xs text-gray-500">{product.state}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-2 text-blue-600 transition rounded-lg hover:bg-blue-50"
                            title="View Details"
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                          {product.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(product._id, "approved")}
                                className="p-2 text-green-600 transition rounded-lg hover:bg-green-50"
                                title="Approve"
                              >
                                <FiCheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(product._id, "rejected")}
                                className="p-2 text-red-600 transition rounded-lg hover:bg-red-50"
                                title="Reject"
                              >
                                <FiXCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 transition rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 transition rounded-lg hover:bg-gray-100"
                >
                  <FiXCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-600">Product Name</h3>
                  <p className="text-lg font-bold text-gray-900">{selectedProduct.productName}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-600">Category</h3>
                  <p className="text-lg font-bold text-gray-900">{selectedProduct.category}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-600">Quantity</h3>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedProduct.quantity} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-600">Price</h3>
                  <p className="text-lg font-bold text-green-600">
                    ₹{selectedProduct.price}/{selectedProduct.unit}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-600">Description</h3>
                  <p className="p-4 text-gray-700 rounded-lg bg-gray-50">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900">
                  <FiMapPin className="w-4 h-4" />
                  Location Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium text-gray-900">{selectedProduct.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">District:</span>
                    <p className="font-medium text-gray-900">{selectedProduct.district}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">State:</span>
                    <p className="font-medium text-gray-900">{selectedProduct.state}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Pincode:</span>
                    <p className="font-medium text-gray-900">{selectedProduct.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="p-4 border border-green-200 bg-green-50 rounded-xl">
                <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900">
                  <FiUser className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium text-gray-900">{selectedProduct.contactName}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Phone:</span>{" "}
                    <span className="font-medium text-gray-900">{selectedProduct.contactPhone}</span>
                  </p>
                  {selectedProduct.contactEmail && (
                    <p>
                      <span className="text-gray-600">Email:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {selectedProduct.contactEmail}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Options */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-600">Delivery Options</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.deliveryOptions.map((option) => (
                    <span
                      key={option}
                      className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full"
                    >
                      {option.replace("-", " ").toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Organic:</span>
                  <p className="font-medium text-gray-900">
                    {selectedProduct.organicCertified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Views:</span>
                  <p className="font-medium text-gray-900">{selectedProduct.views || 0}</p>
                </div>
                <div>
                  <span className="text-gray-600">Inquiries:</span>
                  <p className="font-medium text-gray-900">{selectedProduct.inquiries || 0}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <div className="mt-2">
                    <StatusBadge status={selectedProduct.status} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedProduct.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedProduct._id, "approved")}
                    className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition bg-green-600 rounded-xl hover:bg-green-700"
                  >
                    <FiCheckCircle className="w-5 h-5" />
                    Approve Product
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedProduct._id, "rejected")}
                    className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition bg-red-600 rounded-xl hover:bg-red-700"
                  >
                    <FiXCircle className="w-5 h-5" />
                    Reject Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
