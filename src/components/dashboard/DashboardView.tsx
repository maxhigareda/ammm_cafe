'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardView() {
  const { sales, expenses } = useApp();

  const [dateFilter, setDateFilter] = useState<'hoy' | '7dias' | 'mes' | 'todo'>('hoy');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Filter sales based on date
  const now = new Date();
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);

    if (dateFilter === 'hoy') {
      return saleDate.toDateString() === now.toDateString();
    }
    if (dateFilter === '7dias') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return saleDate >= sevenDaysAgo;
    }
    if (dateFilter === 'mes') {
      return (
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Calculate Metrics
  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = filteredSales.reduce((sum, s) => sum + s.costTotal, 0);
  const grossProfit = totalSalesAmount - totalCost;
  const ticketCount = filteredSales.length;
  const averageTicket = ticketCount > 0 ? totalSalesAmount / ticketCount : 0;

  // Expenses in same period
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedNetProfit = grossProfit - (dateFilter === 'hoy' ? totalExpenses / 30 : totalExpenses);

  // Breakdown by payment method
  const cashSales = filteredSales
    .filter((s) => s.paymentMethod === 'efectivo')
    .reduce((sum, s) => sum + s.total, 0);
  const cardSales = filteredSales
    .filter((s) => s.paymentMethod === 'tarjeta')
    .reduce((sum, s) => sum + s.total, 0);
  const transferSales = filteredSales
    .filter((s) => s.paymentMethod === 'transferencia')
    .reduce((sum, s) => sum + s.total, 0);

  // Product sales counts
  const productPerformance: { [name: string]: { qty: number; revenue: number; category: string } } = {};
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      if (selectedCategory !== 'todos' && item.product.category !== selectedCategory) {
        return;
      }
      if (!productPerformance[item.product.name]) {
        productPerformance[item.product.name] = {
          qty: 0,
          revenue: 0,
          category: item.product.category,
        };
      }
      productPerformance[item.product.name].qty += item.quantity;
      productPerformance[item.product.name].revenue += item.itemTotal;
    });
  });

  const sortedProducts = Object.entries(productPerformance)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-[#FAF8F5]">
      
      {/* Top Header: Clean, grounded */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <h1 className="font-serif font-bold text-2xl text-amm-espresso tracking-tight">
            Dashboard & Analítica
          </h1>
          <p className="text-xs text-amm-roast mt-0.5">
            Rendimiento en vivo de ventas, márgenes y métodos de cobro en Ammm Café.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EAE6DF]">
          {(['hoy', '7dias', 'mes', 'todo'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                dateFilter === period
                  ? 'bg-amm-mauve text-white'
                  : 'text-amm-roast hover:text-amm-espresso'
              }`}
            >
              {period === '7dias' ? '7 Días' : period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 4 Cards Grid: Calm & Minimalist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] space-y-2">
          <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
            Ventas Totales
          </span>
          <div className="font-serif font-black text-2xl lg:text-3xl text-amm-espresso">
            ${totalSalesAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-amm-roast block">
            {ticketCount} {ticketCount === 1 ? 'ticket emitido' : 'tickets emitidos'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] space-y-2">
          <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
            Utilidad Bruta (Insumos)
          </span>
          <div className="font-serif font-black text-2xl lg:text-3xl text-amm-mauve-dark">
            ${grossProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-amm-roast block">
            Margen de {totalSalesAmount > 0 ? ((grossProfit / totalSalesAmount) * 100).toFixed(0) : 0}% sobre ventas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] space-y-2">
          <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
            Ticket Promedio
          </span>
          <div className="font-serif font-black text-2xl lg:text-3xl text-amm-espresso">
            ${averageTicket.toFixed(2)}
          </div>
          <span className="text-[11px] text-amm-roast block">
            Consumo promedio por cliente
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] space-y-2">
          <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
            Ganancia Neta Estimada
          </span>
          <div className="font-serif font-black text-2xl lg:text-3xl text-emerald-800">
            ${estimatedNetProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-amm-roast block">
            Deduciendo insumos y gastos
          </span>
        </div>

      </div>

      {/* Main Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Product Performance (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden">
          <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-amm-espresso">
              Rendimiento por Artículo
            </h2>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-lg border border-[#EAE6DF] px-2.5 py-1 bg-[#FAF8F5] text-amm-espresso focus:outline-none"
            >
              <option value="todos">Todas las categorías</option>
              <option value="cafe">Café</option>
              <option value="panaderia">Panadería</option>
              <option value="bocados">Bocados</option>
              <option value="bebidas_frias">Bebidas Frías</option>
              <option value="postres">Postres</option>
            </select>
          </div>

          <div className="p-5">
            {sortedProducts.length > 0 ? (
              <div className="divide-y divide-[#F5F2EB]">
                {sortedProducts.map((item, idx) => (
                  <div key={item.name} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-medium text-amm-roast w-4">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-medium text-amm-espresso block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-amm-roast capitalize">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-serif font-bold text-sm text-amm-espresso block">
                        ${item.revenue.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-amm-roast">
                        {item.qty} {item.qty === 1 ? 'vendido' : 'vendidos'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-amm-roast italic">
                Sin ventas registradas en este periodo.
              </p>
            )}
          </div>
        </div>

        {/* Right: Payment Methods Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE6DF] p-5 space-y-4">
          <h2 className="font-serif font-bold text-base text-amm-espresso">
            Métodos de Pago
          </h2>

          <div className="space-y-3 pt-1">
            
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Banknote className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="text-xs font-medium text-amm-espresso block">Efectivo en Caja</span>
                  <span className="text-[10px] text-amm-roast">En gaveta</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-serif font-bold text-sm text-amm-espresso block">
                  ${cashSales.toFixed(2)}
                </span>
                <span className="text-[10px] text-amm-roast">
                  {totalSalesAmount > 0 ? ((cashSales / totalSalesAmount) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-blue-700" />
                <div>
                  <span className="text-xs font-medium text-amm-espresso block">Tarjeta Terminal</span>
                  <span className="text-[10px] text-amm-roast">Terminal bancaria</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-serif font-bold text-sm text-amm-espresso block">
                  ${cardSales.toFixed(2)}
                </span>
                <span className="text-[10px] text-amm-roast">
                  {totalSalesAmount > 0 ? ((cardSales / totalSalesAmount) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-4 h-4 text-purple-700" />
                <div>
                  <span className="text-xs font-medium text-amm-espresso block">Transferencia SPEI</span>
                  <span className="text-[10px] text-amm-roast">Banca móvil</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-serif font-bold text-sm text-amm-espresso block">
                  ${transferSales.toFixed(2)}
                </span>
                <span className="text-[10px] text-amm-roast">
                  {totalSalesAmount > 0 ? ((transferSales / totalSalesAmount) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
