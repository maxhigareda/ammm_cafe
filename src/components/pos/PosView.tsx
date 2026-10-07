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
} from 'lucide-react';
import ProductModifierModal from './ProductModifierModal';
import CheckoutModal from './CheckoutModal';
import ReceiptModal from './ReceiptModal';

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
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<Category>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProductForModifier, setActiveProductForModifier] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

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

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen bg-[#FAF8F5]">
      
      {/* Main Catalog Section (Left / Center) */}
      <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header: Title, Search, and Category filters */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif font-bold text-2xl text-amm-espresso tracking-tight">
                Punto de Venta
              </h1>
              <p className="text-xs text-amm-roast mt-0.5">
                Selecciona artículos del menú para añadirlos a la orden.
              </p>
            </div>

            {/* Quiet, minimalist search */}
            <div className="relative w-full sm:w-72">
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
          </div>

          {/* Minimal Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#EAE6DF]/60">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
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

        {/* Clean, Harmonious Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      <h3 className="font-medium text-xs sm:text-sm text-amm-espresso leading-snug line-clamp-1">
                        {prod.name}
                      </h3>
                      <span className="font-serif font-bold text-xs sm:text-sm text-amm-espresso shrink-0">
                        ${prod.price.toFixed(0)}
                      </span>
                    </div>

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

      {/* Integrated Order Ledger / Ticket (Right Column) */}
      <div className="w-full lg:w-96 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-[#EAE6DF] flex flex-col justify-between h-auto lg:min-h-screen">
        
        {/* Ledger Header */}
        <div className="p-6 pb-4 border-b border-[#F2ECE4] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-amm-espresso">
                Orden Actual
              </span>
              <span className="text-[11px] font-semibold text-amm-roast px-2 py-0.5 rounded-md bg-[#FAF8F5]">
                {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
            <p className="text-[11px] text-amm-roast mt-0.5">
              Atiende: <span className="font-medium text-amm-espresso">{collaboratorName}</span>
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-amm-roast hover:text-rose-600 transition-colors flex items-center gap-1"
              title="Vaciar orden"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Scrollable Items List */}
        <div className="p-6 flex-1 overflow-y-auto divide-y divide-[#F5F2EB] space-y-3">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-xs text-amm-espresso leading-snug">
                      {item.product.name}
                    </h4>

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

        {/* Ledger Total & Action Footer */}
        <div className="p-6 border-t border-[#F2ECE4] space-y-4 bg-[#FCFBF9]">
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
        </div>

      </div>

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

    </div>
  );
}
