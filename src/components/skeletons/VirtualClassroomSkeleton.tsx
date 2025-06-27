'use client';

import React from 'react';

export const VirtualClassroomSkeleton = () => {
  return (
    <div className="md:p-4 md:mx-7 p-2 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-2"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-2"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-2"></div>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Teacher Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 md:col-span-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="space-y-4 w-full">
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 md:col-span-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 md:col-span-12">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default VirtualClassroomSkeleton;
