'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Expense, PricingRecipe, PricingIngredient } from '@/types';
import {
  Calculator,
  Receipt,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  PieChart,
} from 'lucide-react';

export default function ExpensesView() {
  const {
    expenses,
    addExpense,
    deleteExpense,
    recipes,
    addRecipe,
    updateRecipe,
    products,
    updateProduct,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'gastos' | 'costeador'>('costeador');

  // Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState<Expense['category']>('insumos');
  const [expAmount, setExpAmount] = useState('');
  const [expType, setExpType] = useState<Expense['type']>('variable');
  const [expPaidVia, setExpPaidVia] = useState<Expense['paidVia']>('transferencia');
  const [expNotes, setExpNotes] = useState('');

  // Active Recipe for Pricing Simulator
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const activeRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  // Simulator local overrides
  const [targetMargin, setTargetMargin] = useState<number>(activeRecipe ? activeRecipe.targetMarginPercentage : 70);
  const [wastePct, setWastePct] = useState<number>(activeRecipe ? activeRecipe.wastePercentage : 5);
  const [packagingCost, setPackagingCost] = useState<number>(activeRecipe ? activeRecipe.packagingCost : 3.5);

  // New Ingredient form inside recipe
  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState('');
  const [newIngCost, setNewIngCost] = useState('');

  // Sync state when recipe selection changes
  const handleSelectRecipe = (id: string) => {
    setSelectedRecipeId(id);
    const rec = recipes.find((r) => r.id === id);
    if (rec) {
      setTargetMargin(rec.targetMarginPercentage);
      setWastePct(rec.wastePercentage);
      setPackagingCost(rec.packagingCost);
    }
  };

  // Calculations for active recipe
  const rawIngredientsCost = activeRecipe
    ? activeRecipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0)
    : 0;
  const wasteCost = (rawIngredientsCost * wastePct) / 100;
  const totalCost = rawIngredientsCost + wasteCost + packagingCost;

  // Formula: Suggested Price = Total Cost / (1 - TargetMargin)
  const suggestedPrice = totalCost / (1 - targetMargin / 100);
  const currentPrice = activeRecipe ? activeRecipe.currentSellingPrice : 0;
  const currentMargin = currentPrice > 0 ? ((currentPrice - totalCost) / currentPrice) * 100 : 0;
  const unitProfitSuggested = suggestedPrice - totalCost;
  const unitProfitCurrent = currentPrice - totalCost;

  // Total Expenses calculation
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const fixedExpenses = expenses.filter((e) => e.type === 'fijo').reduce((sum, e) => sum + e.amount, 0);
  const variableExpenses = expenses.filter((e) => e.type === 'variable').reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim() || !expAmount) return;

    addExpense({
      description: expDesc,
      category: expCategory,
      amount: parseFloat(expAmount) || 0,
      type: expType,
      date: new Date().toISOString().split('T')[0],
      paidVia: expPaidVia,
      notes: expNotes,
    });

    setExpDesc('');
    setExpAmount('');
    setIsAddExpenseOpen(false);
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecipe || !newIngName.trim() || !newIngCost) return;

    const newIng: PricingIngredient = {
      id: `ing-${Date.now()}`,
      name: newIngName,
      quantity: newIngQty || '1 porción',
      cost: parseFloat(newIngCost) || 0,
    };

    updateRecipe(activeRecipe.id, {
      ingredients: [...activeRecipe.ingredients, newIng],
    });

    setNewIngName('');
    setNewIngQty('');
    setNewIngCost('');
  };

  const handleRemoveIngredient = (ingId: string) => {
    if (!activeRecipe) return;
    updateRecipe(activeRecipe.id, {
      ingredients: activeRecipe.ingredients.filter((i) => i.id !== ingId),
    });
  };

  const handleApplySuggestedPriceToMenu = () => {
    if (!activeRecipe) return;
    const roundedPrice = Math.round(suggestedPrice);
    
    // Update recipe
    updateRecipe(activeRecipe.id, {
      currentSellingPrice: roundedPrice,
      targetMarginPercentage: targetMargin,
      wastePercentage: wastePct,
      packagingCost: packagingCost,
    });

    // Also update product in live catalog if name matches
    const prod = products.find((p) => p.name.toLowerCase().includes(activeRecipe.productName.toLowerCase()) || activeRecipe.productName.toLowerCase().includes(p.name.toLowerCase()));
    if (prod) {
      updateProduct(prod.id, {
        price: roundedPrice,
        cost: parseFloat(totalCost.toFixed(2)),
      });
    }

    alert(`¡Precio de $${roundedPrice} MXN aplicado exitosamente al producto y menú POS!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Hero Header with Sub-tab switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amm-latte shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amm-mauve/20 text-amm-mauve-dark">
              Finanzas & Estrategia de Precios
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-amm-espresso">
            Gastos & Costeador Inteligente
          </h2>
          <p className="text-xs text-amm-roast max-w-xl">
            Calcula el costo real de tus ingredientes por porción, define tu margen deseado y obtén la propuesta óptima de precio de venta para garantizar la rentabilidad de Amm Café.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center bg-amm-sand p-1.5 rounded-2xl border border-amm-latte self-stretch sm:self-auto">
          <button
            onClick={() => setActiveSubTab('costeador')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'costeador'
                ? 'bg-amm-mauve text-white shadow-soft'
                : 'text-amm-roast hover:text-amm-espresso'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Costeador de Recetas</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gastos')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'gastos'
                ? 'bg-amm-mauve text-white shadow-soft'
                : 'text-amm-roast hover:text-amm-espresso'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Registro de Gastos</span>
          </button>
        </div>
      </div>

      {/* ======================= TAB: COSTEADOR INTELIGENTE ======================= */}
      {activeSubTab === 'costeador' && (
        <div className="space-y-6">
          
          {/* Recipe Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recipes.map((rec) => (
              <button
                key={rec.id}
                onClick={() => handleSelectRecipe(rec.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs border ${
                  rec.id === (activeRecipe?.id || '')
                    ? 'bg-amm-espresso text-white border-amm-espresso shadow-soft scale-[1.02]'
                    : 'bg-white text-amm-roast border-amm-latte hover:border-amm-mauve'
                }`}
              >
                {rec.productName}
              </button>
            ))}
          </div>

          {activeRecipe && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Ingredients Breakdown Table (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-amm-latte shadow-card overflow-hidden">
                <div className="p-4 border-b border-amm-latte/60 flex items-center justify-between bg-amm-sand/30">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amm-mauve-dark">
                      Ficha Técnica de Costeo
                    </span>
                    <h3 className="font-serif font-bold text-base text-amm-espresso">
                      {activeRecipe.productName}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-amm-sand text-amm-roast text-xs font-bold capitalize">
                    {activeRecipe.category}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Ingredients Table */}
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amm-sand/50 text-amm-roast uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Ingrediente</th>
                        <th className="py-2.5 px-3">Porción</th>
                        <th className="py-2.5 px-3">Costo ($)</th>
                        <th className="py-2.5 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amm-latte/40">
                      {activeRecipe.ingredients.map((ing) => (
                        <tr key={ing.id} className="hover:bg-amm-cream/50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-amm-espresso">
                            {ing.name}
                          </td>
                          <td className="py-2.5 px-3 text-amm-roast">
                            {ing.quantity}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-amm-espresso">
                            ${ing.cost.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleRemoveIngredient(ing.id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Eliminar ingrediente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add Ingredient Inline Form */}
                  <form onSubmit={handleAddIngredient} className="p-3 bg-amm-sand/40 rounded-2xl border border-amm-latte/60 flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nuevo ingrediente (ej. Vainilla)"
                      value={newIngName}
                      onChange={(e) => setNewIngName(e.target.value)}
                      className="flex-2 px-3 py-1.5 text-xs rounded-xl border border-amm-latte bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Porción (ej. 20ml)"
                      value={newIngQty}
                      onChange={(e) => setNewIngQty(e.target.value)}
                      className="w-28 px-3 py-1.5 text-xs rounded-xl border border-amm-latte bg-white"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Costo $"
                      value={newIngCost}
                      onChange={(e) => setNewIngCost(e.target.value)}
                      className="w-24 px-3 py-1.5 text-xs rounded-xl border border-amm-latte bg-white font-bold"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs shrink-0"
                    >
                      + Añadir
                    </button>
                  </form>

                  {/* Direct Overheads: Waste and Packaging */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-amm-cream border border-amm-latte space-y-1">
                      <label className="text-[11px] font-bold text-amm-espresso">
                        Empaque / Desechables ($)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={packagingCost}
                        onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1 text-xs rounded-xl border border-amm-latte bg-white font-bold text-amm-espresso"
                      />
                      <p className="text-[10px] text-amm-roast">Vaso, tapa, bolsa o servilleta</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-amm-cream border border-amm-latte space-y-1">
                      <label className="text-[11px] font-bold text-amm-espresso">
                        Merma / Desperdicio (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={wastePct}
                        onChange={(e) => setWastePct(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1 text-xs rounded-xl border border-amm-latte bg-white font-bold text-amm-espresso"
                      />
                      <p className="text-[10px] text-amm-roast">Purga de café, leche evaporada...</p>
                    </div>
                  </div>

                  {/* Cost Summary Box */}
                  <div className="p-4 rounded-2xl bg-amm-sand border border-amm-latte space-y-1.5 text-xs">
                    <div className="flex justify-between text-amm-roast">
                      <span>Insumos directos:</span>
                      <span className="font-semibold text-amm-espresso">${rawIngredientsCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-amm-roast">
                      <span>Merma estimada ({wastePct}%):</span>
                      <span className="font-semibold text-amm-espresso">${wasteCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-amm-roast">
                      <span>Empaque / Vaso:</span>
                      <span className="font-semibold text-amm-espresso">${packagingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm text-amm-espresso pt-2 border-t border-amm-latte">
                      <span>COSTO TOTAL UNITARIO:</span>
                      <span className="text-amm-mauve-dark">${totalCost.toFixed(2)} MXN</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing Simulator & Proposal (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Proposal Card */}
                <div className="p-6 rounded-3xl bg-white border-2 border-amm-mauve/40 shadow-card space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-2xl bg-amm-mint text-emerald-900">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-amm-espresso">
                        Propuesta Inteligente
                      </h3>
                      <p className="text-xs text-amm-roast">
                        Calculador automático de precio óptimo
                      </p>
                    </div>
                  </div>

                  {/* Target Margin Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amm-espresso">
                        Margen Bruto Deseado:
                      </span>
                      <span className="font-extrabold text-sm text-amm-mauve-dark bg-amm-mauve-soft px-2.5 py-0.5 rounded-full">
                        {targetMargin}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="40"
                      max="85"
                      step="1"
                      value={targetMargin}
                      onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                      className="w-full accent-amm-mauve cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-amm-roast">
                      <span>40% (Asequible)</span>
                      <span>70% (Estándar Cafetería)</span>
                      <span>85% (Alta rentabilidad)</span>
                    </div>
                  </div>

                  {/* Price Comparison */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-amm-sand/60 border border-amm-latte text-center">
                      <span className="text-[11px] text-amm-roast font-semibold">Precio Actual</span>
                      <div className="text-2xl font-black text-amm-espresso my-1">
                        ${currentPrice.toFixed(0)} <span className="text-xs font-normal">MXN</span>
                      </div>
                      <span className="text-[10px] font-bold text-amm-roast">
                        Margen: {currentMargin.toFixed(0)}%
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amm-mint/40 border border-amm-mint-dark/50 text-center ring-2 ring-emerald-500/20">
                      <span className="text-[11px] text-emerald-950 font-bold uppercase tracking-wider">
                        Sugerido Amm
                      </span>
                      <div className="text-2xl font-black text-emerald-900 my-1">
                        ${Math.round(suggestedPrice)} <span className="text-xs font-normal">MXN</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800">
                        Ganancia: +${unitProfitSuggested.toFixed(2)}/pza
                      </span>
                    </div>
                  </div>

                  {/* Insight Message */}
                  <div className="p-3.5 rounded-2xl bg-amm-cream border border-amm-latte text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amm-espresso">
                      {currentPrice < suggestedPrice ? (
                        <span className="text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Recomendación de ajuste
                        </span>
                      ) : (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Margen saludable
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-amm-roast leading-relaxed">
                      {currentPrice < suggestedPrice
                        ? `Tu precio actual ($${currentPrice}) tiene un margen de ${currentMargin.toFixed(0)}%, por debajo del objetivo (${targetMargin}%). Proponemos ajustar a $${Math.round(suggestedPrice)} MXN.`
                        : `Tu precio actual ($${currentPrice}) cubre el costo de $${totalCost.toFixed(2)} dejando una ganancia neta estimada de $${unitProfitCurrent.toFixed(2)} por unidad.`}
                    </p>
                  </div>

                  {/* Action: Apply to Menu */}
                  <button
                    onClick={handleApplySuggestedPriceToMenu}
                    className="w-full py-3 px-4 rounded-2xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>Actualizar Precio en Menú POS (${Math.round(suggestedPrice)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================= TAB: REGISTRO DE GASTOS ======================= */}
      {activeSubTab === 'gastos' && (
        <div className="space-y-6">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-amm-latte shadow-xs">
              <span className="text-xs text-amm-roast font-semibold">Total Gastos Registrados</span>
              <div className="text-3xl font-black text-rose-600 mt-1">
                ${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-amm-roast">MXN</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-amm-latte shadow-xs">
              <span className="text-xs text-amm-roast font-semibold">Gastos Fijos (Renta, Luz, Internet)</span>
              <div className="text-2xl font-black text-amm-espresso mt-1">
                ${fixedExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-amm-latte shadow-xs">
              <span className="text-xs text-amm-roast font-semibold">Gastos Variables (Insumos, Compras)</span>
              <div className="text-2xl font-black text-amm-mauve-dark mt-1">
                ${variableExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Expenses Table Container */}
          <div className="bg-white rounded-3xl border border-amm-latte shadow-card overflow-hidden">
            <div className="p-4 border-b border-amm-latte/60 flex items-center justify-between bg-amm-sand/30">
              <h3 className="font-serif font-bold text-base text-amm-espresso">
                Historial de Egresos
              </h3>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs shadow-soft transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Gasto</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amm-sand/50 text-amm-roast border-b border-amm-latte uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Descripción</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Método</th>
                    <th className="py-3 px-4">Monto ($)</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amm-latte/40 text-amm-espresso">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-amm-cream/50 transition-colors">
                      <td className="py-3 px-4 text-amm-roast font-medium">{exp.date}</td>
                      <td className="py-3 px-4 font-bold">{exp.description}</td>
                      <td className="py-3 px-4 capitalize text-amm-roast">{exp.category}</td>
                      <td className="py-3 px-4 capitalize">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.type === 'fijo' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {exp.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize text-amm-roast">{exp.paidVia}</td>
                      <td className="py-3 px-4 font-black text-rose-600">
                        -${exp.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Eliminar gasto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Modal: Add Expense */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-card border border-amm-latte p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-amm-espresso">
              Registrar Nuevo Gasto
            </h3>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Compra de café Chiapas, Pago de luz..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    Monto ($ MXN) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    Categoría
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream"
                  >
                    <option value="insumos">Insumos</option>
                    <option value="servicios">Servicios (Luz/Agua/Gas)</option>
                    <option value="renta">Renta</option>
                    <option value="sueldos">Sueldos</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    Tipo de Gasto
                  </label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream"
                  >
                    <option value="variable">Variable</option>
                    <option value="fijo">Fijo Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    Pagado con
                  </label>
                  <select
                    value={expPaidVia}
                    onChange={(e) => setExpPaidVia(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream"
                  >
                    <option value="efectivo">Efectivo de Caja</option>
                    <option value="tarjeta">Tarjeta Negocio</option>
                    <option value="transferencia">Transferencia SPEI</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-amm-latte text-xs font-bold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white text-xs font-bold shadow-soft"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
