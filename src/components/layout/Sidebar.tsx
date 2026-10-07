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
  CheckCircle2,
  Database,
} from 'lucide-react';

export default function Sidebar() {
  const {
    role,
    setRole,
    activeTab,
    setActiveTab,
    activeShift,
    collaboratorName,
    isSupabaseLive,
  } = useApp();

  const isShiftOpen = activeShift?.status === 'abierta';

  const mainTabs = [
    { id: 'pos', label: 'Punto de Venta', icon: ShoppingBag },
    { id: 'caja', label: 'Caja & Turnos', icon: Wallet },
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'catalogo', label: 'Catálogo & Menú', icon: Coffee },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'gastos', label: 'Costeador & Gastos', icon: Calculator },
    { id: 'recomendaciones', label: 'Recomendaciones', icon: Sparkles },
  ];

  const collaboratorTabs = [
    { id: 'inventario', label: 'Inventario & Faltantes', icon: Package },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#EAE6DF] flex flex-col justify-between min-h-screen select-none">
      
      {/* Brand Header */}
      <div>
        <div className="p-6 pb-5 border-b border-[#F2ECE4]">
          <div
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 transition-transform group-hover:scale-105 shadow-xs">
              <img
                src="/logo-circle.svg"
                alt="Ammm Café"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-xl tracking-tight text-amm-espresso">
                  Ammm
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-amm-mint text-emerald-950">
                  Café
                </span>
              </div>
              <p className="text-[10px] text-amm-roast tracking-wider uppercase font-medium mt-0.5">
                Pan, Café & Bocados
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-4 space-y-6">
          
          {/* Main Sales Operations */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-amm-roast/70 block mb-2">
              Operación
            </span>
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amm-mauve/15 text-amm-mauve-dark font-bold'
                      : 'text-amm-roast hover:text-amm-espresso hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amm-mauve-dark' : 'text-amm-roast'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Admin or Collaborator Sections */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-amm-roast/70 block mb-2">
              {role === 'admin' ? 'Administración' : 'Almacén'}
            </span>
            {(role === 'admin' ? adminTabs : collaboratorTabs).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amm-mauve/15 text-amm-mauve-dark font-bold'
                      : 'text-amm-roast hover:text-amm-espresso hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amm-mauve-dark' : 'text-amm-roast'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </nav>
      </div>

      {/* Sidebar Footer Controls: Statuses & Role */}
      <div className="p-4 border-t border-[#F2ECE4] space-y-3 bg-[#FCFBF9]">
        
        {/* Status Indicators */}
        <div className="px-2 space-y-1.5 text-[11px]">
          {/* Shift status */}
          <div
            onClick={() => setActiveTab('caja')}
            className="flex items-center justify-between cursor-pointer group py-0.5"
          >
            <span className="text-amm-roast font-medium group-hover:text-amm-espresso">
              Turno de Caja
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isShiftOpen ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={`text-[10px] font-semibold ${isShiftOpen ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isShiftOpen ? 'Abierta' : 'Cerrada'}
              </span>
            </div>
          </div>

          {/* Cloud sync status */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-amm-roast font-medium flex items-center gap-1">
              <Database className="w-3 h-3 text-amm-roast/70" /> Nube
            </span>
            <span className={`text-[10px] font-semibold ${isSupabaseLive ? 'text-emerald-700' : 'text-amm-roast'}`}>
              {isSupabaseLive ? 'Supabase Conectado' : 'Modo Local'}
            </span>
          </div>
        </div>

        {/* Minimal Role Switcher */}
        <div className="bg-[#F2ECE4]/70 p-1 rounded-xl flex items-center text-xs">
          <button
            onClick={() => setRole('admin')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
              role === 'admin'
                ? 'bg-white text-amm-espresso shadow-xs'
                : 'text-amm-roast hover:text-amm-espresso'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => {
              setRole('colaborador');
              if (['dashboard', 'catalogo', 'gastos', 'recomendaciones'].includes(activeTab)) {
                setActiveTab('pos');
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
              role === 'colaborador'
                ? 'bg-white text-amm-espresso shadow-xs'
                : 'text-amm-roast hover:text-amm-espresso'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Colaborador</span>
          </button>
        </div>

      </div>

    </aside>
  );
}
