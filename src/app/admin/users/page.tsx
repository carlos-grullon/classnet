'use client';
import React from 'react';
import { FaUsers, FaUserCog } from 'react-icons/fa';

export default function Users() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-4">
      <div className="bg-blue-100 p-6 rounded-full relative">
        <FaUsers className="text-blue-600 text-5xl" />
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          <FaUserCog className="text-yellow-800 text-xs" />
        </div>
      </div>
      <h1 className="text-3xl text-gray-600 dark:text-gray-400 font-bold text-center">User Management</h1>
      <p className="text-lg text-gray-500 text-center max-w-md">
        User management panel in development. We&apos;re building powerful tools for user administration.
      </p>
    </div>
  );
}