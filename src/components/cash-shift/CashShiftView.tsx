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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amm-latte shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              isOpen
                ? 'bg-amm-mint/50 text-emerald-950 border border-amm-mint-dark/50'
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
              {isOpen ? 'Turno en Curso' : 'Caja Cerrada'}
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-amm-espresso">
            Caja Registradora & Corte Z
          </h2>
          <p className="text-xs text-amm-roast max-w-xl">
            Control de fondo inicial, entradas y salidas de efectivo por compras de emergencia y arqueo de turno para cuadrar cada peso.
          </p>
        </div>

        {isOpen && (
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setIsMovementModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white border border-amm-latte hover:bg-amm-sand text-amm-espresso font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowDownCircle className="w-4 h-4 text-amm-mauve" />
              <span>Movimiento de Caja</span>
            </button>

            <button
              onClick={() => {
                setActualCashCount(activeShift.expectedCash.toString());
                setIsCloseModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>Hacer Corte Z</span>
            </button>
          </div>
        )}
      </div>

      {/* Case 1: Caja está CERRADA */}
      {!isOpen && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-amm-latte p-8 shadow-card text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-amm-mauve/15 text-amm-mauve-dark flex items-center justify-center">
            <Unlock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl text-amm-espresso">
              Apertura de Turno de Caja
            </h3>
            <p className="text-xs text-amm-roast">
              Ingresa el fondo inicial con el que arranca la gaveta para comenzar a registrar ventas en el punto de venta.
            </p>
          </div>

          <form onSubmit={handleOpenShift} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-amm-espresso mb-1">
                Fondo de Caja Inicial ($ MXN) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-amm-roast">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="1000.00"
                  value={initialCashInput}
                  onChange={(e) => setInitialCashInput(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl border border-amm-latte bg-amm-cream text-sm font-bold text-amm-espresso focus:bg-white focus:outline-none focus:ring-2 focus:ring-amm-mauve"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amm-espresso mb-1">
                Nombre de quien atiende *
              </label>
              <input
                type="text"
                required
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-amm-latte bg-amm-cream text-xs font-bold text-amm-espresso focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-sm shadow-soft transition-all active:scale-[0.98]"
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
            <div className="p-4 rounded-3xl bg-white border border-amm-latte shadow-xs">
              <span className="text-[11px] text-amm-roast font-semibold">Fondo Inicial</span>
              <div className="text-2xl font-black text-amm-espresso mt-1">
                ${activeShift.initialCash.toFixed(2)}
              </div>
              <span className="text-[10px] text-amm-roast">Al abrir turno</span>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-amm-latte shadow-xs">
              <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" /> Ventas en Efectivo
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                +${activeShift.cashSales.toFixed(2)}
              </div>
              <span className="text-[10px] text-amm-roast">Cobrado en mano</span>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-amm-latte shadow-xs">
              <span className="text-[11px] text-blue-800 font-semibold flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Tarjeta & Transferencia
              </span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                ${(activeShift.cardSales + activeShift.transferSales).toFixed(2)}
              </div>
              <span className="text-[10px] text-amm-roast">En cuenta bancaria</span>
            </div>

            <div className="p-4 rounded-3xl bg-amm-mint/40 border border-amm-mint-dark/50 shadow-xs ring-2 ring-emerald-500/20">
              <span className="text-[11px] text-emerald-950 font-bold uppercase tracking-wider">
                Efectivo Esperado en Gaveta
              </span>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                ${activeShift.expectedCash.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-800 font-medium">Debe haber físicamente</span>
            </div>
          </div>

          {/* Cash Flow Details & Shift Movements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Cash Movements Ledger (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-amm-latte shadow-card overflow-hidden">
              <div className="p-4 border-b border-amm-latte/60 flex items-center justify-between bg-amm-sand/30">
                <h3 className="font-serif font-bold text-base text-amm-espresso">
                  Movimientos Extraordinarios de Efectivo (Entradas / Salidas)
                </h3>
                <span className="text-xs text-amm-roast font-medium">
                  {activeShift.movements.length} registrados
                </span>
              </div>

              <div className="p-4 divide-y divide-amm-latte/40">
                {activeShift.movements.length > 0 ? (
                  activeShift.movements.map((mov) => (
                    <div key={mov.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-xl ${mov.type === 'entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {mov.type === 'entrada' ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-amm-espresso block">
                            {mov.reason}
                          </span>
                          <span className="text-[10px] text-amm-roast">
                            {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <span className={`font-black text-sm ${mov.type === 'entrada' ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {mov.type === 'entrada' ? `+$${mov.amount.toFixed(2)}` : `-$${mov.amount.toFixed(2)}`}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-xs text-amm-roast italic">
                    Sin retiros ni entradas registradas en este turno.
                  </p>
                )}
              </div>
            </div>

            {/* Shift Summary Box (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-amm-latte p-5 shadow-card space-y-4">
              <h3 className="font-serif font-bold text-base text-amm-espresso">
                Detalle del Turno
              </h3>

              <div className="space-y-2 text-xs divide-y divide-amm-latte/40">
                <div className="flex justify-between py-1">
                  <span className="text-amm-roast">Responsable:</span>
                  <span className="font-bold text-amm-espresso">{activeShift.collaborator}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-amm-roast">Apertura:</span>
                  <span className="font-medium text-amm-espresso">
                    {new Date(activeShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-amm-roast">Entradas extraordinarias:</span>
                  <span className="font-bold text-emerald-700">+${activeShift.cashIn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-amm-roast">Salidas extraordinarias:</span>
                  <span className="font-bold text-rose-600">-${activeShift.cashOut.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-black text-sm border-t border-amm-latte">
                  <span>Balance Gaveta:</span>
                  <span className="text-amm-mauve-dark">${activeShift.expectedCash.toFixed(2)} MXN</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActualCashCount(activeShift.expectedCash.toString());
                  setIsCloseModalOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Turno & Cuadrar Caja</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Modal: New Cash Movement */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-card border border-amm-latte p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amm-latte">
              <h3 className="font-serif font-bold text-lg text-amm-espresso">
                Movimiento Extraordinario de Caja
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)}>
                <X className="w-5 h-5 text-amm-roast" />
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('entrada')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    movementType === 'entrada'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-amm-sand text-amm-roast border-amm-latte'
                  }`}
                >
                  + Entrada (Cambio)
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('salida')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    movementType === 'salida'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-amm-sand text-amm-roast border-amm-latte'
                  }`}
                >
                  - Salida (Retiro/Gasto)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Monto ($ MXN) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Motivo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Compra de hielo extra, cambio traído del banco..."
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-amm-latte text-xs font-bold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white text-xs font-bold shadow-soft"
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Close Shift / Corte Z */}
      {isCloseModalOpen && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-card border border-amm-latte p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amm-latte">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-lg font-serif">
                <Lock className="w-5 h-5" />
                <span>Cierre de Turno & Corte Z</span>
              </div>
              <button onClick={() => setIsCloseModalOpen(false)}>
                <X className="w-5 h-5 text-amm-roast" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amm-sand/50 border border-amm-latte text-xs space-y-1">
              <div className="flex justify-between text-amm-roast">
                <span>Efectivo esperado por sistema:</span>
                <span className="font-extrabold text-amm-espresso">
                  ${activeShift.expectedCash.toFixed(2)} MXN
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmClose} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Efectivo Físico Contado en Gaveta ($ MXN) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-amm-latte bg-white font-extrabold text-amm-espresso focus:ring-2 focus:ring-amm-mauve"
                />
              </div>

              {/* Live difference preview */}
              {actualCashCount && (
                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
                  (parseFloat(actualCashCount) - activeShift.expectedCash) === 0
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : (parseFloat(actualCashCount) - activeShift.expectedCash) < 0
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                }`}>
                  <span>Diferencia de Caja:</span>
                  <span className="text-sm">
                    {((parseFloat(actualCashCount) - activeShift.expectedCash) >= 0 ? '+' : '')}
                    ${(parseFloat(actualCashCount) - activeShift.expectedCash).toFixed(2)} MXN
                    {(parseFloat(actualCashCount) - activeShift.expectedCash) === 0 && ' (¡Cuadre Exacto!)'}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Observaciones de Cierre (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre billetes deteriorados, incidencias de terminal..."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-amm-latte text-xs font-bold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-soft"
                >
                  Confirmar Corte Z
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
