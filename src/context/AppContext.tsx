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

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  collaboratorName: string;
  setCollaboratorName: (name: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

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

  // State loaded from localStorage or mockData
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [activeShift, setActiveShift] = useState<CashShift | null>(INITIAL_ACTIVE_SHIFT);
  const [supplies, setSupplies] = useState<SupplyItem[]>(INITIAL_SUPPLIES);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(INITIAL_SUPPLY_REQUESTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [recipes, setRecipes] = useState<PricingRecipe[]>(INITIAL_RECIPES);

  // Load from localStorage on mount
  useEffect(() => {
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
    } catch {
      // LocalStorage error fallback
    }
  }, []);

  // Save changes to localStorage
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
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleProductStock = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  // Cart Actions
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // Check if identical item exists (same product id, same modifiers, same notes)
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
    const costTotal = cart.reduce((sum, item) => sum + (item.product.cost * item.quantity), 0);
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

    // Update active cash shift
    if (activeShift && activeShift.status === 'abierta') {
      setActiveShift((prev) => {
        if (!prev) return null;
        const newCashSales = paymentMethod === 'efectivo' ? prev.cashSales + finalTotal : prev.cashSales;
        const newCardSales = paymentMethod === 'tarjeta' ? prev.cardSales + finalTotal : prev.cardSales;
        const newTransferSales = paymentMethod === 'transferencia' ? prev.transferSales + finalTotal : prev.transferSales;
        const expectedCash = prev.initialCash + newCashSales + prev.cashIn - prev.cashOut;

        return {
          ...prev,
          cashSales: newCashSales,
          cardSales: newCardSales,
          transferSales: newTransferSales,
          expectedCash,
        };
      });
    }

    // Decrement direct stock if applicable
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatches = cart.filter((ci) => ci.productId === prod.id);
        if (cartMatches.length > 0 && prod.isDirectStock && prod.stockQuantity !== undefined) {
          const qtyBought = cartMatches.reduce((s, ci) => s + ci.quantity, 0);
          const newQty = Math.max(0, prod.stockQuantity - qtyBought);
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

      return {
        ...prev,
        cashIn: newCashIn,
        cashOut: newCashOut,
        movements: [movement, ...prev.movements],
        expectedCash,
      };
    });
  };

  const closeShift = (actualCash: number, notes?: string) => {
    if (!activeShift || activeShift.status !== 'abierta') return;

    const difference = actualCash - activeShift.expectedCash;

    setActiveShift((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        closedAt: new Date().toISOString(),
        actualCash,
        difference,
        status: 'cerrada',
        notes,
      };
    });
  };

  // Supplies
  const updateSupplyStock = (id: string, newStock: number) => {
    setSupplies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, currentStock: newStock, lastRestocked: new Date().toISOString().split('T')[0] } : s))
    );
  };

  const addSupply = (supply: Omit<SupplyItem, 'id'>) => {
    const newItem: SupplyItem = {
      ...supply,
      id: `sup-${Date.now()}`,
    };
    setSupplies((prev) => [...prev, newItem]);
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
  };

  const updateSupplyRequestStatus = (id: string, status: 'comprado' | 'cancelado') => {
    setSupplyRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  // Expenses
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Recipes / Pricing
  const addRecipe = (recipe: Omit<PricingRecipe, 'id'>) => {
    const newRec: PricingRecipe = {
      ...recipe,
      id: `rec-${Date.now()}`,
    };
    setRecipes((prev) => [...prev, newRec]);
  };

  const updateRecipe = (id: string, updated: Partial<PricingRecipe>) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
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
