'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  X,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Lock,
  Unlock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CashShiftView() {
  const { activeShift, openShift, addCashMovement, closeShift, collaboratorName } = useApp();

  // Open Shift Form State
  const [initialCashInput, setInitialCashInput] = useState('1000');
  const [operatorName, setOperatorName] = useState(collaboratorName);

  // Cash Movement State
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  // Close Shift Modal State
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [actualCashCount, setActualCashCount] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  const isOpen = activeShift?.status === 'abierta';

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(initialCashInput) || 0;
    openShift(cash, operatorName || collaboratorName);
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementAmount || !movementReason.trim()) return;

    addCashMovement(movementType, parseFloat(movementAmount) || 0, movementReason);
    setMovementAmount('');
    setMovementReason('');
    setIsMovementModalOpen(false);
  };

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    const counted = parseFloat(actualCashCount) || 0;
    closeShift(counted, closeNotes);

    try {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9C8DAC', '#C9F4D3'],
      });
    } catch {}

    setIsCloseModalOpen(false);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-[#FAF8F5]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isOpen ? 'text-emerald-800' : 'text-amber-800'}`}>
              {isOpen ? 'Turno en Curso' : 'Caja Cerrada'}
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-amm-espresso tracking-tight">
            Caja & Turnos
          </h1>
          <p className="text-xs text-amm-roast mt-0.5">
            Fondo inicial, registro de movimientos y arqueo de corte de caja.
          </p>
        </div>

        {isOpen && (
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setIsMovementModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE6DF] hover:bg-[#FAF8F5] text-amm-espresso font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowDownCircle className="w-4 h-4 text-amm-mauve" />
              <span>Movimiento de Caja</span>
            </button>

            <button
              onClick={() => {
                setActualCashCount(activeShift.expectedCash.toString());
                setIsCloseModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>Cerrar Turno (Corte Z)</span>
            </button>
          </div>
        )}
      </div>

      {/* Case 1: Caja está CERRADA */}
      {!isOpen && (
        <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#EAE6DF] p-8 text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amm-mauve/15 text-amm-mauve-dark flex items-center justify-center">
            <Unlock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif font-bold text-lg text-amm-espresso">
              Apertura de Turno de Caja
            </h2>
            <p className="text-xs text-amm-roast">
              Ingresa el fondo inicial de efectivo para comenzar el turno.
            </p>
          </div>

          <form onSubmit={handleOpenShift} className="space-y-4 text-left pt-2">
            <div>
              <label className="block text-xs font-semibold text-amm-espresso mb-1">
                Fondo Inicial ($ MXN)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amm-roast">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="1000.00"
                  value={initialCashInput}
                  onChange={(e) => setInitialCashInput(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-xs font-bold text-amm-espresso focus:bg-white focus:outline-none focus:border-amm-mauve"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amm-espresso mb-1">
                Atiende
              </label>
              <input
                type="text"
                required
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-xs font-medium text-amm-espresso focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs transition-all"
            >
              Abrir Turno de Caja
            </button>
          </form>
        </div>
      )}

      {/* Case 2: Caja está ABIERTA */}
      {isOpen && activeShift && (
        <div className="space-y-6">
          
          {/* Shift Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
              <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
                Fondo Inicial
              </span>
              <div className="font-serif font-black text-xl text-amm-espresso">
                ${activeShift.initialCash.toFixed(2)}
              </div>
              <span className="text-[10px] text-amm-roast block">Al abrir turno</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
              <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider block">
                Efectivo Ventas
              </span>
              <div className="font-serif font-black text-xl text-emerald-700">
                +${activeShift.cashSales.toFixed(2)}
              </div>
              <span className="text-[10px] text-amm-roast block">Cobrado en mano</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
              <span className="text-[11px] font-medium text-blue-800 uppercase tracking-wider block">
                Tarjeta & Transf.
              </span>
              <div className="font-serif font-black text-xl text-blue-700">
                ${(activeShift.cardSales + activeShift.transferSales).toFixed(2)}
              </div>
              <span className="text-[10px] text-amm-roast block">En cuenta bancaria</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#EDFDF3] border border-[#86CCA0]/60 space-y-1">
              <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
                Efectivo en Gaveta
              </span>
              <div className="font-serif font-black text-xl text-emerald-900">
                ${activeShift.expectedCash.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-800 block">Debe haber físicamente</span>
            </div>
          </div>

          {/* Movements & Shift Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Movements List (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden">
              <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between">
                <h2 className="font-serif font-bold text-base text-amm-espresso">
                  Movimientos Extraordinarios de Efectivo
                </h2>
                <span className="text-xs text-amm-roast">
                  {activeShift.movements.length} registrados
                </span>
              </div>

              <div className="p-5 divide-y divide-[#F5F2EB]">
                {activeShift.movements.length > 0 ? (
                  activeShift.movements.map((mov) => (
                    <div key={mov.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${mov.type === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <div>
                          <span className="font-medium text-amm-espresso block">
                            {mov.reason}
                          </span>
                          <span className="text-[10px] text-amm-roast">
                            {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <span className={`font-serif font-bold text-sm ${mov.type === 'entrada' ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {mov.type === 'entrada' ? `+$${mov.amount.toFixed(2)}` : `-$${mov.amount.toFixed(2)}`}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-xs text-amm-roast italic">
                    Sin retiros ni entradas en este turno.
                  </p>
                )}
              </div>
            </div>

            {/* Shift Summary (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EAE6DF] p-5 space-y-4">
              <h2 className="font-serif font-bold text-base text-amm-espresso">
                Detalle del Turno
              </h2>

              <div className="space-y-2 text-xs divide-y divide-[#F5F2EB]">
                <div className="flex justify-between py-1">
                  <span className="text-amm-roast">Responsable:</span>
                  <span className="font-medium text-amm-espresso">{activeShift.collaborator}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-amm-roast">Apertura:</span>
                  <span className="text-amm-espresso">
                    {new Date(activeShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-amm-roast">Entradas extraordinarias:</span>
                  <span className="font-medium text-emerald-700">+${activeShift.cashIn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-amm-roast">Salidas extraordinarias:</span>
                  <span className="font-medium text-rose-600">-${activeShift.cashOut.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-black text-sm border-t border-[#EAE6DF]">
                  <span>Total en Gaveta:</span>
                  <span className="font-serif text-amm-mauve-dark">${activeShift.expectedCash.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActualCashCount(activeShift.expectedCash.toString());
                  setIsCloseModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cerrar Turno & Corte Z</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Modal: New Movement */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#EAE6DF] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
              <h3 className="font-serif font-bold text-base text-amm-espresso">
                Movimiento de Efectivo
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)}>
                <X className="w-4 h-4 text-amm-roast" />
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('entrada')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    movementType === 'entrada'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-[#FAF8F5] text-amm-roast border-[#EAE6DF]'
                  }`}
                >
                  + Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('salida')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    movementType === 'salida'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-[#FAF8F5] text-amm-roast border-[#EAE6DF]'
                  }`}
                >
                  - Salida
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Monto ($ MXN)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Motivo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cambio del banco, compra de hielo..."
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#EAE6DF] text-xs font-semibold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white text-xs font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Close Shift / Corte Z */}
      {isCloseModalOpen && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#EAE6DF] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
              <h3 className="font-serif font-bold text-base text-rose-700">
                Cierre de Turno & Corte Z
              </h3>
              <button onClick={() => setIsCloseModalOpen(false)}>
                <X className="w-4 h-4 text-amm-roast" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs flex justify-between">
              <span className="text-amm-roast">Esperado en sistema:</span>
              <span className="font-serif font-bold text-amm-espresso">
                ${activeShift.expectedCash.toFixed(2)} MXN
              </span>
            </div>

            <form onSubmit={handleConfirmClose} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Efectivo Contado en Gaveta ($)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#EAE6DF] bg-white font-bold text-amm-espresso"
                />
              </div>

              {actualCashCount && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  (parseFloat(actualCashCount) - activeShift.expectedCash) === 0
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : (parseFloat(actualCashCount) - activeShift.expectedCash) < 0
                    ? 'bg-rose-50 text-rose-900 border border-rose-200'
                    : 'bg-blue-50 text-blue-900 border border-blue-200'
                }`}>
                  <span>Diferencia:</span>
                  <span className="font-serif font-bold text-sm">
                    {((parseFloat(actualCashCount) - activeShift.expectedCash) >= 0 ? '+' : '')}
                    ${(parseFloat(actualCashCount) - activeShift.expectedCash).toFixed(2)} MXN
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Observaciones (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Incidencias o notas del turno..."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#EAE6DF] text-xs font-semibold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Confirmar Corte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
