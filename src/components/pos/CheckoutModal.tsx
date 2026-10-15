'use client';

import React, { useState } from 'react';
import { PaymentMethod, Sale } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, Banknote, CreditCard, ArrowRightLeft, CheckCircle2, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaleCompleted: (sale: Sale) => void;
}

export default function CheckoutModal({ isOpen, onClose, onSaleCompleted }: Props) {
  const { cartTotal, completeSale } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [discount, setDiscount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<string>('');
  const [cardReference, setCardReference] = useState<string>('');

  if (!isOpen) return null;

  const finalTotal = Math.max(0, cartTotal - discount);
  const parsedCash = parseFloat(cashGiven) || 0;
  const change = Math.max(0, parsedCash - finalTotal);
  const isCashSufficient = paymentMethod !== 'efectivo' || parsedCash >= finalTotal;

  const commonBills = [50, 100, 200, 500].filter((b) => b >= finalTotal);
  if (!commonBills.includes(finalTotal)) {
    commonBills.unshift(finalTotal);
  }

  const handlePay = () => {
    if (!isCashSufficient) return;

    const amountPaid = paymentMethod === 'efectivo' ? parsedCash : finalTotal;
    const sale = completeSale(paymentMethod, amountPaid, discount);

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#9C8DAC', '#C9F4D3'],
      });
    } catch {}

    onSaleCompleted(sale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-[#EAE6DF] shadow-card flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-amm-espresso">
              Cobrar Pedido
            </h3>
            <span className="text-xs text-amm-roast">
              Selecciona método y registra el pago
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amm-roast hover:text-amm-espresso hover:bg-[#FAF8F5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Total Display */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-center">
            <span className="text-[11px] text-amm-roast uppercase tracking-wider block">Total a Pagar</span>
            <div className="font-serif font-black text-3xl text-amm-espresso my-1">
              ${finalTotal.toFixed(2)}{' '}
              <span className="text-xs font-sans font-normal text-amm-roast">MXN</span>
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Descuento: -${discount.toFixed(2)}
              </span>
            )}
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="block text-[11px] font-semibold text-amm-espresso mb-1.5 uppercase tracking-wider">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('efectivo');
                  setCashGiven(finalTotal.toString());
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  paymentMethod === 'efectivo'
                    ? 'bg-amm-espresso text-white border-amm-espresso'
                    : 'bg-[#FAF8F5] text-amm-roast border-[#EAE6DF] hover:bg-white'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tarjeta')}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  paymentMethod === 'tarjeta'
                    ? 'bg-amm-espresso text-white border-amm-espresso'
                    : 'bg-[#FAF8F5] text-amm-roast border-[#EAE6DF] hover:bg-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Tarjeta / iPhone</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  paymentMethod === 'transferencia'
                    ? 'bg-amm-espresso text-white border-amm-espresso'
                    : 'bg-[#FAF8F5] text-amm-roast border-[#EAE6DF] hover:bg-white'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Transf. SPEI</span>
              </button>
            </div>
          </div>

          {/* Cash Details */}
          {paymentMethod === 'efectivo' && (
            <div className="space-y-3 bg-[#FCFBF9] p-3.5 rounded-xl border border-[#EAE6DF]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-amm-espresso">Efectivo recibido:</span>
                {/* Fast shortcuts */}
                <div className="flex gap-1">
                  {commonBills.slice(0, 3).map((bill) => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => setCashGiven(bill.toString())}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        parsedCash === bill
                          ? 'bg-amm-mauve text-white border-amm-mauve'
                          : 'bg-white border-[#EAE6DF] text-amm-roast'
                      }`}
                    >
                      {bill === finalTotal ? 'Exacto' : `$${bill}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amm-roast">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-[#EAE6DF] bg-white text-xs font-bold text-amm-espresso focus:outline-none focus:border-amm-mauve"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F2ECE4]">
                <span className="text-amm-roast">Cambio a entregar:</span>
                <span className="font-serif font-black text-sm text-emerald-800">
                  ${change.toFixed(2)} MXN
                </span>
              </div>
            </div>
          )}

          {/* Card / iPhone Tap to Pay Details */}
          {paymentMethod === 'tarjeta' && (
            <div className="space-y-3 bg-[#FCFBF9] p-3.5 rounded-xl border border-[#EAE6DF]">
              <div className="flex items-center gap-2 text-xs font-semibold text-amm-espresso">
                <div className="w-6 h-6 rounded-lg bg-amm-mauve/15 text-amm-mauve-dark flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <span>Cobro con iPhone (Tap to Pay) o Terminal</span>
              </div>

              <div className="text-[11px] text-amm-roast space-y-1.5 bg-white p-2.5 rounded-lg border border-[#F2ECE4]">
                <div className="flex justify-between items-center text-xs pb-1 border-b border-[#F5F2EB]">
                  <span className="font-medium text-amm-espresso">Monto en tu app de iPhone:</span>
                  <span className="font-serif font-black text-sm text-amm-espresso">
                    ${finalTotal.toFixed(2)} MXN
                  </span>
                </div>
                <p className="leading-relaxed text-[10px] text-amm-roast/80 pt-0.5">
                  1. Abre tu app en el iPhone (Clip, Mercado Pago o Tap to Pay).<br />
                  2. Ingresa <strong>${finalTotal.toFixed(2)}</strong> y acerca la tarjeta contactless o Apple Pay del cliente.<br />
                  3. Una vez aprobado en tu iPhone, presiona abajo "Confirmar Pago".
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-[11px] text-amm-roast">Folio / Ref. (opcional):</span>
                <input
                  type="text"
                  placeholder="Ej. Clip-4920"
                  value={cardReference}
                  onChange={(e) => setCardReference(e.target.value)}
                  className="w-32 px-2.5 py-1 text-xs rounded-lg border border-[#EAE6DF] bg-white text-amm-espresso placeholder:text-amm-roast/40 focus:outline-none focus:border-amm-mauve text-right font-mono"
                />
              </div>
            </div>
          )}

          {/* Transfer Details */}
          {paymentMethod === 'transferencia' && (
            <div className="space-y-3 bg-[#FCFBF9] p-3.5 rounded-xl border border-[#EAE6DF]">
              <div className="flex items-center gap-2 text-xs font-semibold text-amm-espresso">
                <div className="w-6 h-6 rounded-lg bg-amm-mauve/15 text-amm-mauve-dark flex items-center justify-center">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </div>
                <span>Transferencia Electrónica (SPEI)</span>
              </div>

              <div className="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border border-[#F2ECE4]">
                <span className="text-amm-roast">Monto a transferir:</span>
                <span className="font-serif font-black text-sm text-amm-espresso">
                  ${finalTotal.toFixed(2)} MXN
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-[11px] text-amm-roast">Folio / Rastreo (opcional):</span>
                <input
                  type="text"
                  placeholder="Ej. SPEI-8291"
                  value={cardReference}
                  onChange={(e) => setCardReference(e.target.value)}
                  className="w-32 px-2.5 py-1 text-xs rounded-lg border border-[#EAE6DF] bg-white text-amm-espresso placeholder:text-amm-roast/40 focus:outline-none focus:border-amm-mauve text-right font-mono"
                />
              </div>
            </div>
          )}

          {/* Courtesy Discount */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-amm-roast text-[11px]">Descuento cortesía:</span>
            <div className="flex gap-1">
              {[0, 10, 20].map((pct) => {
                const discountVal = (cartTotal * pct) / 100;
                const isSelected = discount === discountVal;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscount(discountVal)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isSelected
                        ? 'bg-amm-mauve text-white border-amm-mauve'
                        : 'bg-[#FAF8F5] border-[#EAE6DF] text-amm-roast'
                    }`}
                  >
                    {pct === 0 ? 'Sin desc.' : `${pct}%`}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F2ECE4] bg-[#FCFBF9] flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2.5 rounded-xl border border-[#EAE6DF] text-xs font-medium text-amm-roast hover:bg-[#FAF8F5]"
          >
            Cancelar
          </button>

          <button
            disabled={!isCashSufficient}
            onClick={handlePay}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              isCashSufficient
                ? 'bg-amm-mauve hover:bg-amm-mauve-dark text-white shadow-soft'
                : 'bg-[#EDE7DE] text-amm-roast/60 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmar Pago (${finalTotal.toFixed(2)})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
