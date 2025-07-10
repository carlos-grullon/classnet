'use client';
import React from 'react';
import { FaChartLine, FaTools } from 'react-icons/fa';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-4">
      <div className="bg-blue-100 p-6 rounded-full relative">
        <FaChartLine className="text-blue-600 text-5xl" />
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          <FaTools className="text-yellow-800 text-xs" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-400 text-center">Admin Dashboard</h1>
      <p className="text-gray-500 text-lg text-center max-w-md">
        Administrator panel in development. We are working to provide you with the best tools for management.
      </p>
    </div>
  );
}
