import {useLocation} from 'react-router-dom';
import {Feedback} from './data';
import React, { ReactNode } from 'react';
import Sidebar from './sidebar';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentPath?: string;
}

export default function Layout({
  children,
  title,
  subtitle,
  currentPath,
}: LayoutProps) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Sidebar currentPath={location.pathname} />

      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </header>

        <Feedback />
        {children}
      </main>
    </div>
  );
}