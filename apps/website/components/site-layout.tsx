"use client";

import React from 'react';
import { Header } from './Header';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
