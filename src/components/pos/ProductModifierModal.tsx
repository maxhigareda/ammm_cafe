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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-[#EAE6DF] shadow-card max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amm-mauve-dark block">
              Personalizar
            </span>
            <h3 className="font-serif font-bold text-lg text-amm-espresso">
              {product.name}
            </h3>
            <span className="text-xs text-amm-roast">
              Base: ${product.price.toFixed(2)} MXN
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amm-roast hover:text-amm-espresso hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Groups */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-[#F5F2EB]">
          {product.modifierGroups && product.modifierGroups.length > 0 ? (
            product.modifierGroups.map((group) => {
              const currentSelected = selectedModifiers[group.name] || [];

              return (
                <div key={group.id} className="pt-4 first:pt-0 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-amm-espresso">
                      {group.name}
                    </span>
                    <span className="text-[10px] text-amm-roast">
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
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                            isSelected
                              ? 'bg-amm-mauve/10 border-amm-mauve text-amm-espresso font-semibold'
                              : 'bg-white border-[#EAE6DF] text-amm-roast hover:bg-[#FAF8F5]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                                isSelected
                                  ? 'bg-amm-mauve border-amm-mauve text-white'
                                  : 'border-[#EAE6DF] bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span>{option.name}</span>
                          </div>
                          {option.priceDelta > 0 && (
                            <span className="text-[10px] font-bold text-amm-mauve-dark">
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
              Sin modificadores disponibles.
            </p>
          )}

          {/* Notes */}
          <div className="pt-4">
            <label className="block text-xs font-medium text-amm-espresso mb-1">
              Notas para barra
            </label>
            <input
              type="text"
              placeholder="Ej: Poco dulce, leche tibia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-amm-mauve"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F2ECE4] bg-[#FCFBF9] flex items-center justify-between gap-3">
          <div className="flex items-center border border-[#EAE6DF] rounded-xl bg-white p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1 rounded text-amm-roast hover:bg-[#FAF8F5]"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-amm-espresso">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 rounded text-amm-roast hover:bg-[#FAF8F5]"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs transition-all flex items-center justify-between"
          >
            <span>Agregar a la Orden</span>
            <span className="font-serif">
              ${totalPrice.toFixed(2)} MXN
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
