"use client";
import { useState } from 'react';
import FarmersList from '@/components/FarmersList';
import AddFarmerForm from '@/components/AddFarmerForm';
import Link from 'next/link';

export default function FarmersPage() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-green-700">
              AgriFinAI
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-green-700">Home</Link>
              <Link href="/farmers" className="text-green-700 font-semibold">Farmers</Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-4">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'list' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📋 Farmers List
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'add' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            ➕ Add Farmer
          </button>
        </div>

        {activeTab === 'list' ? <FarmersList /> : <AddFarmerForm />}
      </div>
    </div>
  );
}
