'use client';

import React, { useState } from 'react';
import { Product, CartItem, ModifierOption } from '@/types';
import { X, Plus, Minus, Check } from 'lucide-react';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export default function ProductModifierModal({ product, isOpen, onClose, onAddToCart }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<{ [groupName: string]: ModifierOption[] }>(() => {
    const initial: { [groupName: string]: ModifierOption[] } = {};
    if (product.modifierGroups) {
      product.modifierGroups.forEach((group) => {
        // Pre-select first option if required and not multi-select
        if (group.required && !group.multiSelect && group.options.length > 0) {
          initial[group.name] = [group.options[0]];
        } else {
          initial[group.name] = [];
        }
      });
    }
    return initial;
  });
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Calculate unit price including modifiers
  let extraPricePerUnit = 0;
  Object.values(selectedModifiers).forEach((options) => {
    options.forEach((opt) => {
      extraPricePerUnit += opt.priceDelta;
    });
  });

  const unitPrice = product.price + extraPricePerUnit;
  const totalPrice = unitPrice * quantity;

  const handleSelectOption = (groupName: string, option: ModifierOption, isMulti: boolean) => {
    setSelectedModifiers((prev) => {
      const current = prev[groupName] || [];
      if (isMulti) {
        const exists = current.some((o) => o.id === option.id);
        const next = exists
          ? current.filter((o) => o.id !== option.id)
          : [...current, option];
        return { ...prev, [groupName]: next };
      } else {
        return { ...prev, [groupName]: [option] };
      }
    });
  };

  const handleConfirm = () => {
    const cartItem: CartItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      productId: product.id,
      product,
      quantity,
      selectedModifiers,
      notes: notes.trim() || undefined,
      itemTotal: totalPrice,
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-card border border-amm-latte max-h-[90vh] flex flex-col">
        
        {/* Header with image */}
        <div className="relative h-44 w-full bg-amm-sand shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-amm-espresso transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amm-mint text-amm-espresso inline-block mb-1">
              {product.category}
            </span>
            <h3 className="font-serif font-bold text-xl leading-tight drop-shadow-sm">
              {product.name}
            </h3>
            <p className="text-xs text-white/90 font-medium">
              Base: ${product.price.toFixed(2)} MXN
            </p>
          </div>
        </div>

        {/* Scrollable Modifier Groups */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-amm-latte/40">
          {product.modifierGroups && product.modifierGroups.length > 0 ? (
            product.modifierGroups.map((group) => {
              const currentSelected = selectedModifiers[group.name] || [];

              return (
                <div key={group.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-bold text-sm text-amm-espresso">
                      {group.name}
                    </span>
                    <span className="text-[11px] font-medium text-amm-roast">
                      {group.required ? '(Requerido)' : '(Opcional)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map((option) => {
                      const isSelected = currentSelected.some((o) => o.id === option.id);

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectOption(group.name, option, group.multiSelect)}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-xs text-left transition-all ${
                            isSelected
                              ? 'bg-amm-mauve-soft/80 border-amm-mauve text-amm-espresso font-semibold shadow-xs ring-1 ring-amm-mauve'
                              : 'bg-amm-cream border-amm-latte text-amm-roast hover:border-amm-mauve-light hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                                isSelected
                                  ? 'bg-amm-mauve border-amm-mauve text-white'
                                  : 'border-amm-latte bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span>{option.name}</span>
                          </div>
                          {option.priceDelta > 0 && (
                            <span className="text-[11px] font-bold text-amm-mauve-dark">
                              +${option.priceDelta}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-amm-roast italic">
              Este artículo no tiene modificadores obligatorios.
            </p>
          )}

          {/* Notes for barista */}
          <div className="pt-4">
            <label className="block text-xs font-bold text-amm-espresso mb-1.5">
              Instrucciones especiales para barra / cocina
            </label>
            <input
              type="text"
              placeholder="Ej: Poco dulce, hielo ligero, empaque para llevar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-amm-latte bg-amm-cream focus:bg-white focus:outline-none focus:ring-2 focus:ring-amm-mauve/50"
            />
          </div>
        </div>

        {/* Footer: Quantity + Add Button */}
        <div className="p-4 bg-amm-sand/50 border-t border-amm-latte flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center bg-white border border-amm-latte rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1.5 rounded-xl hover:bg-amm-sand text-amm-roast transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-amm-espresso">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1.5 rounded-xl hover:bg-amm-sand text-amm-roast transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 rounded-2xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-sm shadow-soft transition-all active:scale-[0.98] flex items-center justify-between"
          >
            <span>Agregar al Ticket</span>
            <span className="font-extrabold tracking-wide">
              ${totalPrice.toFixed(2)} MXN
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
