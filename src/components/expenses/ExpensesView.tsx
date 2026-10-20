'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Expense, PricingRecipe, PricingIngredient, SupplyItem, Product } from '@/types';
import {
  Calculator,
  Receipt,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  X,
  Search,
  CheckCircle2,
  Coffee,
  Package,
  Layers,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { getProductSizeLabel } from '@/lib/productUtils';

/**
 * Intelligent helper to calculate ingredient cost based on supply unit and portion unit
 */
function calculateIngredientCost(supply: SupplyItem | null, amount: number, unit: string): number {
  if (!supply || isNaN(amount) || amount <= 0) return 0;
  const supplyUnit = (supply.unit || '').toLowerCase().trim();
  const selectedUnit = (unit || '').toLowerCase().trim();

  // If supply is priced in kg
  if (supplyUnit.includes('kg') || supplyUnit.includes('kilo')) {
    if (selectedUnit === 'g' || selectedUnit === 'gramo' || selectedUnit === 'gramos') {
      return (amount / 1000) * supply.unitCost;
    }
    return amount * supply.unitCost;
  }

  // If supply is priced in Liters
  if (supplyUnit === 'l' || supplyUnit.includes('litro') || supplyUnit.includes('lt')) {
    if (selectedUnit === 'ml' || selectedUnit === 'mililitro' || selectedUnit === 'mililitros') {
      return (amount / 1000) * supply.unitCost;
    }
    return amount * supply.unitCost;
  }

  // If supply is priced in grams
  if (supplyUnit === 'g' || supplyUnit.includes('gramo')) {
    if (selectedUnit === 'kg') {
      return amount * 1000 * supply.unitCost;
    }
    return amount * supply.unitCost;
  }

  // If supply is priced in ml
  if (supplyUnit === 'ml' || supplyUnit.includes('mililitro')) {
    if (selectedUnit === 'l' || selectedUnit === 'litro') {
      return amount * 1000 * supply.unitCost;
    }
    return amount * supply.unitCost;
  }

  // Default: pieces, units, packages, etc.
  return amount * supply.unitCost;
}

/**
 * Returns available portion units according to the supply's warehouse base unit
 */
function getAvailableUnitsForSupply(supply: SupplyItem | null): { id: string; label: string }[] {
  if (!supply) return [{ id: 'unidad', label: 'unidad(es)' }];
  const u = (supply.unit || '').toLowerCase().trim();

  if (u.includes('kg') || u.includes('kilo')) {
    return [
      { id: 'g', label: 'g (gramos)' },
      { id: 'kg', label: 'kg (kilos)' },
    ];
  }

  if (u === 'l' || u.includes('litro') || u.includes('lt')) {
    return [
      { id: 'ml', label: 'ml (mililitros)' },
      { id: 'L', label: 'L (litros)' },
    ];
  }

  if (u.includes('pieza') || u.includes('pz') || u.includes('pza') || u.includes('unidad')) {
    return [{ id: 'pz', label: 'pieza(s)' }];
  }

  if (u.includes('paquete')) {
    return [
      { id: 'pz', label: 'pieza(s)' },
      { id: 'paquete', label: 'paquete(s)' },
    ];
  }

  return [{ id: supply.unit, label: supply.unit }];
}

export default function ExpensesView() {
  const {
    expenses,
    addExpense,
    deleteExpense,
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    products,
    updateProduct,
    supplies,
    categories,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'costeador' | 'gastos'>('costeador');

  // Product Selection for Costeador
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productFilterCategory, setProductFilterCategory] = useState<string>('todos');

  // Synchronized selected product
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  // Find active recipe matching the selected product
  const activeRecipe = useMemo(() => {
    if (!selectedProduct) return null;
    return (
      recipes.find(
        (r) =>
          r.productId === selectedProduct.id ||
          r.productName.toLowerCase().trim() === selectedProduct.name.toLowerCase().trim()
      ) || null
    );
  }, [recipes, selectedProduct]);

  // Simulator local overrides
  const [targetMargin, setTargetMargin] = useState<number>(70);
  const [wastePct, setWastePct] = useState<number>(5);
  const [packagingCost, setPackagingCost] = useState<number>(3.5);

  // Sync simulator controls when active recipe changes
  useEffect(() => {
    if (activeRecipe) {
      setTargetMargin(activeRecipe.targetMarginPercentage || 70);
      setWastePct(activeRecipe.wastePercentage ?? 5);
      setPackagingCost(activeRecipe.packagingCost ?? 3.5);
    } else if (selectedProduct) {
      const isDrink = ['cafe', 'bebidas_frias'].includes(selectedProduct.category);
      setPackagingCost(isDrink ? 3.5 : 2.0);
      setWastePct(5);
      setTargetMargin(70);
    }
  }, [activeRecipe, selectedProduct]);

  // New Ingredient Form State
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>('');
  const [inputAmount, setInputAmount] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('g');
  const [customCostOverride, setCustomCostOverride] = useState<string>('');

  // Custom Ingredient (if not in warehouse)
  const isCustomIngredient = selectedSupplyId === 'custom';
  const [customIngName, setCustomIngName] = useState('');
  const [customIngQty, setCustomIngQty] = useState('');
  const [customIngCost, setCustomIngCost] = useState('');

  // Toast notification for catalog sync
  const [syncAlert, setSyncAlert] = useState<string | null>(null);

  useEffect(() => {
    if (syncAlert) {
      const timer = setTimeout(() => setSyncAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [syncAlert]);

  // When supply changes, default the unit to the best portion unit
  const selectedSupply = useMemo(() => {
    if (!selectedSupplyId || selectedSupplyId === 'custom') return null;
    return supplies.find((s) => s.id === selectedSupplyId) || null;
  }, [supplies, selectedSupplyId]);

  useEffect(() => {
    if (selectedSupply) {
      const units = getAvailableUnitsForSupply(selectedSupply);
      setSelectedUnit(units[0]?.id || selectedSupply.unit);
      setCustomCostOverride('');
    }
  }, [selectedSupply]);

  // Calculated live ingredient cost
  const calculatedCost = useMemo(() => {
    if (isCustomIngredient) {
      return parseFloat(customIngCost) || 0;
    }
    if (customCostOverride) {
      return parseFloat(customCostOverride) || 0;
    }
    const num = parseFloat(inputAmount);
    if (!selectedSupply || isNaN(num) || num <= 0) return 0;
    return parseFloat(calculateIngredientCost(selectedSupply, num, selectedUnit).toFixed(2));
  }, [isCustomIngredient, customIngCost, customCostOverride, inputAmount, selectedSupply, selectedUnit]);

  // Calculations for active recipe
  const rawIngredientsCost = activeRecipe
    ? activeRecipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0)
    : 0;
  const wasteCost = (rawIngredientsCost * wastePct) / 100;
  const totalCost = parseFloat((rawIngredientsCost + wasteCost + packagingCost).toFixed(2));

  const suggestedPrice = Math.round(targetMargin < 100 ? totalCost / (1 - targetMargin / 100) : totalCost);
  const currentCatalogPrice = selectedProduct ? selectedProduct.price : 0;
  const currentCatalogCost = selectedProduct ? selectedProduct.cost : 0;
  const currentMargin = currentCatalogPrice > 0 ? ((currentCatalogPrice - totalCost) / currentCatalogPrice) * 100 : 0;
  const unitProfitSuggested = suggestedPrice - totalCost;

  // Helper to ensure a recipe exists for the selected product
  const getOrCreateRecipe = (prod: Product): PricingRecipe => {
    const existing = recipes.find(
      (r) => r.productId === prod.id || r.productName.toLowerCase().trim() === prod.name.toLowerCase().trim()
    );
    if (existing) {
      if (!existing.productId) {
        updateRecipe(existing.id, { productId: prod.id });
      }
      return existing;
    }

    const isDrink = ['cafe', 'bebidas_frias'].includes(prod.category);
    const newRec = addRecipe({
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      ingredients: [],
      packagingCost: isDrink ? 3.5 : 2.0,
      wastePercentage: 5,
      currentSellingPrice: prod.price > 0 ? prod.price : 45,
      targetMarginPercentage: 70,
    });
    return newRec;
  };

  // Add ingredient & immediately sync to catalog (User requirement)
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    let rec = activeRecipe;
    if (!rec) {
      rec = getOrCreateRecipe(selectedProduct);
    }

    let ingName = '';
    let ingCost = 0;
    let ingQtyStr = '';

    if (isCustomIngredient) {
      if (!customIngName.trim() || !customIngCost) return;
      ingName = customIngName.trim();
      ingCost = parseFloat(customIngCost) || 0;
      ingQtyStr = customIngQty.trim() || '1 porción';
    } else {
      if (!selectedSupply || !inputAmount || parseFloat(inputAmount) <= 0) return;
      ingName = selectedSupply.name;
      const numAmount = parseFloat(inputAmount);
      ingCost = calculatedCost;
      ingQtyStr = `${numAmount} ${selectedUnit}`;
    }

    const newIng: PricingIngredient = {
      id: `ing-${Date.now()}`,
      supplyId: isCustomIngredient ? undefined : selectedSupply?.id,
      name: ingName,
      quantity: ingQtyStr,
      amount: isCustomIngredient ? undefined : parseFloat(inputAmount),
      unit: isCustomIngredient ? undefined : selectedUnit,
      cost: ingCost,
    };

    const newIngredients = [...rec.ingredients, newIng];

    // Compute updated totals
    const newRawCost = newIngredients.reduce((sum, i) => sum + i.cost, 0);
    const newWaste = (newRawCost * wastePct) / 100;
    const newTotalCost = parseFloat((newRawCost + newWaste + packagingCost).toFixed(2));
    const newSuggestedPrice = Math.round(targetMargin < 100 ? newTotalCost / (1 - targetMargin / 100) : newTotalCost);

    // 1. Update Recipe in state and persistence
    updateRecipe(rec.id, {
      ingredients: newIngredients,
      currentSellingPrice: newSuggestedPrice > 0 ? newSuggestedPrice : rec.currentSellingPrice,
      packagingCost,
      wastePercentage: wastePct,
      targetMarginPercentage: targetMargin,
    });

    // 2. Automatically update Product in Catalog (Costo de insumos y Precio final)
    updateProduct(selectedProduct.id, {
      cost: newTotalCost,
      price: newSuggestedPrice > 0 ? newSuggestedPrice : selectedProduct.price,
    });

    // Reset inputs
    setInputAmount('');
    setCustomCostOverride('');
    setCustomIngName('');
    setCustomIngQty('');
    setCustomIngCost('');

    setSyncAlert(`¡Ingrediente añadido! Catálogo actualizado: Costo $${newTotalCost.toFixed(2)} MXN | Precio $${newSuggestedPrice} MXN`);
  };

  // Remove ingredient & re-sync to catalog
  const handleRemoveIngredient = (ingId: string) => {
    if (!activeRecipe || !selectedProduct) return;
    const newIngredients = activeRecipe.ingredients.filter((i) => i.id !== ingId);

    const newRawCost = newIngredients.reduce((sum, i) => sum + i.cost, 0);
    const newWaste = (newRawCost * wastePct) / 100;
    const newTotalCost = parseFloat((newRawCost + newWaste + packagingCost).toFixed(2));
    const newSuggestedPrice = Math.round(targetMargin < 100 ? newTotalCost / (1 - targetMargin / 100) : newTotalCost);

    updateRecipe(activeRecipe.id, {
      ingredients: newIngredients,
      currentSellingPrice: newSuggestedPrice > 0 ? newSuggestedPrice : activeRecipe.currentSellingPrice,
    });

    updateProduct(selectedProduct.id, {
      cost: newTotalCost,
      price: newSuggestedPrice > 0 ? newSuggestedPrice : selectedProduct.price,
    });

    setSyncAlert(`Ingrediente retirado. Catálogo actualizado: Costo $${newTotalCost.toFixed(2)} MXN | Precio $${newSuggestedPrice} MXN`);
  };

  // Manual one-click apply to Menu & Catalog
  const handleApplySuggestedPriceToMenu = () => {
    if (!selectedProduct) return;
    let rec = activeRecipe;
    if (!rec) {
      rec = getOrCreateRecipe(selectedProduct);
    }

    const roundedPrice = Math.round(suggestedPrice);
    const computedCost = parseFloat(totalCost.toFixed(2));

    updateRecipe(rec.id, {
      currentSellingPrice: roundedPrice,
      targetMarginPercentage: targetMargin,
      wastePercentage: wastePct,
      packagingCost: packagingCost,
    });

    updateProduct(selectedProduct.id, {
      price: roundedPrice,
      cost: computedCost,
    });

    setSyncAlert(`¡Sincronizado con Menú POS y Catálogo! Costo: $${computedCost.toFixed(2)} MXN | Precio: $${roundedPrice} MXN`);
  };

  // Delete / Reset Recipe Sheet
  const handleDeleteActiveRecipe = () => {
    if (!activeRecipe) return;
    if (confirm(`¿Deseas eliminar la ficha de costeo de "${activeRecipe.productName}"?`)) {
      deleteRecipe(activeRecipe.id);
      setSyncAlert(`Ficha de costeo eliminada.`);
    }
  };

  // Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState<Expense['category']>('insumos');
  const [expAmount, setExpAmount] = useState('');
  const [expType, setExpType] = useState<Expense['type']>('variable');
  const [expPaidVia, setExpPaidVia] = useState<Expense['paidVia']>('transferencia');
  const [expNotes, setExpNotes] = useState('');

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

  // Filtered products for selection strip
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = productFilterCategory === 'todos' || p.category === productFilterCategory;
      const matchesSearch = p.name.toLowerCase().includes(productSearchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, productFilterCategory, productSearchQuery]);

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-[#FAF8F5]">
      
      {/* Toast Notification Alert */}
      {syncAlert && (
        <div className="fixed top-5 right-5 z-50 bg-amm-espresso text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-card flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200 border border-amm-mauve/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncAlert}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <h1 className="font-serif font-bold text-2xl text-amm-espresso tracking-tight">
            Costeador & Gastos
          </h1>
          <p className="text-xs text-amm-roast mt-0.5">
            Costeo de recetas con insumos de inventario, sincronización automática con el catálogo y registro de egresos.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EAE6DF] shadow-2xs">
          <button
            onClick={() => setActiveSubTab('costeador')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'costeador'
                ? 'bg-amm-mauve text-white shadow-xs'
                : 'text-amm-roast hover:text-amm-espresso'
            }`}
          >
            Costeador de Recetas
          </button>
          <button
            onClick={() => setActiveSubTab('gastos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'gastos'
                ? 'bg-amm-mauve text-white shadow-xs'
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

          {/* Product Selection Section */}
          <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 sm:p-5 space-y-4 shadow-2xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amm-mauve-dark" />
                <span className="text-xs font-bold uppercase tracking-wider text-amm-espresso">
                  Selecciona Producto del Catálogo a Costear
                </span>
                <span className="text-[11px] text-amm-roast">
                  ({products.length} productos en menú)
                </span>
              </div>

              {/* Search in products */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amm-roast/60" />
                <input
                  type="text"
                  placeholder="Buscar en menú..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] focus:outline-none focus:bg-white focus:border-amm-mauve"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setProductFilterCategory('todos')}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  productFilterCategory === 'todos'
                    ? 'bg-amm-espresso text-white font-semibold'
                    : 'bg-[#FAF8F5] text-amm-roast border border-[#EAE6DF] hover:bg-white'
                }`}
              >
                Todos ({products.length})
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setProductFilterCategory(c.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      productFilterCategory === c.id
                        ? 'bg-amm-espresso text-white font-semibold'
                        : 'bg-[#FAF8F5] text-amm-roast border border-[#EAE6DF] hover:bg-white'
                    }`}
                  >
                    {c.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Products Horizontal Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {filteredProducts.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                const size = getProductSizeLabel(prod);
                const hasRecipe = recipes.some(
                  (r) =>
                    (r.productId === prod.id || r.productName.toLowerCase().trim() === prod.name.toLowerCase().trim()) &&
                    r.ingredients &&
                    r.ingredients.length > 0
                );

                return (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProductId(prod.id)}
                    className={`px-3.5 py-2.5 rounded-xl text-left whitespace-nowrap transition-all border shrink-0 flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-amm-espresso text-white border-amm-espresso shadow-xs'
                        : 'bg-[#FAF8F5] text-amm-espresso border-[#EAE6DF] hover:bg-white hover:border-amm-mauve/60'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${hasRecipe ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        <span className="text-xs font-bold truncate max-w-[170px]" title={prod.name}>
                          {prod.name}
                        </span>
                        {size && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-[#EAE6DF] text-amm-roast'
                            }`}
                          >
                            {size}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] mt-0.5 opacity-80">
                        <span>PVP: ${prod.price}</span>
                        <span>•</span>
                        <span>Costo: ${prod.cost}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Active Product & Recipe Editor */}
          {selectedProduct ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Recipe Sheet & Inventory Ingredients Form (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden shadow-2xs">
                
                {/* Header of Active Product */}
                <div className="p-5 border-b border-[#F2ECE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FCFBF9]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif font-bold text-lg text-amm-espresso">
                        {selectedProduct.name}
                      </h2>
                      {getProductSizeLabel(selectedProduct) && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F2ECE4] text-amm-mauve-dark border border-[#EAE6DF]">
                          {getProductSizeLabel(selectedProduct)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-amm-roast mt-1">
                      <span>Categoría: <strong className="capitalize text-amm-espresso">{selectedProduct.category.replace('_', ' ')}</strong></span>
                      <span>•</span>
                      <span>Catálogo: <strong>${currentCatalogPrice}</strong> (Costo: <strong>${currentCatalogCost}</strong>)</span>
                    </div>
                  </div>

                  {activeRecipe && (
                    <button
                      onClick={handleDeleteActiveRecipe}
                      className="text-xs text-amm-roast hover:text-rose-600 transition-colors flex items-center gap-1 self-start sm:self-center"
                      title="Eliminar esta ficha de costeo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpiar Receta</span>
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-5">

                  {/* Ingredients Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amm-espresso uppercase tracking-wider">
                        Ingredientes & Insumos Utilizados ({activeRecipe?.ingredients.length || 0})
                      </span>
                      <span className="text-[11px] text-amm-roast">
                        Subtotal insumos: <strong className="text-amm-espresso">${rawIngredientsCost.toFixed(2)} MXN</strong>
                      </span>
                    </div>

                    <div className="border border-[#EAE6DF] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF8F5] text-amm-roast uppercase text-[10px] tracking-wider border-b border-[#EAE6DF]">
                          <tr>
                            <th className="py-2.5 px-3">Insumo</th>
                            <th className="py-2.5 px-3">Porción / Cantidad</th>
                            <th className="py-2.5 px-3">Costo Unit.</th>
                            <th className="py-2.5 px-3 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F2EB]">
                          {activeRecipe && activeRecipe.ingredients.length > 0 ? (
                            activeRecipe.ingredients.map((ing) => (
                              <tr key={ing.id} className="hover:bg-[#FAF8F5] transition-colors">
                                <td className="py-2.5 px-3 font-medium text-amm-espresso">
                                  <div className="flex items-center gap-1.5">
                                    <span>{ing.name}</span>
                                    {ing.supplyId && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                                        Inventario
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-amm-roast font-mono">
                                  {ing.quantity}
                                </td>
                                <td className="py-2.5 px-3 font-serif font-bold text-amm-espresso">
                                  ${ing.cost.toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => handleRemoveIngredient(ing.id)}
                                    className="p-1 rounded text-amm-roast hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Quitar ingrediente y actualizar catálogo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-xs text-amm-roast italic">
                                Sin ingredientes aún. Selecciona insumos de tu almacén abajo para agregarlos.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Form to Add Ingredient from Inventory */}
                  <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE6DF] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amm-espresso flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-amm-mauve" />
                        <span>Añadir Insumo desde Inventario</span>
                      </span>
                      <span className="text-[10px] text-amm-roast">
                        Actualiza automáticamente catálogo y precio
                      </span>
                    </div>

                    <form onSubmit={handleAddIngredient} className="space-y-3">
                      
                      {/* Supply Selection Dropdown */}
                      <div>
                        <label className="block text-[11px] font-semibold text-amm-roast mb-1">
                          Insumo de Almacén:
                        </label>
                        <select
                          value={selectedSupplyId}
                          onChange={(e) => setSelectedSupplyId(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-white font-medium text-amm-espresso focus:outline-none focus:border-amm-mauve"
                        >
                          <option value="">-- Elige un insumo del almacén --</option>
                          
                          {/* Categorized supplies */}
                          <optgroup label="☕ Café en Grano & Especialidad">
                            {supplies
                              .filter((s) => s.category === 'cafe_grano')
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} (${s.unitCost.toFixed(2)} / {s.unit}) — Stock: {s.currentStock} {s.unit}
                                </option>
                              ))}
                          </optgroup>

                          <optgroup label="🥛 Lácteos & Bebidas">
                            {supplies
                              .filter((s) => s.category === 'lacteos')
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} (${s.unitCost.toFixed(2)} / {s.unit}) — Stock: {s.currentStock} {s.unit}
                                </option>
                              ))}
                          </optgroup>

                          <optgroup label="🫙 Jarabes & Endulzantes">
                            {supplies
                              .filter((s) => s.category === 'jarabes')
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} (${s.unitCost.toFixed(2)} / {s.unit}) — Stock: {s.currentStock} {s.unit}
                                </option>
                              ))}
                          </optgroup>

                          <optgroup label="🥖 Panadería & Insumos Preparación">
                            {supplies
                              .filter((s) => s.category === 'panaderia_insumos')
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} (${s.unitCost.toFixed(2)} / {s.unit}) — Stock: {s.currentStock} {s.unit}
                                </option>
                              ))}
                          </optgroup>

                          <optgroup label="📦 Desechables & Empaques">
                            {supplies
                              .filter((s) => s.category === 'desechables')
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} (${s.unitCost.toFixed(2)} / {s.unit}) — Stock: {s.currentStock} {s.unit}
                                </option>
                              ))}
                          </optgroup>

                          <optgroup label="✨ Otros Insumos">
                            {supplies
                              .filter((s) => s.category === 'otros')
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} (${s.unitCost.toFixed(2)} / {s.unit})
                                </option>
                              ))}
                          </optgroup>

                          <option value="custom">-- ✏️ Otro insumo (manual / no registrado) --</option>
                        </select>
                      </div>

                      {/* If picked from warehouse */}
                      {!isCustomIngredient && selectedSupply && (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          
                          {/* Portion Amount */}
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-semibold text-amm-roast mb-1">
                              Cantidad / Porción:
                            </label>
                            <input
                              type="number"
                              step="any"
                              required
                              placeholder="Ej: 18 o 220"
                              value={inputAmount}
                              onChange={(e) => setInputAmount(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EAE6DF] bg-white font-bold text-amm-espresso focus:outline-none focus:border-amm-mauve"
                            />
                          </div>

                          {/* Unit Selector */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-amm-roast mb-1">
                              Unidad:
                            </label>
                            <select
                              value={selectedUnit}
                              onChange={(e) => setSelectedUnit(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#EAE6DF] bg-white font-medium text-amm-espresso focus:outline-none"
                            >
                              {getAvailableUnitsForSupply(selectedSupply).map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Live Cost Output */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-amm-roast mb-1">
                              Costo Calculado:
                            </label>
                            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE6DF] font-serif font-black text-xs text-amm-espresso flex items-center justify-between">
                              <span>${calculatedCost.toFixed(2)}</span>
                              <span className="text-[10px] font-sans font-normal text-amm-roast">MXN</span>
                            </div>
                          </div>

                          {/* Submit button */}
                          <div className="sm:col-span-2">
                            <button
                              type="submit"
                              disabled={!inputAmount || parseFloat(inputAmount) <= 0}
                              className="w-full py-2 px-3 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark disabled:opacity-40 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Añadir</span>
                            </button>
                          </div>

                        </div>
                      )}

                      {/* If manual custom ingredient */}
                      {isCustomIngredient && (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-semibold text-amm-roast mb-1">
                              Nombre del Insumo:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: Canela en rama, almendras..."
                              value={customIngName}
                              onChange={(e) => setCustomIngName(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EAE6DF] bg-white"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-amm-roast mb-1">
                              Porción:
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 1 pza, 10g"
                              value={customIngQty}
                              onChange={(e) => setCustomIngQty(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EAE6DF] bg-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-semibold text-amm-roast mb-1">
                              Costo ($):
                            </label>
                            <input
                              type="number"
                              step="any"
                              required
                              placeholder="0.00"
                              value={customIngCost}
                              onChange={(e) => setCustomIngCost(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EAE6DF] bg-white font-bold"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <button
                              type="submit"
                              className="w-full py-2 px-3 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Añadir</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </form>
                  </div>

                  {/* Packaging & Waste inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
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
                      <span className="text-[10px] text-amm-roast block">Vaso, tapa, servilleta o bolsa</span>
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
                      <span className="text-[10px] text-amm-roast block">Purga de tolva, residuo de leche</span>
                    </div>
                  </div>

                  {/* Total Cost Strip */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-amm-espresso uppercase tracking-wider text-[11px] block">
                        Costo Total Unitario de Insumos:
                      </span>
                      <span className="text-[10px] text-amm-roast">
                        Insumos (${rawIngredientsCost.toFixed(2)}) + Merma (${wasteCost.toFixed(2)}) + Empaque (${packagingCost.toFixed(2)})
                      </span>
                    </div>
                    <span className="font-serif font-black text-xl text-amm-mauve-dark">
                      ${totalCost.toFixed(2)} MXN
                    </span>
                  </div>

                </div>
              </div>

              {/* Right Column: Simulator, Margins & 1-Click Sync to Catalog (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE6DF] p-6 space-y-5 shadow-2xs">
                
                <div className="flex items-center gap-2 pb-2 border-b border-[#F2ECE4]">
                  <Sparkles className="w-4 h-4 text-amm-mauve" />
                  <h2 className="font-serif font-bold text-base text-amm-espresso">
                    Simulador & Propuesta de Precio
                  </h2>
                </div>

                {/* Margin Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amm-roast font-medium">Margen bruto deseado:</span>
                    <span className="font-bold text-amm-espresso bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EAE6DF]">
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
                  <div className="flex justify-between text-[10px] text-amm-roast font-mono">
                    <span>40% (Bajo)</span>
                    <span>65-70% (Óptimo Café)</span>
                    <span>85% (Premium)</span>
                  </div>
                </div>

                {/* Comparison Card: Catalog vs Simulator */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-center">
                    <span className="text-[11px] text-amm-roast block">Catálogo Actual</span>
                    <div className="font-serif font-black text-xl text-amm-espresso my-1">
                      ${currentCatalogPrice.toFixed(0)}
                    </div>
                    <span className="text-[10px] text-amm-roast block">
                      Margen: {currentMargin.toFixed(0)}%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#EDFDF3] border border-[#86CCA0]/60 text-center">
                    <span className="text-[11px] font-semibold text-emerald-900 block">Sugerido Ammm</span>
                    <div className="font-serif font-black text-xl text-emerald-900 my-1">
                      ${suggestedPrice}
                    </div>
                    <span className="text-[10px] text-emerald-800 block">
                      +${unitProfitSuggested.toFixed(2)} utilidad
                    </span>
                  </div>
                </div>

                {/* Summary Info */}
                <div className="p-3 rounded-xl bg-[#FCFBF9] border border-[#EAE6DF] text-[11px] text-amm-roast space-y-1.5">
                  <div className="flex justify-between">
                    <span>Costo de insumos a registrar:</span>
                    <strong className="text-amm-espresso">${totalCost.toFixed(2)} MXN</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio de venta final a registrar:</span>
                    <strong className="text-emerald-900 font-bold">${suggestedPrice} MXN</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Margen resultante:</span>
                    <strong className="text-amm-mauve-dark font-bold">{targetMargin}%</strong>
                  </div>
                </div>

                {/* Button: Apply & Sync to Catalog */}
                <button
                  onClick={handleApplySuggestedPriceToMenu}
                  className="w-full py-3.5 px-4 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-soft hover:shadow-md"
                >
                  <span>Actualizar Catálogo & Menú POS (${suggestedPrice} MXN)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-[10px] text-amm-roast text-center">
                  Al añadir o modificar ingredientes, el costo y precio se sincronizan automáticamente con tu catálogo.
                </p>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#EAE6DF] p-8 text-center text-xs text-amm-roast">
              No hay productos registrados en el catálogo. Ve a <strong>Catálogo & Menú</strong> para registrar productos.
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
