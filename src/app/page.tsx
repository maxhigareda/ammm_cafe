'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import PosView from '@/components/pos/PosView';
import DashboardView from '@/components/dashboard/DashboardView';
import CatalogView from '@/components/catalog/CatalogView';
import InventoryView from '@/components/inventory/InventoryView';
import ExpensesView from '@/components/expenses/ExpensesView';
import RecommendationsView from '@/components/recommendations/RecommendationsView';
import CashShiftView from '@/components/cash-shift/CashShiftView';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const { role, activeTab, setActiveTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'pos':
        return <PosView />;
      case 'dashboard':
        return role === 'admin' ? <DashboardView /> : <PosView />;
      case 'catalogo':
        return role === 'admin' ? <CatalogView /> : <PosView />;
      case 'inventario':
        return <InventoryView />;
      case 'gastos':
        return role === 'admin' ? <ExpensesView /> : <PosView />;
      case 'recomendaciones':
        return role === 'admin' ? <RecommendationsView /> : <PosView />;
      case 'caja':
        return <CashShiftView />;
      default:
        return <PosView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5]">
      
      {/* Desktop & Tablet Architectural Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#EAE6DF]">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Amm Café" className="w-8 h-8 object-contain" />
          <span className="font-serif font-bold text-lg text-amm-espresso">Amm Café</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-amm-espresso hover:bg-[#FAF8F5]"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slideout Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-card">
            <Sidebar />
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {renderContent()}
      </main>

    </div>
  );
}
