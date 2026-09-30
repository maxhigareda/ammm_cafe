'use client';

import React, { useState } from 'react';
import { PaymentMethod, Sale } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, Banknote, CreditCard, ArrowRightLeft, CheckCircle2, Percent } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaleCompleted: (sale: Sale) => void;
}

export default function CheckoutModal({ isOpen, onClose, onSaleCompleted }: Props) {
  const { cartTotal, completeSale, collaboratorName } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [discount, setDiscount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<string>('');

  if (!isOpen) return null;

  const finalTotal = Math.max(0, cartTotal - discount);
  const parsedCash = parseFloat(cashGiven) || 0;
  const change = Math.max(0, parsedCash - finalTotal);
  const isCashSufficient = paymentMethod !== 'efectivo' || parsedCash >= finalTotal;

  // Preset bill shortcuts
  const commonBills = [50, 100, 200, 500].filter((b) => b >= finalTotal);
  if (!commonBills.includes(finalTotal)) {
    commonBills.unshift(finalTotal);
  }

  const handlePay = () => {
    if (!isCashSufficient) return;

    const amountPaid = paymentMethod === 'efectivo' ? parsedCash : finalTotal;
    const sale = completeSale(paymentMethod, amountPaid, discount);

    // Fire cute confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#9C8DAC', '#C9F4D3', '#BEABD9', '#D98852'],
      });
    } catch {}

    onSaleCompleted(sale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-card border border-amm-latte flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-amm-latte/60 flex items-center justify-between bg-amm-sand/30">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amm-mauve-dark">
              Cobro de Pedido
            </span>
            <h3 className="font-serif font-bold text-xl text-amm-espresso">
              Finalizar Venta
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-amm-sand text-amm-roast transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-amm-cream border border-amm-latte text-center">
            <span className="text-xs text-amm-roast font-medium">Total a Pagar</span>
            <div className="text-3xl font-extrabold text-amm-espresso tracking-tight my-1">
              ${finalTotal.toFixed(2)}{' '}
              <span className="text-sm font-semibold text-amm-mauve">MXN</span>
            </div>
            {discount > 0 && (
              <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Descuento aplicado: -${discount.toFixed(2)}
              </span>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-amm-espresso mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('efectivo');
                  setCashGiven(finalTotal.toString());
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  paymentMethod === 'efectivo'
                    ? 'bg-amm-mauve text-white border-amm-mauve shadow-soft'
                    : 'bg-amm-sand/50 text-amm-roast border-amm-latte hover:bg-amm-sand'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tarjeta')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  paymentMethod === 'tarjeta'
                    ? 'bg-amm-mauve text-white border-amm-mauve shadow-soft'
                    : 'bg-amm-sand/50 text-amm-roast border-amm-latte hover:bg-amm-sand'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  paymentMethod === 'transferencia'
                    ? 'bg-amm-mauve text-white border-amm-mauve shadow-soft'
                    : 'bg-amm-sand/50 text-amm-roast border-amm-latte hover:bg-amm-sand'
                }`}
              >
                <ArrowRightLeft className="w-5 h-5" />
                <span>Transferencia</span>
              </button>
            </div>
          </div>

          {/* Cash Details if Cash is selected */}
          {paymentMethod === 'efectivo' && (
            <div className="space-y-3 bg-amm-sand/30 p-3.5 rounded-2xl border border-amm-latte/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amm-espresso">
                  Efectivo recibido
                </label>
                <span className="text-[11px] text-amm-roast">
                  Mínimo: ${finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Fast Bill Selectors */}
              <div className="flex flex-wrap gap-1.5">
                {commonBills.slice(0, 4).map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setCashGiven(bill.toString())}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      parsedCash === bill
                        ? 'bg-amm-espresso text-white border-amm-espresso'
                        : 'bg-white border-amm-latte text-amm-espresso hover:bg-amm-sand'
                    }`}
                  >
                    {bill === finalTotal ? 'Exacto' : `$${bill}`}
                  </button>
                ))}
              </div>

              {/* Manual Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-amm-roast">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-amm-latte bg-white text-amm-espresso font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amm-mauve"
                />
              </div>

              {/* Change Box */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amm-mint/40 border border-amm-mint-dark/40">
                <span className="text-xs font-bold text-emerald-950">
                  Cambio a entregar:
                </span>
                <span className="text-lg font-black text-emerald-900">
                  ${change.toFixed(2)} MXN
                </span>
              </div>

              {!isCashSufficient && parsedCash > 0 && (
                <p className="text-[11px] text-rose-600 font-semibold text-center">
                  ⚠️ El efectivo recibido es menor que el total.
                </p>
              )}
            </div>
          )}

          {/* Quick Discount Toggle */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-amm-roast font-medium flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amm-mauve" /> Descuento cortesía / empleado
            </span>
            <div className="flex items-center gap-1">
              {[0, 10, 20].map((pct) => {
                const discountVal = (cartTotal * pct) / 100;
                const isSelected = discount === discountVal;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscount(discountVal)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      isSelected
                        ? 'bg-amm-mauve text-white border-amm-mauve'
                        : 'bg-amm-sand border-amm-latte text-amm-roast'
                    }`}
                  >
                    {pct === 0 ? '0%' : `${pct}%`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-amm-sand/50 border-t border-amm-latte flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl border border-amm-latte bg-white hover:bg-amm-sand text-amm-roast font-semibold text-xs transition-colors"
          >
            Cancelar
          </button>

          <button
            disabled={!isCashSufficient}
            onClick={handlePay}
            className={`flex-1 py-3 px-5 rounded-2xl font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2 ${
              isCashSufficient
                ? 'bg-amm-mauve hover:bg-amm-mauve-dark text-white active:scale-[0.98]'
                : 'bg-amm-latte text-amm-roast cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Pago (${finalTotal.toFixed(2)})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
