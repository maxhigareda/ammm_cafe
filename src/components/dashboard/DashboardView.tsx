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
  Calendar,
  Filter,
  ArrowUpRight,
  Coffee,
  CheckCircle,
} from 'lucide-react';

export default function DashboardView() {
  const { sales, expenses, products } = useApp();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amm-latte shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amm-mauve/20 text-amm-mauve-dark">
              Panel Administrativo de Resultados
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-amm-espresso">
            Dashboard de Ventas & Rendimiento
          </h2>
          <p className="text-xs text-amm-roast max-w-xl">
            Monitorea los números en tiempo real, ingresos por método de pago y el comportamiento de los clientes en Amm Café.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center bg-amm-sand p-1.5 rounded-2xl border border-amm-latte self-stretch sm:self-auto">
          {(['hoy', '7dias', 'mes', 'todo'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                dateFilter === period
                  ? 'bg-amm-mauve text-white shadow-soft'
                  : 'text-amm-roast hover:text-amm-espresso'
              }`}
            >
              {period === '7dias' ? '7 Días' : period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-3xl border border-amm-latte shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amm-roast">Ventas Totales</span>
            <div className="p-2 rounded-xl bg-amm-mint text-emerald-950">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amm-espresso tracking-tight">
              ${totalSalesAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-amm-roast mt-1 flex items-center gap-1">
              <span className="text-emerald-700 font-bold">{ticketCount} tickets</span> generados
            </p>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-5 rounded-3xl border border-amm-latte shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amm-roast">Utilidad Bruta Insumos</span>
            <div className="p-2 rounded-xl bg-amm-mauve-soft text-amm-mauve-dark">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amm-mauve-dark tracking-tight">
              ${grossProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-amm-roast mt-1">
              Margen bruto: {totalSalesAmount > 0 ? ((grossProfit / totalSalesAmount) * 100).toFixed(0) : 0}% sobre ventas
            </p>
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white p-5 rounded-3xl border border-amm-latte shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amm-roast">Ticket Promedio</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amm-espresso tracking-tight">
              ${averageTicket.toFixed(2)}
            </div>
            <p className="text-[11px] text-amm-roast mt-1">
              Promedio gastado por cliente
            </p>
          </div>
        </div>

        {/* Estimated Net */}
        <div className="bg-white p-5 rounded-3xl border border-amm-latte shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amm-roast">Ganancia Neta Estimada</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-700 tracking-tight">
              ${estimatedNetProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-amm-roast mt-1">
              Deduciendo insumos y gastos
            </p>
          </div>
        </div>

      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white rounded-3xl border border-amm-latte p-6 shadow-card space-y-4">
        <h3 className="font-serif font-bold text-base text-amm-espresso">
          Ingresos por Método de Pago
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-amm-cream border border-amm-latte flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-amm-roast font-semibold">Efectivo en Caja</span>
                <div className="text-xl font-black text-amm-espresso mt-0.5">
                  ${cashSales.toFixed(2)}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {totalSalesAmount > 0 ? ((cashSales / totalSalesAmount) * 100).toFixed(0) : 0}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amm-cream border border-amm-latte flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-amm-roast font-semibold">Tarjeta Terminal</span>
                <div className="text-xl font-black text-amm-espresso mt-0.5">
                  ${cardSales.toFixed(2)}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              {totalSalesAmount > 0 ? ((cardSales / totalSalesAmount) * 100).toFixed(0) : 0}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amm-cream border border-amm-latte flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-amm-roast font-semibold">Transferencias</span>
                <div className="text-xl font-black text-amm-espresso mt-0.5">
                  ${transferSales.toFixed(2)}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
              {totalSalesAmount > 0 ? ((transferSales / totalSalesAmount) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Product Ranking & Recent Sales Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Product Sales Ranking (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-amm-latte shadow-card overflow-hidden">
          <div className="p-4 border-b border-amm-latte/60 flex items-center justify-between bg-amm-sand/30">
            <h3 className="font-serif font-bold text-base text-amm-espresso">
              Rendimiento por Artículo
            </h3>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-xl border border-amm-latte px-2.5 py-1 bg-white font-medium text-amm-espresso"
            >
              <option value="todos">Todas las categorías</option>
              <option value="cafe">Café</option>
              <option value="panaderia">Panadería</option>
              <option value="bocados">Bocados</option>
              <option value="bebidas_frias">Bebidas Frías</option>
              <option value="postres">Postres</option>
            </select>
          </div>

          <div className="p-4">
            {sortedProducts.length > 0 ? (
              <div className="divide-y divide-amm-latte/40">
                {sortedProducts.map((item, idx) => (
                  <div key={item.name} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amm-sand font-bold text-[10px] text-amm-roast flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-amm-espresso">{item.name}</span>
                        <span className="text-[10px] text-amm-roast block capitalize">{item.category}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-amm-espresso block">
                        ${item.revenue.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-amm-roast">
                        {item.qty} vendidos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-amm-roast italic">
                No hay ventas registradas en este periodo aún.
              </p>
            )}
          </div>
        </div>

        {/* Recent Tickets (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-amm-latte shadow-card overflow-hidden">
          <div className="p-4 border-b border-amm-latte/60 flex items-center justify-between bg-amm-sand/30">
            <h3 className="font-serif font-bold text-base text-amm-espresso">
              Últimos Tickets Emitidos
            </h3>
            <span className="text-[11px] font-semibold text-amm-roast">
              {filteredSales.length} total
            </span>
          </div>

          <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto divide-y divide-amm-latte/40">
            {filteredSales.length > 0 ? (
              filteredSales.slice(0, 8).map((sale) => (
                <div key={sale.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amm-espresso">
                        Ticket #{sale.ticketNumber}
                      </span>
                      <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-amm-sand text-amm-roast font-semibold">
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <span className="text-[10px] text-amm-roast block mt-0.5">
                      {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.collaboratorName}
                    </span>
                  </div>

                  <span className="font-extrabold text-sm text-amm-mauve-dark">
                    ${sale.total.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-amm-roast italic">
                Sin tickets recientes.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
