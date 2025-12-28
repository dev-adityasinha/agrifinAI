"use client";
import { useState, useEffect } from 'react';
import { farmerAPI } from '@/lib/api';

export default function FarmersList() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await farmerAPI.getAll();
      setFarmers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch farmers: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl">Loading farmers...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl text-red-600">{error}</div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">👨‍🌾 Farmers List</h1>
      <div className="text-sm text-gray-600 mb-4">Total Farmers: {farmers.length}</div>
      
      {farmers.length === 0 ? (
        <p className="text-gray-500">No farmers registered yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map((farmer) => (
            <div key={farmer._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">{farmer.name}</h3>
              <p className="text-gray-600">📧 {farmer.email}</p>
              <p className="text-gray-600">📱 {farmer.phone}</p>
              <p className="text-gray-600">🌾 {farmer.cropType}</p>
              <p className="text-gray-600">📏 {farmer.landSize} acres</p>
              <p className="text-gray-600">
                💳 Credit Score: <span className="font-semibold">{farmer.creditScore}</span>
              </p>
              <p className="mt-2">
                🏦 Loan Status: <span className={`font-semibold ${
                  farmer.loanStatus === 'Active' ? 'text-green-600' : 
                  farmer.loanStatus === 'Approved' ? 'text-blue-600' : 
                  'text-gray-600'
                }`}>{farmer.loanStatus}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
