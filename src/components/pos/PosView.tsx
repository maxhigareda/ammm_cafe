'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Category, Product, CartItem, Sale } from '@/types';
import {
  Search,
  Coffee,
  Croissant,
  UtensilsCrossed,
  GlassWater,
  Cake,
  Boxes,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  AlertTriangle,
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

  const categories: { id: Category; label: string; icon: any }[] = [
    { id: 'todos', label: 'Todos', icon: Boxes },
    { id: 'cafe', label: 'Café', icon: Coffee },
    { id: 'panaderia', label: 'Panadería', icon: Croissant },
    { id: 'bocados', label: 'Bocados', icon: UtensilsCrossed },
    { id: 'bebidas_frias', label: 'Bebidas Frías', icon: GlassWater },
    { id: 'postres', label: 'Postres', icon: Cake },
    { id: 'paquetes', label: 'Combos & Paquetes', icon: Sparkles },
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
      // Add immediately if no modifiers needed
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Search, Categories & Products Grid (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          
          {/* Top Search & Stats */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amm-roast" />
              <input
                type="text"
                placeholder="Buscar café, croissant, bocados, postres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-amm-latte text-xs text-amm-espresso placeholder:text-amm-roast/60 focus:outline-none focus:ring-2 focus:ring-amm-mauve/50 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amm-roast hover:text-amm-espresso font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-amm-roast shrink-0 bg-amm-sand px-3 py-2 rounded-2xl border border-amm-latte">
              <span className="font-bold text-amm-espresso">{filteredProducts.length}</span> artículos disponibles
            </div>
          </div>

          {/* Categories Pill Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
                    isSelected
                      ? 'bg-amm-mauve text-white shadow-soft font-bold scale-[1.02]'
                      : 'bg-white text-amm-roast border border-amm-latte hover:border-amm-mauve/50 hover:bg-amm-cream'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amm-mauve'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map((prod) => {
              const isLowStock = prod.isDirectStock && prod.stockQuantity !== undefined && prod.stockQuantity <= 4;
              const isOutOfStock = !prod.inStock || (prod.isDirectStock && prod.stockQuantity === 0);

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && handleProductClick(prod)}
                  className={`group relative bg-white rounded-3xl overflow-hidden border border-amm-latte shadow-xs hover:shadow-card transition-all duration-200 flex flex-col text-left cursor-pointer active:scale-[0.98] ${
                    isOutOfStock ? 'opacity-60 cursor-not-allowed bg-amm-sand/50' : 'hover:-translate-y-0.5'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative h-28 sm:h-32 w-full bg-amm-sand overflow-hidden">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Price Pill */}
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-black text-amm-espresso shadow-xs border border-amm-latte/50">
                      ${prod.price.toFixed(0)}
                    </span>

                    {/* Stock Alert Badge */}
                    {isLowStock && !isOutOfStock && (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold shadow-xs backdrop-blur-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>¡Solo {prod.stockQuantity}!</span>
                      </span>
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2 text-center">
                        <span className="text-white text-xs font-black uppercase tracking-wider bg-rose-600/90 px-2.5 py-1 rounded-full shadow-md">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-amm-espresso line-clamp-1 leading-snug">
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-amm-roast line-clamp-2 mt-0.5">
                        {prod.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-amm-latte/40">
                      <span className="text-[10px] uppercase font-bold text-amm-mauve-dark">
                        {prod.modifierGroups && prod.modifierGroups.length > 0 ? 'Personalizar' : 'Directo'}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-amm-sand group-hover:bg-amm-mauve group-hover:text-white flex items-center justify-center text-amm-espresso transition-colors">
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-10 rounded-3xl bg-white border border-amm-latte text-center space-y-2">
              <Coffee className="w-8 h-8 text-amm-mauve mx-auto opacity-60" />
              <p className="font-serif font-bold text-sm text-amm-espresso">
                No se encontraron artículos
              </p>
              <p className="text-xs text-amm-roast">
                Intenta con otra palabra clave o selecciona otra categoría.
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Order Ticket / Cart (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-amm-latte shadow-card overflow-hidden sticky top-24">
          
          {/* Ticket Header */}
          <div className="p-4 border-b border-amm-latte/60 bg-amm-sand/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-amm-mauve/20 text-amm-mauve-dark">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-amm-espresso">
                  Ticket de Venta
                </h3>
                <p className="text-[10px] text-amm-roast">
                  Atiende: <span className="font-semibold text-amm-espresso">{collaboratorName}</span>
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors text-xs font-semibold flex items-center gap-1"
                title="Vaciar ticket"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Vaciar</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto divide-y divide-amm-latte/40">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-xs text-amm-espresso leading-snug">
                        {item.product.name}
                      </h4>
                      
                      {/* Modifiers selected tags */}
                      {Object.entries(item.selectedModifiers).map(([group, opts]) =>
                        opts.map((opt) => (
                          <div key={opt.id} className="text-[10px] text-amm-roast mt-0.5">
                            • {opt.name} {opt.priceDelta > 0 && `(+$${opt.priceDelta})`}
                          </div>
                        ))
                      )}

                      {item.notes && (
                        <div className="text-[10px] italic text-amm-mauve-dark mt-0.5">
                          Nota: {item.notes}
                        </div>
                      )}
                    </div>

                    <span className="font-extrabold text-xs text-amm-espresso whitespace-nowrap">
                      ${item.itemTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amm-roast">
                      ${(item.itemTotal / item.quantity).toFixed(2)} c/u
                    </span>

                    <div className="flex items-center bg-amm-sand border border-amm-latte rounded-xl p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateCartItemQuantity(item.id, -1)}
                        className="p-1 rounded-lg hover:bg-white text-amm-roast transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-amm-espresso">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(item.id, 1)}
                        className="p-1 rounded-lg hover:bg-white text-amm-roast transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-amm-sand/80 flex items-center justify-center text-amm-mauve">
                  <Coffee className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <p className="font-serif font-bold text-xs text-amm-espresso">
                    El ticket está vacío
                  </p>
                  <p className="text-[11px] text-amm-roast mt-0.5">
                    Selecciona productos del menú para comenzar la orden.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Footer / Checkout Action */}
          <div className="p-4 bg-amm-sand/40 border-t border-amm-latte space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-amm-roast">
                <span>Artículos ({cartCount}):</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-base text-amm-espresso pt-1 border-t border-amm-latte/60">
                <span>Total a Cobrar:</span>
                <span className="text-amm-mauve-dark font-black">
                  ${cartTotal.toFixed(2)} MXN
                </span>
              </div>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2 ${
                cart.length > 0
                  ? 'bg-amm-mauve hover:bg-amm-mauve-dark text-white active:scale-[0.98]'
                  : 'bg-amm-latte text-amm-roast cursor-not-allowed'
              }`}
            >
              <span>Cobrar Pedido</span>
              <span className="font-black text-white/95">
                (${cartTotal.toFixed(2)})
              </span>
            </button>
          </div>

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
