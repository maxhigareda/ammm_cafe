'use client';

import React from 'react';
import { Sale } from '@/types';
import { X, Printer, Check, Coffee } from 'lucide-react';

interface Props {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ sale, isOpen, onClose }: Props) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-card border border-amm-latte flex flex-col max-h-[92vh]">
        
        {/* Top actions bar */}
        <div className="p-4 border-b border-amm-latte/60 flex items-center justify-between bg-amm-sand/30 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
            <Check className="w-4 h-4 bg-emerald-100 p-0.5 rounded-full" />
            <span>Venta Registrada Exitosamente</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-amm-sand text-amm-roast transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body (printable container) */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div
            id="thermal-receipt"
            className="p-4 bg-amm-cream/50 border border-dashed border-amm-latte rounded-2xl text-amm-espresso text-xs font-mono space-y-3"
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-amm-latte">
              <div className="w-10 h-10 mx-auto rounded-full bg-amm-mauve/20 flex items-center justify-center text-amm-mauve-dark mb-1">
                <Coffee className="w-5 h-5" />
              </div>
              <h2 className="font-serif font-black text-lg text-amm-espresso tracking-wide">
                AMM CAFÉ
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-amm-roast">
                Pan, Café & Bocados
              </p>
              <p className="text-[10px] text-amm-roast">
                Ticket #{sale.ticketNumber} • {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[10px] text-amm-roast">
                Atendido por: {sale.collaboratorName}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2 py-2 border-b border-dashed border-amm-latte">
              {sale.items.map((item) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span>${item.itemTotal.toFixed(2)}</span>
                  </div>

                  {/* Modifiers bullet list */}
                  {Object.entries(item.selectedModifiers).map(([group, opts]) =>
                    opts.map((opt) => (
                      <div key={opt.id} className="text-[10px] text-amm-roast pl-2">
                        + {opt.name} {opt.priceDelta > 0 && `(+$${opt.priceDelta})`}
                      </div>
                    ))
                  )}

                  {item.notes && (
                    <div className="text-[10px] italic text-amm-mauve-dark pl-2">
                      Nota: "{item.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 pt-1 text-xs">
              <div className="flex justify-between text-amm-roast">
                <span>Subtotal:</span>
                <span>${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Descuento:</span>
                  <span>-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1 border-t border-amm-latte text-amm-espresso">
                <span>TOTAL:</span>
                <span>${sale.total.toFixed(2)} MXN</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="pt-2 border-t border-dashed border-amm-latte text-[10px] text-amm-roast space-y-0.5">
              <div className="flex justify-between capitalize">
                <span>Método de Pago:</span>
                <span className="font-semibold text-amm-espresso">{sale.paymentMethod}</span>
              </div>
              {sale.paymentMethod === 'efectivo' && (
                <>
                  <div className="flex justify-between">
                    <span>Efectivo Recibido:</span>
                    <span>${sale.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Cambio:</span>
                    <span>${sale.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer message */}
            <div className="text-center pt-3 border-t border-dashed border-amm-latte text-[10px] text-amm-roast space-y-1">
              <p className="font-serif italic text-amm-espresso">
                ¡Gracias por compartir tu momento con nosotros!
              </p>
              <p className="tracking-wider">@amm.cafemx</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-amm-sand/50 border-t border-amm-latte flex items-center gap-3 shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-2xl border border-amm-latte bg-white hover:bg-amm-sand text-amm-espresso font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-amm-mauve" />
            <span>Imprimir Ticket</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs transition-colors shadow-soft"
          >
            Nueva Venta
          </button>
        </div>

      </div>
    </div>
  );
}
