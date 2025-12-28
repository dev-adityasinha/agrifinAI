"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  FiUsers,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products"); // products, users, analytics, settings
  const [filter, setFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalUsers: 0,
    totalViews: 0,
    totalInquiries: 0,
  });

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      router.push("/admin/login");
      return;
    }

    fetchProducts();
    fetchUsers();
  }, [filter, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/products?status=${filter !== "all" ? filter : ""}`);
      const data = await response.json();
      
      if (data.success) {
        let allProducts = data.data;
        
        if (filter === "all") {
          const [pending, approved, rejected] = await Promise.all([
            fetch(`${apiUrl}/api/products?status=pending`).then(r => r.json()),
            fetch(`${apiUrl}/api/products?status=approved`).then(r => r.json()),
            fetch(`${apiUrl}/api/products?status=rejected`).then(r => r.json()),
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
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      // This will fetch registered users from auth API
      const response = await fetch(`${apiUrl}/api/auth/users`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
        setStats(prev => ({ ...prev, totalUsers: data.data?.length || 0 }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const calculateStats = (data) => {
    const totalViews = data.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalInquiries = data.reduce((sum, p) => sum + (p.inquiries || 0), 0);
    
    setStats(prev => ({
      ...prev,
      total: data.length,
      pending: data.filter((p) => p.status === "pending").length,
      approved: data.filter((p) => p.status === "approved").length,
      rejected: data.filter((p) => p.status === "rejected").length,
      totalViews,
      totalInquiries,
    }));
  };

  const handleStatusUpdate = async (productId, newStatus) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Product ${newStatus} successfully!`);
        fetchProducts();
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/products/${productId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert("Product deleted successfully!");
          fetchProducts();
          setSelectedProduct(null);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Product deleted successfully!');
        fetchProducts();
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/auth/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('User deleted successfully!');
        fetchUsers();
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    }
  };

  const confirmDelete = (type, item) => {
    setDeleteTarget({ type, item });
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteTarget.type === 'product') {
      handleDeleteProduct(deleteTarget.item._id);
    } else if (deleteTarget.type === 'user') {
      handleDeleteUser(deleteTarget.item._id);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage products, users, and platform settings</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-center"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FiXCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row border-b border-gray-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition text-sm sm:text-base ${
                activeTab === "products"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FiPackage className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Products Management
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition text-sm sm:text-base ${
                activeTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FiUsers className="inline w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Users & Registrations
            </button>
          </div>

          {/* Products Tab Content */}
          {activeTab === "products" && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700 text-sm sm:text-base">Filter:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["all", "pending", "approved", "rejected"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm ${
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
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition w-full sm:w-auto"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {/* Products Table */}
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center">
                  <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No products found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                          Category
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                          Location
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50 transition">
                          <td className="px-3 sm:px-6 py-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
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
                                <FiPackage className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">{product.productName}</p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                {product.quantity} {product.unit}
                              </p>
                              <p className="text-xs text-gray-500 sm:hidden mt-1">
                                {product.category} • {product.district}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">
                              ₹{product.price}/{product.unit}
                            </p>
                          </td>
                          <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                            <p className="text-xs sm:text-sm text-gray-700">{product.district}</p>
                            <p className="text-xs text-gray-500">{product.state}</p>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              {product.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(product._id, "approved")}
                                    className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                    title="Approve"
                                  >
                                    <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(product._id, "rejected")}
                                    className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Reject"
                                  >
                                    <FiXCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => confirmDelete('product', product)}
                                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Product"
                              >
                                <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
          )}

          {/* Users Tab Content */}
          {activeTab === "users" && (
            <div className="p-6">
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Registered Users ({users.length})
                </h2>
                <button
                  onClick={fetchUsers}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition w-full sm:w-auto"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <FiUsers className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No Users Yet</h3>
                  <p className="text-gray-600">No registered users found in the database.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Email
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Role
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Joined
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                              </div>
                              <div className="ml-3 sm:ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-xs text-gray-500 sm:hidden">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleUserStatus(user._id, user.isActive !== false)}
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition ${
                                user.isActive !== false ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {user.isActive !== false ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-500 hidden lg:table-cell">
                            {new Date(user.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => confirmDelete('user', user)}
                              className="text-red-600 hover:text-red-900 transition"
                              title="Delete User"
                            >
                              <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal - Same as before */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 z-10 p-4 sm:p-6 bg-white border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <FiXCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Product Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {selectedProduct.images.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                        <img
                          src={img}
                          alt={`${selectedProduct.productName} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/fallback-product.jpg';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Product Name</h3>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedProduct.productName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Category</h3>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{selectedProduct.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Quantity</h3>
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {selectedProduct.quantity} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Price</h3>
                  <p className="text-base sm:text-lg font-bold text-green-600">
                    ₹{selectedProduct.price}/{selectedProduct.unit}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  Location Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
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

              {/* Status & Actions */}
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
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedProduct._id, "approved")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    <FiCheckCircle className="w-5 h-5" />
                    Approve Product
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedProduct._id, "rejected")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this {deleteTarget.type}? 
                {deleteTarget.type === 'product' && ` "${deleteTarget.item.productName}"`}
                {deleteTarget.type === 'user' && ` "${deleteTarget.item.name}"`}
                ? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
