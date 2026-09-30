'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShoppingBag,
  BarChart3,
  Coffee,
  Package,
  Calculator,
  Sparkles,
  Wallet,
  ShieldCheck,
  User,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const { role, setRole, activeTab, setActiveTab, activeShift, collaboratorName, setCollaboratorName, isSupabaseLive } = useApp();

  const isShiftOpen = activeShift?.status === 'abierta';

  const adminTabs = [
    { id: 'pos', label: 'Punto de Venta', icon: ShoppingBag },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'catalogo', label: 'Catálogo', icon: Coffee },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'gastos', label: 'Gastos & Costeador', icon: Calculator },
    { id: 'recomendaciones', label: 'Recomendaciones', icon: Sparkles },
    { id: 'caja', label: 'Caja & Turnos', icon: Wallet },
  ];

  const collaboratorTabs = [
    { id: 'pos', label: 'Punto de Venta', icon: ShoppingBag },
    { id: 'inventario', label: 'Inventario & Faltantes', icon: Package },
    { id: 'caja', label: 'Mi Caja', icon: Wallet },
  ];

  const tabs = role === 'admin' ? adminTabs : collaboratorTabs;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amm-latte/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('pos')}>
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amm-mauve/30 shadow-soft bg-amm-mauve/10 flex items-center justify-center p-1">
              <img 
                src="/logo.svg" 
                alt="Amm Café Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-2xl tracking-wide text-amm-espresso">
                  Amm
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amm-mint text-amm-espresso/80">
                  Café
                </span>
              </div>
              <p className="text-[11px] text-amm-roast tracking-wider uppercase font-medium">
                Pan, Café & Bocados
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-amm-sand/70 p-1.5 rounded-2xl border border-amm-latte">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amm-mauve text-white shadow-soft font-bold'
                      : 'text-amm-roast hover:text-amm-espresso hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amm-mauve'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Shift Badge + Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Status Pill */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border ${
                isSupabaseLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amm-sand text-amm-roast border-amm-latte'
              }`}
              title={isSupabaseLive ? 'Sincronizado en tiempo real con Supabase' : 'Conectado a Supabase (ejecuta schema.sql para sincronizar tablas)'}
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500' : 'bg-amm-mauve animate-pulse'}`} />
              <span>{isSupabaseLive ? 'Supabase Conectado' : 'Supabase Enlazado'}</span>
            </div>

            {/* Shift Status Pill */}
            <button
              onClick={() => setActiveTab('caja')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isShiftOpen
                  ? 'bg-amm-mint/40 text-emerald-800 border-amm-mint-dark/50'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isShiftOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="hidden sm:inline font-semibold">
                {isShiftOpen ? 'Caja Abierta' : 'Caja Cerrada'}
              </span>
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-amm-sand p-1 rounded-2xl border border-amm-latte">
              <button
                onClick={() => {
                  setRole('admin');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  role === 'admin'
                    ? 'bg-amm-espresso text-white shadow-sm'
                    : 'text-amm-roast hover:text-amm-espresso'
                }`}
                title="Modo Administrador"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                onClick={() => {
                  setRole('colaborador');
                  // If on a restricted tab, switch to POS
                  if (['dashboard', 'catalogo', 'gastos', 'recomendaciones'].includes(activeTab)) {
                    setActiveTab('pos');
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  role === 'colaborador'
                    ? 'bg-amm-mauve text-white shadow-sm'
                    : 'text-amm-roast hover:text-amm-espresso'
                }`}
                title="Modo Colaborador"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Colaborador</span>
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-amm-latte/40 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-amm-mauve text-white font-bold'
                    : 'text-amm-roast bg-amm-sand/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
