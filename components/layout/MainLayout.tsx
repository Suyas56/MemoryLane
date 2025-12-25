import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-1 flex flex-col w-full relative">
        {children}
      </main>
      <Footer />
    </div>
  );
};