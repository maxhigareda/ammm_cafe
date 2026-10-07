'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Expense, PricingRecipe, PricingIngredient } from '@/types';
import {
  Calculator,
  Receipt,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  X,
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

  const [activeSubTab, setActiveSubTab] = useState<'costeador' | 'gastos'>('costeador');

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

  const suggestedPrice = totalCost / (1 - targetMargin / 100);
  const currentPrice = activeRecipe ? activeRecipe.currentSellingPrice : 0;
  const currentMargin = currentPrice > 0 ? ((currentPrice - totalCost) / currentPrice) * 100 : 0;
  const unitProfitSuggested = suggestedPrice - totalCost;

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
    
    updateRecipe(activeRecipe.id, {
      currentSellingPrice: roundedPrice,
      targetMarginPercentage: targetMargin,
      wastePercentage: wastePct,
      packagingCost: packagingCost,
    });

    const prod = products.find((p) => p.name.toLowerCase().includes(activeRecipe.productName.toLowerCase()) || activeRecipe.productName.toLowerCase().includes(p.name.toLowerCase()));
    if (prod) {
      updateProduct(prod.id, {
        price: roundedPrice,
        cost: parseFloat(totalCost.toFixed(2)),
      });
    }

    alert(`¡Precio de $${roundedPrice} MXN aplicado al menú POS!`);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-[#FAF8F5]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <h1 className="font-serif font-bold text-2xl text-amm-espresso tracking-tight">
            Costeador & Gastos
          </h1>
          <p className="text-xs text-amm-roast mt-0.5">
            Costeo de recetas, simulación de margen deseado y registro de egresos.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EAE6DF]">
          <button
            onClick={() => setActiveSubTab('costeador')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'costeador'
                ? 'bg-amm-mauve text-white'
                : 'text-amm-roast hover:text-amm-espresso'
            }`}
          >
            Costeador de Recetas
          </button>
          <button
            onClick={() => setActiveSubTab('gastos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'gastos'
                ? 'bg-amm-mauve text-white'
                : 'text-amm-roast hover:text-amm-espresso'
            }`}
          >
            Registro de Gastos
          </button>
        </div>
      </div>

      {/* ======================= TAB: COSTEADOR ======================= */}
      {activeSubTab === 'costeador' && (
        <div className="space-y-6">
          
          {/* Recipe Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recipes.map((rec) => (
              <button
                key={rec.id}
                onClick={() => handleSelectRecipe(rec.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  rec.id === (activeRecipe?.id || '')
                    ? 'bg-amm-espresso text-white border-amm-espresso'
                    : 'bg-white text-amm-roast border-[#EAE6DF] hover:bg-[#FAF8F5]'
                }`}
              >
                {rec.productName}
              </button>
            ))}
          </div>

          {activeRecipe && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left: Recipe Ingredients Table (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden">
                <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between">
                  <div>
                    <h2 className="font-serif font-bold text-base text-amm-espresso">
                      {activeRecipe.productName}
                    </h2>
                    <span className="text-[11px] text-amm-roast capitalize">
                      Categoría: {activeRecipe.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Table */}
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FCFBF9] text-amm-roast/80 border-b border-[#F2ECE4] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Ingrediente</th>
                        <th className="py-2.5 px-3">Porción</th>
                        <th className="py-2.5 px-3">Costo</th>
                        <th className="py-2.5 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F2EB]">
                      {activeRecipe.ingredients.map((ing) => (
                        <tr key={ing.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-2.5 px-3 font-medium text-amm-espresso">
                            {ing.name}
                          </td>
                          <td className="py-2.5 px-3 text-amm-roast">
                            {ing.quantity}
                          </td>
                          <td className="py-2.5 px-3 font-serif font-bold text-amm-espresso">
                            ${ing.cost.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleRemoveIngredient(ing.id)}
                              className="text-amm-roast hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add Inline Ingredient */}
                  <form onSubmit={handleAddIngredient} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE6DF] flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Ingrediente"
                      value={newIngName}
                      onChange={(e) => setNewIngName(e.target.value)}
                      className="flex-2 px-3 py-1.5 text-xs rounded-lg border border-[#EAE6DF] bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Porción"
                      value={newIngQty}
                      onChange={(e) => setNewIngQty(e.target.value)}
                      className="w-24 px-3 py-1.5 text-xs rounded-lg border border-[#EAE6DF] bg-white"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Costo $"
                      value={newIngCost}
                      onChange={(e) => setNewIngCost(e.target.value)}
                      className="w-20 px-3 py-1.5 text-xs rounded-lg border border-[#EAE6DF] bg-white font-bold"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-amm-mauve hover:bg-amm-mauve-dark text-white font-semibold text-xs shrink-0"
                    >
                      + Añadir
                    </button>
                  </form>

                  {/* Packaging & Waste inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                      <label className="text-[11px] font-semibold text-amm-espresso block">
                        Empaque / Desechables ($)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={packagingCost}
                        onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-[#EAE6DF] bg-white font-bold"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                      <label className="text-[11px] font-semibold text-amm-espresso block">
                        Merma Estimada (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={wastePct}
                        onChange={(e) => setWastePct(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-[#EAE6DF] bg-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Total Cost Strip */}
                  <div className="p-4 rounded-xl bg-[#FCFBF9] border border-[#EAE6DF] flex items-center justify-between text-xs">
                    <span className="font-semibold text-amm-espresso uppercase tracking-wider text-[11px]">
                      Costo Total Unitario:
                    </span>
                    <span className="font-serif font-black text-lg text-amm-mauve-dark">
                      ${totalCost.toFixed(2)} MXN
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Simulator & Pricing Proposal (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE6DF] p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amm-mauve" />
                  <h2 className="font-serif font-bold text-base text-amm-espresso">
                    Propuesta de Precio
                  </h2>
                </div>

                {/* Margin Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amm-roast font-medium">Margen deseado:</span>
                    <span className="font-bold text-amm-espresso bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE6DF]">
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
                </div>

                {/* Comparison Card */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-center">
                    <span className="text-[11px] text-amm-roast block">Precio Actual</span>
                    <div className="font-serif font-black text-xl text-amm-espresso my-1">
                      ${currentPrice.toFixed(0)}
                    </div>
                    <span className="text-[10px] text-amm-roast block">
                      Margen: {currentMargin.toFixed(0)}%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#EDFDF3] border border-[#86CCA0]/60 text-center">
                    <span className="text-[11px] font-semibold text-emerald-900 block">Sugerido Amm</span>
                    <div className="font-serif font-black text-xl text-emerald-900 my-1">
                      ${Math.round(suggestedPrice)}
                    </div>
                    <span className="text-[10px] text-emerald-800 block">
                      +${unitProfitSuggested.toFixed(2)} utilidad
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleApplySuggestedPriceToMenu}
                  className="w-full py-3 px-4 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-soft"
                >
                  <span>Actualizar en Menú POS (${Math.round(suggestedPrice)})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================= TAB: GASTOS ======================= */}
      {activeSubTab === 'gastos' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
              <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
                Total Gastos
              </span>
              <div className="font-serif font-black text-2xl text-rose-700">
                ${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
              <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
                Gastos Fijos
              </span>
              <div className="font-serif font-black text-2xl text-amm-espresso">
                ${fixedExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
              <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
                Gastos Variables
              </span>
              <div className="font-serif font-black text-2xl text-amm-mauve-dark">
                ${variableExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden">
            <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between">
              <h2 className="font-serif font-bold text-base text-amm-espresso">
                Historial de Egresos
              </h2>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Gasto</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FCFBF9] text-amm-roast/80 border-b border-[#F2ECE4] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Fecha</th>
                    <th className="py-3 px-5">Descripción</th>
                    <th className="py-3 px-5">Categoría</th>
                    <th className="py-3 px-5">Tipo</th>
                    <th className="py-3 px-5">Monto</th>
                    <th className="py-3 px-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB] text-amm-espresso">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-5 text-amm-roast">{exp.date}</td>
                      <td className="py-3.5 px-5 font-medium">{exp.description}</td>
                      <td className="py-3.5 px-5 capitalize text-amm-roast">{exp.category}</td>
                      <td className="py-3.5 px-5 capitalize">
                        <span className="text-[11px] text-amm-roast">
                          {exp.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-serif font-bold text-rose-700">
                        -${exp.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="text-amm-roast hover:text-rose-600 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#EAE6DF] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
              <h3 className="font-serif font-bold text-base text-amm-espresso">
                Registrar Gasto
              </h3>
              <button onClick={() => setIsAddExpenseOpen(false)}>
                <X className="w-4 h-4 text-amm-roast" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Compra de insumos, luz..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    Monto ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    Categoría
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]"
                  >
                    <option value="insumos">Insumos</option>
                    <option value="servicios">Servicios</option>
                    <option value="renta">Renta</option>
                    <option value="sueldos">Sueldos</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    Tipo
                  </label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]"
                  >
                    <option value="variable">Variable</option>
                    <option value="fijo">Fijo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    Método
                  </label>
                  <select
                    value={expPaidVia}
                    onChange={(e) => setExpPaidVia(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#EAE6DF] text-xs font-semibold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white text-xs font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
