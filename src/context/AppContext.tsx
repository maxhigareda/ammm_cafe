'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Product,
  CartItem,
  Sale,
  CashShift,
  CashMovement,
  SupplyItem,
  SupplyRequest,
  Expense,
  PricingRecipe,
  PaymentMethod,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIES,
  INITIAL_SUPPLY_REQUESTS,
  INITIAL_EXPENSES,
  INITIAL_RECIPES,
  INITIAL_ACTIVE_SHIFT,
} from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  collaboratorName: string;
  setCollaboratorName: (name: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSupabaseLive: boolean;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStock: (id: string) => void;

  // Cart & POS
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (id: string, delta: number) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Sales
  sales: Sale[];
  completeSale: (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    discount?: number
  ) => Sale;

  // Cash Shift
  activeShift: CashShift | null;
  openShift: (initialCash: number, collaborator: string) => void;
  addCashMovement: (type: 'entrada' | 'salida', amount: number, reason: string) => void;
  closeShift: (actualCash: number, notes?: string) => void;

  // Supplies & Inventory
  supplies: SupplyItem[];
  updateSupplyStock: (id: string, newStock: number) => void;
  addSupply: (supply: Omit<SupplyItem, 'id'>) => void;

  // Supply Requests
  supplyRequests: SupplyRequest[];
  createSupplyRequest: (supplyName: string, notes: string, urgency: 'alta' | 'media' | 'baja', quantityNeeded?: string) => void;
  updateSupplyRequestStatus: (id: string, status: 'comprado' | 'cancelado') => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Pricing / Simulator
  recipes: PricingRecipe[];
  addRecipe: (recipe: Omit<PricingRecipe, 'id'>) => void;
  updateRecipe: (id: string, updated: Partial<PricingRecipe>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('admin');
  const [collaboratorName, setCollaboratorName] = useState<string>('Sofía Méndez');
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);

  // State loaded from localStorage or mockData
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [activeShift, setActiveShift] = useState<CashShift | null>(INITIAL_ACTIVE_SHIFT);
  const [supplies, setSupplies] = useState<SupplyItem[]>(INITIAL_SUPPLIES);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(INITIAL_SUPPLY_REQUESTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [recipes, setRecipes] = useState<PricingRecipe[]>(INITIAL_RECIPES);

  // Sync from Supabase on mount (or fallback to localStorage)
  useEffect(() => {
    // 1. Initial load from LocalStorage first for instant rendering
    try {
      const savedProducts = localStorage.getItem('amm_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedSales = localStorage.getItem('amm_sales');
      if (savedSales) setSales(JSON.parse(savedSales));

      const savedShift = localStorage.getItem('amm_shift');
      if (savedShift) setActiveShift(JSON.parse(savedShift));

      const savedSupplies = localStorage.getItem('amm_supplies');
      if (savedSupplies) setSupplies(JSON.parse(savedSupplies));

      const savedRequests = localStorage.getItem('amm_requests');
      if (savedRequests) setSupplyRequests(JSON.parse(savedRequests));

      const savedExpenses = localStorage.getItem('amm_expenses');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedRecipes = localStorage.getItem('amm_recipes');
      if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
    } catch {}

    // 2. If Supabase credentials are configured, fetch live tables
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const fetchSupabaseData = async () => {
        try {
          const { data: prods, error: pErr } = await client.from('products').select('*');
          if (!pErr && prods && prods.length > 0) {
            setIsSupabaseLive(true);
            setProducts(
              prods.map((p: any) => ({
                id: p.id,
                name: p.name,
                description: p.description || '',
                category: p.category,
                price: Number(p.price),
                cost: Number(p.cost),
                imageUrl: p.image_url,
                inStock: p.in_stock,
                stockQuantity: p.stock_quantity,
                isDirectStock: p.is_direct_stock,
                modifierGroups: p.modifier_groups || [],
                recipeNotes: p.recipe_notes,
              }))
            );
          }

          const { data: sls, error: sErr } = await client
            .from('sales')
            .select('*')
            .order('date', { ascending: false });
          if (!sErr && sls && sls.length > 0) {
            setSales(
              sls.map((s: any) => ({
                id: s.id,
                ticketNumber: s.ticket_number,
                date: s.date,
                items: s.items,
                subtotal: Number(s.subtotal),
                discount: Number(s.discount),
                total: Number(s.total),
                costTotal: Number(s.cost_total),
                profit: Number(s.profit),
                paymentMethod: s.payment_method,
                amountPaid: Number(s.amount_paid),
                change: Number(s.change),
                collaboratorName: s.collaborator_name,
                status: s.status,
              }))
            );
          }

          const { data: sups, error: supErr } = await client.from('supplies').select('*');
          if (!supErr && sups && sups.length > 0) {
            setSupplies(
              sups.map((s: any) => ({
                id: s.id,
                name: s.name,
                unit: s.unit,
                currentStock: Number(s.current_stock),
                minStock: Number(s.min_stock),
                unitCost: Number(s.unit_cost),
                category: s.category,
                lastRestocked: s.last_restocked,
              }))
            );
          }

          const { data: reqs, error: rErr } = await client
            .from('supply_requests')
            .select('*')
            .order('requested_at', { ascending: false });
          if (!rErr && reqs && reqs.length > 0) {
            setSupplyRequests(
              reqs.map((r: any) => ({
                id: r.id,
                supplyName: r.supply_name,
                quantityNeeded: r.quantity_needed,
                notes: r.notes,
                urgency: r.urgency,
                requestedBy: r.requested_by,
                requestedAt: r.requested_at,
                status: r.status,
              }))
            );
          }

          const { data: exps, error: expErr } = await client
            .from('expenses')
            .select('*')
            .order('date', { ascending: false });
          if (!expErr && exps && exps.length > 0) {
            setExpenses(
              exps.map((e: any) => ({
                id: e.id,
                description: e.description,
                category: e.category,
                amount: Number(e.amount),
                type: e.type,
                date: e.date,
                paidVia: e.paid_via,
                notes: e.notes,
              }))
            );
          }

          const { data: recs, error: recErr } = await client.from('pricing_recipes').select('*');
          if (!recErr && recs && recs.length > 0) {
            setRecipes(
              recs.map((r: any) => ({
                id: r.id,
                productName: r.product_name,
                category: r.category,
                ingredients: r.ingredients,
                packagingCost: Number(r.packaging_cost),
                wastePercentage: Number(r.waste_percentage),
                currentSellingPrice: Number(r.current_selling_price),
                targetMarginPercentage: Number(r.target_margin_percentage),
              }))
            );
          }

          const { data: shfts, error: shftErr } = await client
            .from('cash_shifts')
            .select('*')
            .eq('status', 'abierta')
            .order('opened_at', { ascending: false })
            .limit(1);
          if (!shftErr && shfts && shfts.length > 0) {
            const sh = shfts[0];
            setActiveShift({
              id: sh.id,
              openedAt: sh.opened_at,
              closedAt: sh.closed_at,
              initialCash: Number(sh.initial_cash),
              cashSales: Number(sh.cash_sales),
              cardSales: Number(sh.card_sales),
              transferSales: Number(sh.transfer_sales),
              cashIn: Number(sh.cash_in),
              cashOut: Number(sh.cash_out),
              movements: sh.movements || [],
              expectedCash: Number(sh.expected_cash),
              actualCash: sh.actual_cash ? Number(sh.actual_cash) : undefined,
              difference: sh.difference ? Number(sh.difference) : undefined,
              collaborator: sh.collaborator,
              status: sh.status,
              notes: sh.notes,
            });
          }
        } catch {
          // Graceful fallback to local data
        }
      };
      fetchSupabaseData();
    }
  }, []);

  // Save changes to localStorage as offline safety layer
  useEffect(() => {
    try {
      localStorage.setItem('amm_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('amm_sales', JSON.stringify(sales));
    } catch {}
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem('amm_shift', JSON.stringify(activeShift));
    } catch {}
  }, [activeShift]);

  useEffect(() => {
    try {
      localStorage.setItem('amm_supplies', JSON.stringify(supplies));
    } catch {}
  }, [supplies]);

  useEffect(() => {
    try {
      localStorage.setItem('amm_requests', JSON.stringify(supplyRequests));
    } catch {}
  }, [supplyRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('amm_expenses', JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('amm_recipes', JSON.stringify(recipes));
    } catch {}
  }, [recipes]);

  // Product Actions
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [product, ...prev]);

    if (supabase) {
      supabase.from('products').insert({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        cost: product.cost,
        image_url: product.imageUrl,
        in_stock: product.inStock,
        stock_quantity: product.stockQuantity,
        is_direct_stock: product.isDirectStock,
        modifier_groups: product.modifierGroups || [],
      }).then();
    }
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );

    if (supabase) {
      const dbPayload: any = {};
      if (updated.name !== undefined) dbPayload.name = updated.name;
      if (updated.price !== undefined) dbPayload.price = updated.price;
      if (updated.cost !== undefined) dbPayload.cost = updated.cost;
      if (updated.inStock !== undefined) dbPayload.in_stock = updated.inStock;
      if (updated.stockQuantity !== undefined) dbPayload.stock_quantity = updated.stockQuantity;
      if (updated.isDirectStock !== undefined) dbPayload.is_direct_stock = updated.isDirectStock;
      if (updated.category !== undefined) dbPayload.category = updated.category;
      if (updated.imageUrl !== undefined) dbPayload.image_url = updated.imageUrl;
      if (updated.description !== undefined) dbPayload.description = updated.description;

      supabase.from('products').update(dbPayload).eq('id', id).then();
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (supabase) {
      supabase.from('products').delete().eq('id', id).then();
    }
  };

  const toggleProductStock = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = !p.inStock;
          if (supabase) {
            supabase.from('products').update({ in_stock: newStatus }).eq('id', id).then();
          }
          return { ...p, inStock: newStatus };
        }
        return p;
      })
    );
  };

  // Cart Actions
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.productId === item.productId &&
          JSON.stringify(ci.selectedModifiers) === JSON.stringify(item.selectedModifiers) &&
          ci.notes === item.notes
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const current = updated[existingIdx];
        const newQty = current.quantity + item.quantity;
        const unitPrice = current.itemTotal / current.quantity;
        updated[existingIdx] = {
          ...current,
          quantity: newQty,
          itemTotal: unitPrice * newQty,
        };
        return updated;
      }
      return [...prev, item];
    });
  };

  const updateCartItemQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.itemTotal / item.quantity;
            return {
              ...item,
              quantity: newQty,
              itemTotal: unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Complete Sale
  const completeSale = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    discount = 0
  ): Sale => {
    const subtotal = cartTotal;
    const finalTotal = Math.max(0, subtotal - discount);
    const change = paymentMethod === 'efectivo' ? Math.max(0, amountPaid - finalTotal) : 0;
    const costTotal = cart.reduce((sum, item) => sum + item.product.cost * item.quantity, 0);
    const profit = finalTotal - costTotal;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      ticketNumber: sales.length + 101,
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      discount,
      total: finalTotal,
      costTotal,
      profit,
      paymentMethod,
      amountPaid,
      change,
      collaboratorName,
      status: 'completada',
    };

    setSales((prev) => [newSale, ...prev]);

    // Async push to Supabase
    if (supabase) {
      supabase.from('sales').insert({
        id: newSale.id,
        ticket_number: newSale.ticketNumber,
        date: newSale.date,
        items: newSale.items,
        subtotal: newSale.subtotal,
        discount: newSale.discount,
        total: newSale.total,
        cost_total: newSale.costTotal,
        profit: newSale.profit,
        payment_method: newSale.paymentMethod,
        amount_paid: newSale.amountPaid,
        change: newSale.change,
        collaborator_name: newSale.collaboratorName,
        status: newSale.status,
      }).then();
    }

    // Update active cash shift
    if (activeShift && activeShift.status === 'abierta') {
      setActiveShift((prev) => {
        if (!prev) return null;
        const newCashSales = paymentMethod === 'efectivo' ? prev.cashSales + finalTotal : prev.cashSales;
        const newCardSales = paymentMethod === 'tarjeta' ? prev.cardSales + finalTotal : prev.cardSales;
        const newTransferSales = paymentMethod === 'transferencia' ? prev.transferSales + finalTotal : prev.transferSales;
        const expectedCash = prev.initialCash + newCashSales + prev.cashIn - prev.cashOut;

        const updatedShift = {
          ...prev,
          cashSales: newCashSales,
          cardSales: newCardSales,
          transferSales: newTransferSales,
          expectedCash,
        };

        if (supabase) {
          supabase.from('cash_shifts').update({
            cash_sales: newCashSales,
            card_sales: newCardSales,
            transfer_sales: newTransferSales,
            expected_cash: expectedCash,
          }).eq('id', prev.id).then();
        }

        return updatedShift;
      });
    }

    // Decrement direct stock if applicable
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatches = cart.filter((ci) => ci.productId === prod.id);
        if (cartMatches.length > 0 && prod.isDirectStock && prod.stockQuantity !== undefined) {
          const qtyBought = cartMatches.reduce((s, ci) => s + ci.quantity, 0);
          const newQty = Math.max(0, prod.stockQuantity - qtyBought);
          
          if (supabase) {
            supabase.from('products').update({
              stock_quantity: newQty,
              in_stock: newQty > 0,
            }).eq('id', prod.id).then();
          }

          return {
            ...prod,
            stockQuantity: newQty,
            inStock: newQty > 0,
          };
        }
        return prod;
      })
    );

    clearCart();
    return newSale;
  };

  // Cash Shift Operations
  const openShift = (initialCash: number, collaborator: string) => {
    const newShift: CashShift = {
      id: `shift-${Date.now()}`,
      openedAt: new Date().toISOString(),
      initialCash,
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      cashIn: 0,
      cashOut: 0,
      movements: [],
      expectedCash: initialCash,
      collaborator,
      status: 'abierta',
    };
    setActiveShift(newShift);

    if (supabase) {
      supabase.from('cash_shifts').insert({
        id: newShift.id,
        opened_at: newShift.openedAt,
        initial_cash: newShift.initialCash,
        cash_sales: 0,
        card_sales: 0,
        transfer_sales: 0,
        cash_in: 0,
        cash_out: 0,
        movements: [],
        expected_cash: newShift.expectedCash,
        collaborator: newShift.collaborator,
        status: 'abierta',
      }).then();
    }
  };

  const addCashMovement = (type: 'entrada' | 'salida', amount: number, reason: string) => {
    if (!activeShift || activeShift.status !== 'abierta') return;

    const movement: CashMovement = {
      id: `mov-${Date.now()}`,
      type,
      amount,
      reason,
      timestamp: new Date().toISOString(),
    };

    setActiveShift((prev) => {
      if (!prev) return null;
      const newCashIn = type === 'entrada' ? prev.cashIn + amount : prev.cashIn;
      const newCashOut = type === 'salida' ? prev.cashOut + amount : prev.cashOut;
      const expectedCash = prev.initialCash + prev.cashSales + newCashIn - newCashOut;
      const newMovements = [movement, ...prev.movements];

      if (supabase) {
        supabase.from('cash_shifts').update({
          cash_in: newCashIn,
          cash_out: newCashOut,
          movements: newMovements,
          expected_cash: expectedCash,
        }).eq('id', prev.id).then();
      }

      return {
        ...prev,
        cashIn: newCashIn,
        cashOut: newCashOut,
        movements: newMovements,
        expectedCash,
      };
    });
  };

  const closeShift = (actualCash: number, notes?: string) => {
    if (!activeShift || activeShift.status !== 'abierta') return;

    const difference = actualCash - activeShift.expectedCash;

    setActiveShift((prev) => {
      if (!prev) return null;
      const closed = {
        ...prev,
        closedAt: new Date().toISOString(),
        actualCash,
        difference,
        status: 'cerrada' as const,
        notes,
      };

      if (supabase) {
        supabase.from('cash_shifts').update({
          closed_at: closed.closedAt,
          actual_cash: closed.actualCash,
          difference: closed.difference,
          status: 'cerrada',
          notes: closed.notes,
        }).eq('id', prev.id).then();
      }

      return closed;
    });
  };

  // Supplies
  const updateSupplyStock = (id: string, newStock: number) => {
    setSupplies((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const today = new Date().toISOString().split('T')[0];
          if (supabase) {
            supabase.from('supplies').update({
              current_stock: newStock,
              last_restocked: today,
            }).eq('id', id).then();
          }
          return { ...s, currentStock: newStock, lastRestocked: today };
        }
        return s;
      })
    );
  };

  const addSupply = (supply: Omit<SupplyItem, 'id'>) => {
    const newItem: SupplyItem = {
      ...supply,
      id: `sup-${Date.now()}`,
    };
    setSupplies((prev) => [...prev, newItem]);

    if (supabase) {
      supabase.from('supplies').insert({
        id: newItem.id,
        name: newItem.name,
        unit: newItem.unit,
        current_stock: newItem.currentStock,
        min_stock: newItem.minStock,
        unit_cost: newItem.unitCost,
        category: newItem.category,
      }).then();
    }
  };

  // Supply Requests
  const createSupplyRequest = (
    supplyName: string,
    notes: string,
    urgency: 'alta' | 'media' | 'baja',
    quantityNeeded?: string
  ) => {
    const newReq: SupplyRequest = {
      id: `req-${Date.now()}`,
      supplyName,
      quantityNeeded,
      notes,
      urgency,
      requestedBy: collaboratorName,
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'pendiente',
    };
    setSupplyRequests((prev) => [newReq, ...prev]);

    if (supabase) {
      supabase.from('supply_requests').insert({
        id: newReq.id,
        supply_name: newReq.supplyName,
        quantity_needed: newReq.quantityNeeded,
        notes: newReq.notes,
        urgency: newReq.urgency,
        requested_by: newReq.requestedBy,
        requested_at: newReq.requestedAt,
        status: newReq.status,
      }).then();
    }
  };

  const updateSupplyRequestStatus = (id: string, status: 'comprado' | 'cancelado') => {
    setSupplyRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (supabase) {
            supabase.from('supply_requests').update({ status }).eq('id', id).then();
          }
          return { ...r, status };
        }
        return r;
      })
    );
  };

  // Expenses
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);

    if (supabase) {
      supabase.from('expenses').insert({
        id: newExp.id,
        description: newExp.description,
        category: newExp.category,
        amount: newExp.amount,
        type: newExp.type,
        date: newExp.date,
        paid_via: newExp.paidVia,
        notes: newExp.notes,
      }).then();
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (supabase) {
      supabase.from('expenses').delete().eq('id', id).then();
    }
  };

  // Recipes / Pricing
  const addRecipe = (recipe: Omit<PricingRecipe, 'id'>) => {
    const newRec: PricingRecipe = {
      ...recipe,
      id: `rec-${Date.now()}`,
    };
    setRecipes((prev) => [...prev, newRec]);

    if (supabase) {
      supabase.from('pricing_recipes').insert({
        id: newRec.id,
        product_name: newRec.productName,
        category: newRec.category,
        ingredients: newRec.ingredients,
        packaging_cost: newRec.packagingCost,
        waste_percentage: newRec.wastePercentage,
        current_selling_price: newRec.currentSellingPrice,
        target_margin_percentage: newRec.targetMarginPercentage,
      }).then();
    }
  };

  const updateRecipe = (id: string, updated: Partial<PricingRecipe>) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = { ...r, ...updated };
          if (supabase) {
            const dbPayload: any = {};
            if (updated.productName !== undefined) dbPayload.product_name = updated.productName;
            if (updated.category !== undefined) dbPayload.category = updated.category;
            if (updated.ingredients !== undefined) dbPayload.ingredients = updated.ingredients;
            if (updated.packagingCost !== undefined) dbPayload.packaging_cost = updated.packagingCost;
            if (updated.wastePercentage !== undefined) dbPayload.waste_percentage = updated.wastePercentage;
            if (updated.currentSellingPrice !== undefined) dbPayload.current_selling_price = updated.currentSellingPrice;
            if (updated.targetMarginPercentage !== undefined) dbPayload.target_margin_percentage = updated.targetMarginPercentage;

            supabase.from('pricing_recipes').update(dbPayload).eq('id', id).then();
          }
          return next;
        }
        return r;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        collaboratorName,
        setCollaboratorName,
        activeTab,
        setActiveTab,
        isSupabaseLive,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        cart,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        cartTotal,
        cartCount,
        sales,
        completeSale,
        activeShift,
        openShift,
        addCashMovement,
        closeShift,
        supplies,
        updateSupplyStock,
        addSupply,
        supplyRequests,
        createSupplyRequest,
        updateSupplyRequestStatus,
        expenses,
        addExpense,
        deleteExpense,
        recipes,
        addRecipe,
        updateRecipe,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
