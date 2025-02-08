import { useEffect, useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <div className="mt-12">
          {user ? <FileUpload /> : <Auth />}
        </div>
      </div>
    </div>
  );
}