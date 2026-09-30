'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/layout/Navbar';
import PosView from '@/components/pos/PosView';
import DashboardView from '@/components/dashboard/DashboardView';
import CatalogView from '@/components/catalog/CatalogView';
import InventoryView from '@/components/inventory/InventoryView';
import ExpensesView from '@/components/expenses/ExpensesView';
import RecommendationsView from '@/components/recommendations/RecommendationsView';
import CashShiftView from '@/components/cash-shift/CashShiftView';

export default function Home() {
  const { role, activeTab } = useApp();

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
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {renderContent()}
      </main>
      <footer className="py-6 border-t border-amm-latte/60 text-center text-xs text-amm-roast bg-white/50">
        <p className="font-serif italic text-amm-espresso">
          Amm Café • Pan, Café & Bocados
        </p>
        <p className="text-[11px] text-amm-roast/70 mt-0.5">
          Punto de Venta & Sistema Administrativo • Diseñado con colores de marca #9C8DAC y #C9F4D3
        </p>
      </footer>
    </div>
  );
}
