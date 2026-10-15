'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Category, Product, CartItem, Sale } from '@/types';
import {
  Search,
  Coffee,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  User,
  ChevronDown,
  X,
  LockOpen,
  CheckCircle2,
} from 'lucide-react';
import ProductModifierModal from './ProductModifierModal';
import CheckoutModal from './CheckoutModal';
import ReceiptModal from './ReceiptModal';
import CollaboratorModal from './CollaboratorModal';
import { getProductSizeLabel } from '@/lib/productUtils';

export default function PosView() {
  const {
    products,
    cart,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    cartTotal,
    cartCount,
    collaboratorName,
    setCollaboratorName,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<Category>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProductForModifier, setActiveProductForModifier] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [isMobileCartDrawerOpen, setIsMobileCartDrawerOpen] = useState(false);
  const [drawerAlert, setDrawerAlert] = useState<string | null>(null);

  const categories: { id: Category; label: string }[] = [
    { id: 'todos', label: 'Todo el Menú' },
    { id: 'cafe', label: 'Café & Especialidad' },
    { id: 'panaderia', label: 'Panadería' },
    { id: 'bocados', label: 'Bocados' },
    { id: 'bebidas_frias', label: 'Bebidas Frías' },
    { id: 'postres', label: 'Postres' },
    { id: 'paquetes', label: 'Combos' },
  ];

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'todos' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product: Product) => {
    if (!product.inStock) return;

    if (product.modifierGroups && product.modifierGroups.length > 0) {
      setActiveProductForModifier(product);
    } else {
      const item: CartItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        productId: product.id,
        product,
        quantity: 1,
        selectedModifiers: {},
        itemTotal: product.price,
      };
      addToCart(item);
    }
  };

  const handleManualOpenDrawer = () => {
    // Triggers cash drawer pulse / print
    try {
      // In web, print dialog triggers drawer kick via RJ11 printer driver
      window.print();
    } catch {}

    setDrawerAlert('¡Cajón de dinero botado correctamente!');
    setTimeout(() => setDrawerAlert(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100dvh-4.25rem)] md:h-[100dvh] overflow-hidden bg-[#FAF8F5] relative">
      
      {/* Toast Alert for Drawer Kick */}
      {drawerAlert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amm-espresso text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-card flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <LockOpen className="w-4 h-4 text-emerald-400" />
          <span>{drawerAlert}</span>
        </div>
      )}

      {/* Main Catalog Section (Left / Center Pane) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header: Title, Collaborator Selector, Search, and Category tabs (PINNED - DOES NOT SCROLL) */}
        <div className="p-4 sm:p-6 lg:p-7 pb-3 bg-[#FAF8F5] border-b border-[#EAE6DF]/70 shrink-0 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-amm-espresso tracking-tight">
                  Punto de Venta
                </h1>

                {/* Collaborator Selector Pill Button */}
                <button
                  onClick={() => setIsCollaboratorModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[#EAE6DF] bg-white text-amm-espresso hover:bg-[#FAF8F5] hover:border-amm-mauve/60 text-xs font-medium transition-all shadow-2xs group"
                  title="Cambiar colaborador en turno"
                >
                  <User className="w-3.5 h-3.5 text-amm-mauve-dark" />
                  <span className="text-amm-roast text-[11px] hidden sm:inline">Atiende:</span>
                  <span className="font-bold text-amm-espresso group-hover:text-amm-mauve-dark transition-colors">
                    {collaboratorName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-amm-roast/60 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>

              <p className="text-[11px] text-amm-roast mt-0.5 hidden sm:block">
                Selecciona artículos del menú para añadirlos a la orden.
              </p>
            </div>

            {/* Quiet Search Input + Mobile Cart trigger */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-amm-roast/60" />
                <input
                  type="text"
                  placeholder="Buscar en el menú..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white border border-[#EAE6DF] text-amm-espresso placeholder:text-amm-roast/50 focus:outline-none focus:border-amm-mauve transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amm-roast hover:text-amm-espresso"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Mobile Cart Button in Header */}
              <button
                onClick={() => setIsMobileCartDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amm-mauve text-white text-xs font-bold shadow-soft shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{cartCount}</span>
                <span className="hidden xs:inline">• ${cartTotal.toFixed(0)}</span>
              </button>
            </div>
          </div>

          {/* Minimal Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#EAE6DF]/60">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                    isSelected
                      ? 'border-amm-mauve text-amm-mauve-dark font-bold'
                      : 'border-transparent text-amm-roast hover:text-amm-espresso'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Independent Scrollable Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 pt-4 pb-28 lg:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => {
              const isLowStock = prod.isDirectStock && prod.stockQuantity !== undefined && prod.stockQuantity <= 4;
              const isOutOfStock = !prod.inStock || (prod.isDirectStock && prod.stockQuantity === 0);

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && handleProductClick(prod)}
                  className={`group bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden flex flex-col justify-between text-left cursor-pointer transition-all hover:border-amm-mauve/60 active:scale-[0.99] ${
                    isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-xs'
                  }`}
                >
                  {/* Photo */}
                  <div className="relative aspect-[4/3] w-full bg-[#F5F2EB] overflow-hidden">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-md">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-semibold text-xs sm:text-sm text-amm-espresso leading-snug line-clamp-2 min-h-[2.5rem] flex-1"
                          title={prod.name}
                        >
                          {prod.name}
                        </h3>
                        <span className="font-serif font-black text-xs sm:text-sm text-amm-espresso shrink-0 pt-0.5">
                          ${prod.price.toFixed(0)}
                        </span>
                      </div>

                      {/* Distinctive Size underneath the title */}
                      {(() => {
                        const sizeLabel = getProductSizeLabel(prod);
                        return sizeLabel ? (
                          <div className="mt-1">
                            <span className="inline-flex items-center text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F2ECE4] text-amm-mauve-dark border border-[#EAE6DF]">
                              {sizeLabel}
                            </span>
                          </div>
                        ) : null;
                      })()}

                      <p className="text-[11px] text-amm-roast line-clamp-2 mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F5F2EB]">
                      {isLowStock && !isOutOfStock ? (
                        <span className="text-amber-700 font-medium">
                          • {prod.stockQuantity} disponibles
                        </span>
                      ) : (
                        <span className="text-amm-roast/70 capitalize">
                          {prod.category.replace('_', ' ')}
                        </span>
                      )}

                      <span className="text-amm-mauve-dark font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>Agregar</span>
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center space-y-2">
              <Coffee className="w-8 h-8 text-amm-roast/40 mx-auto" />
              <p className="font-serif text-sm font-medium text-amm-espresso">
                No se encontraron productos
              </p>
              <p className="text-xs text-amm-roast">
                Intenta con otra palabra clave o selecciona otra categoría.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Desktop & iPad Landscape Integrated Order Ledger (Right Column - ALWAYS PINNED / FIXED) */}
      <aside className="hidden lg:flex lg:w-96 shrink-0 bg-white border-l border-[#EAE6DF] flex-col h-full justify-between overflow-hidden">
        
        {/* Ledger Header */}
        <div className="p-5 pb-3.5 border-b border-[#F2ECE4] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-amm-espresso">
                Orden Actual
              </span>
              <span className="text-[11px] font-semibold text-amm-roast px-2 py-0.5 rounded-md bg-[#FAF8F5]">
                {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            {/* Clickable Collaborator Pill in Ledger */}
            <button
              onClick={() => setIsCollaboratorModalOpen(true)}
              className="text-[11px] text-amm-roast mt-1 flex items-center gap-1 hover:text-amm-espresso transition-colors text-left"
            >
              <span>Atiende:</span>
              <span className="font-bold text-amm-espresso underline decoration-dotted underline-offset-2">
                {collaboratorName}
              </span>
              <ChevronDown className="w-3 h-3 text-amm-roast/60" />
            </button>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-amm-roast hover:text-rose-600 transition-colors flex items-center gap-1 p-1 rounded"
              title="Vaciar orden"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Scrollable Items List */}
        <div className="p-5 flex-1 overflow-y-auto divide-y divide-[#F5F2EB] space-y-3">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-xs text-amm-espresso leading-snug">
                      {item.product.name}
                    </h4>

                    {(() => {
                      const sizeLabel = getProductSizeLabel(item.product);
                      return sizeLabel ? (
                        <span className="inline-block text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F2ECE4] text-amm-mauve-dark border border-[#EAE6DF] mt-0.5">
                          {sizeLabel}
                        </span>
                      ) : null;
                    })()}

                    {/* Modifiers List */}
                    {Object.entries(item.selectedModifiers).map(([group, opts]) =>
                      opts.map((opt) => (
                        <div key={opt.id} className="text-[10px] text-amm-roast mt-0.5">
                          + {opt.name} {opt.priceDelta > 0 && `(+$${opt.priceDelta})`}
                        </div>
                      ))
                    )}

                    {item.notes && (
                      <div className="text-[10px] italic text-amm-mauve-dark mt-0.5">
                        "{item.notes}"
                      </div>
                    )}
                  </div>

                  <span className="font-serif font-bold text-xs text-amm-espresso whitespace-nowrap">
                    ${item.itemTotal.toFixed(2)}
                  </span>
                </div>

                {/* Minimal Stepper */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[10px] text-amm-roast">
                    ${(item.itemTotal / item.quantity).toFixed(0)} c/u
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartItemQuantity(item.id, -1)}
                      className="w-5 h-5 rounded-md border border-[#EAE6DF] hover:bg-[#FAF8F5] flex items-center justify-center text-amm-roast transition-colors"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-4 text-center text-xs font-bold text-amm-espresso">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQuantity(item.id, 1)}
                      className="w-5 h-5 rounded-md border border-[#EAE6DF] hover:bg-[#FAF8F5] flex items-center justify-center text-amm-roast transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center space-y-2">
              <ShoppingBag className="w-6 h-6 text-amm-roast/30 mx-auto" />
              <p className="font-serif text-xs font-medium text-amm-espresso">
                Tu comanda está vacía
              </p>
              <p className="text-[11px] text-amm-roast/70">
                Toca cualquier producto del menú para comenzar la orden.
              </p>
            </div>
          )}
        </div>

        {/* Ledger Total & Action Footer (PINNED AT BOTTOM - NEVER SCROLLS AWAY) */}
        <div className="p-5 border-t border-[#F2ECE4] space-y-3.5 bg-[#FCFBF9] shrink-0">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-amm-roast">
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-[#F2ECE4]">
              <span className="font-medium text-sm text-amm-espresso">Total a Cobrar:</span>
              <span className="font-serif font-black text-2xl text-amm-espresso">
                ${cartTotal.toFixed(2)} <span className="text-xs font-sans font-normal text-amm-roast">MXN</span>
              </span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              cart.length > 0
                ? 'bg-amm-mauve hover:bg-amm-mauve-dark text-white shadow-soft active:scale-[0.99]'
                : 'bg-[#EDE7DE] text-amm-roast/60 cursor-not-allowed'
            }`}
          >
            <span>Cobrar Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Drawer Kick Button */}
          <button
            onClick={handleManualOpenDrawer}
            className="w-full py-1.5 text-center text-[10px] text-amm-roast hover:text-amm-espresso transition-colors flex items-center justify-center gap-1.5"
            title="Abrir cajón sin registrar venta"
          >
            <LockOpen className="w-3 h-3 text-amm-roast" />
            <span>Abrir Cajón Manualmente (Cambio)</span>
          </button>
        </div>

      </aside>

      {/* Mobile & iPad Portrait Sticky Floating Cart Bar (Appears when cart has items) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 px-4 border-t border-[#EAE6DF] shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
          <button
            onClick={() => setIsMobileCartDrawerOpen(true)}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-amm-mauve text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {cartCount}
            </div>
            <div>
              <span className="text-[10px] text-amm-roast uppercase tracking-wider block font-semibold leading-tight">
                Total Pedido
              </span>
              <span className="font-serif font-black text-base text-amm-espresso">
                ${cartTotal.toFixed(2)}{' '}
                <span className="text-[10px] font-sans font-normal text-amm-roast">MXN</span>
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileCartDrawerOpen(true)}
              className="px-3 py-2.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-semibold text-amm-espresso hover:bg-[#FAF8F5] transition-colors"
            >
              Ver Orden
            </button>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs shadow-soft flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Cobrar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-Over / Bottom-Sheet Cart Drawer */}
      {isMobileCartDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end">
          <div
            className="flex-1"
            onClick={() => setIsMobileCartDrawerOpen(false)}
          />

          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border-t border-[#EAE6DF] animate-in slide-in-from-bottom duration-300">
            {/* Drawer Header */}
            <div className="p-5 pb-3 border-b border-[#F2ECE4] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base text-amm-espresso">
                    Orden Actual
                  </span>
                  <span className="text-[11px] font-semibold text-amm-roast px-2 py-0.5 rounded-md bg-white border border-[#EAE6DF]">
                    {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileCartDrawerOpen(false);
                    setIsCollaboratorModalOpen(true);
                  }}
                  className="text-[11px] text-amm-roast mt-0.5 flex items-center gap-1"
                >
                  <span>Atiende:</span>
                  <span className="font-bold text-amm-espresso underline decoration-dotted">
                    {collaboratorName}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-rose-600 hover:text-rose-700 px-2 py-1 rounded"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={() => setIsMobileCartDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-amm-roast hover:text-amm-espresso hover:bg-[#F2ECE4]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Items in Drawer */}
            <div className="p-5 overflow-y-auto flex-1 divide-y divide-[#F5F2EB] space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-xs text-amm-espresso leading-snug">
                        {item.product.name}
                      </h4>

                      {(() => {
                        const sizeLabel = getProductSizeLabel(item.product);
                        return sizeLabel ? (
                          <span className="inline-block text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F2ECE4] text-amm-mauve-dark border border-[#EAE6DF] mt-0.5">
                            {sizeLabel}
                          </span>
                        ) : null;
                      })()}

                      {Object.entries(item.selectedModifiers).map(([group, opts]) =>
                        opts.map((opt) => (
                          <div key={opt.id} className="text-[10px] text-amm-roast mt-0.5">
                            + {opt.name} {opt.priceDelta > 0 && `(+$${opt.priceDelta})`}
                          </div>
                        ))
                      )}

                      {item.notes && (
                        <div className="text-[10px] italic text-amm-mauve-dark mt-0.5">
                          "{item.notes}"
                        </div>
                      )}
                    </div>

                    <span className="font-serif font-bold text-xs text-amm-espresso whitespace-nowrap">
                      ${item.itemTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] text-amm-roast">
                      ${(item.itemTotal / item.quantity).toFixed(0)} c/u
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItemQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-md border border-[#EAE6DF] hover:bg-[#FAF8F5] flex items-center justify-center text-amm-roast"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-amm-espresso">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-md border border-[#EAE6DF] hover:bg-[#FAF8F5] flex items-center justify-center text-amm-roast"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Pinned Footer */}
            <div className="p-5 border-t border-[#F2ECE4] bg-[#FCFBF9] space-y-3 shrink-0">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-xs text-amm-roast">Total de la orden:</span>
                <span className="font-serif font-black text-2xl text-amm-espresso">
                  ${cartTotal.toFixed(2)} <span className="text-xs font-sans font-normal text-amm-roast">MXN</span>
                </span>
              </div>

              <button
                onClick={() => {
                  setIsMobileCartDrawerOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2"
              >
                <span>Proceder a Cobrar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modifier Modal */}
      {activeProductForModifier && (
        <ProductModifierModal
          product={activeProductForModifier}
          isOpen={Boolean(activeProductForModifier)}
          onClose={() => setActiveProductForModifier(null)}
          onAddToCart={(item) => addToCart(item)}
        />
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSaleCompleted={(sale) => {
          setCompletedSale(sale);
        }}
      />

      {/* Thermal Receipt Preview Modal */}
      <ReceiptModal
        sale={completedSale}
        isOpen={Boolean(completedSale)}
        onClose={() => setCompletedSale(null)}
      />

      {/* Collaborator Selection Modal */}
      <CollaboratorModal
        isOpen={isCollaboratorModalOpen}
        onClose={() => setIsCollaboratorModalOpen(false)}
        currentCollaborator={collaboratorName}
        onSelectCollaborator={(name) => setCollaboratorName(name)}
      />

    </div>
  );
}
