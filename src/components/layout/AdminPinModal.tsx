'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, X, ShieldCheck, Check } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CORRECT_PIN = '01048';
const PIN_LENGTH = 5;

export default function AdminPinModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminPinModalProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsShaking(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (isSuccess || isShaking) return;
      if (pin.length < PIN_LENGTH) {
        const nextPin = pin + digit;
        setPin(nextPin);
        setError(null);

        // Check when 5 digits are completed
        if (nextPin.length === PIN_LENGTH) {
          if (nextPin === CORRECT_PIN) {
            setIsSuccess(true);
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 350);
          } else {
            setIsShaking(true);
            setError('PIN incorrecto. Intenta de nuevo.');
            setTimeout(() => {
              setIsShaking(false);
              setPin('');
            }, 600);
          }
        }
      }
    },
    [pin, isSuccess, isShaking, onSuccess, onClose]
  );

  const handleBackspace = useCallback(() => {
    if (isSuccess || isShaking) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  }, [isSuccess, isShaking]);

  const handleClear = useCallback(() => {
    if (isSuccess || isShaking) return;
    setPin('');
    setError(null);
  }, [isSuccess, isShaking]);

  // Physical keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleBackspace, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amm-latte/70 flex flex-col items-center relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Decorative Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amm-mauve/40 via-amm-mint to-amm-mauve/40" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-amm-roast hover:bg-[#FAF8F5] hover:text-amm-espresso transition-colors"
          title="Cancelar y permanecer como colaborador"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Brand Header */}
        <div className="relative mb-3 mt-1">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isSuccess
                ? 'bg-emerald-100 text-emerald-700 scale-105'
                : error
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amm-mauve/15 text-amm-mauve-dark border border-amm-mauve/20'
            }`}
          >
            {isSuccess ? (
              <Check className="w-7 h-7 stroke-[2.5]" />
            ) : error ? (
              <Lock className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <ShieldCheck className="w-7 h-7 stroke-[2]" />
            )}
          </div>
        </div>

        <h3 className="font-serif font-bold text-xl text-amm-espresso tracking-tight text-center">
          Acceso Administrador
        </h3>
        <p className="text-xs text-amm-roast text-center mt-1 max-w-[240px]">
          Ingresa el PIN de seguridad de 5 dígitos para desbloquear la gestión completa.
        </p>

        {/* 5-Digit Visual Dots */}
        <div
          className={`flex items-center justify-center gap-3.5 my-5 py-1 ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isSuccess
                    ? 'bg-emerald-500 border-2 border-emerald-600 scale-110 shadow-xs'
                    : error
                    ? 'bg-rose-500 border-2 border-rose-600 scale-105 shadow-xs'
                    : isFilled
                    ? 'bg-amm-mauve-dark border-2 border-amm-mauve-dark scale-110 shadow-xs'
                    : 'bg-[#FAF8F5] border-2 border-[#D9D1C7]'
                }`}
              />
            );
          })}
        </div>

        {/* Error / Status Feedback message */}
        <div className="h-5 flex items-center justify-center -mt-2 mb-3">
          {error ? (
            <span className="text-xs font-semibold text-rose-600 animate-in fade-in">
              {error}
            </span>
          ) : isSuccess ? (
            <span className="text-xs font-semibold text-emerald-700 animate-in fade-in">
              PIN correcto. Accediendo...
            </span>
          ) : (
            <span className="text-[11px] text-amm-roast/60">
              PIN de 5 dígitos
            </span>
          )}
        </div>

        {/* Keypad 3x4 */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE4] active:scale-95 transition-all border border-[#EAE6DF] font-serif font-bold text-lg text-amm-espresso shadow-2xs flex items-center justify-center select-none"
            >
              {digit}
            </button>
          ))}

          {/* Bottom Row: Clear, 0, Backspace */}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE4] active:scale-95 transition-all border border-[#EAE6DF] text-xs font-semibold text-amm-roast uppercase tracking-wider shadow-2xs flex items-center justify-center select-none"
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE4] active:scale-95 transition-all border border-[#EAE6DF] font-serif font-bold text-lg text-amm-espresso shadow-2xs flex items-center justify-center select-none"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Borrar dígito"
            className="h-12 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE4] active:scale-95 transition-all border border-[#EAE6DF] text-amm-roast hover:text-amm-espresso shadow-2xs flex items-center justify-center select-none"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Cancel Action */}
        <div className="mt-4 pt-3 border-t border-[#F2ECE4] w-full text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-amm-roast hover:text-amm-espresso transition-colors py-1 px-3"
          >
            Permanecer como Colaborador
          </button>
        </div>
      </div>
    </div>
  );
}
