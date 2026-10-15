'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Tag, Plus, Pencil, Trash2, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryManagerModal({ isOpen, onClose }: Props) {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    addCategory(newLabel);
    setNewLabel('');
  };

  const startEdit = (id: string, label: string) => {
    setEditingId(id);
    setEditingLabel(label);
  };

  const saveEdit = (id: string) => {
    if (!editingLabel.trim()) return;
    updateCategory(id, editingLabel);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-[#EAE6DF] shadow-card flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amm-mauve/15 text-amm-mauve-dark flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-amm-espresso">
                Administrar Categorías
              </h3>
              <p className="text-[11px] text-amm-roast">
                Crea, edita o elimina las categorías del menú
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amm-roast hover:text-amm-espresso hover:bg-[#F2ECE4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-5 overflow-y-auto space-y-2 flex-1 divide-y divide-[#F5F2EB]">
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="pt-2 first:pt-0 flex items-center justify-between gap-2"
              >
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(cat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-amm-mauve bg-white text-amm-espresso focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit(cat.id)}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      title="Guardar"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg border border-[#EAE6DF] text-amm-roast hover:bg-[#FAF8F5]"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amm-mauve" />
                      <span className="font-semibold text-xs text-amm-espresso">
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-amm-roast/60 font-mono">
                        ({cat.id})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(cat.id, cat.label)}
                        className="p-1.5 rounded-lg text-amm-roast hover:text-amm-espresso hover:bg-[#FAF8F5]"
                        title="Editar nombre"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {categories.length > 1 && (
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1.5 rounded-lg text-amm-roast/60 hover:text-rose-600 hover:bg-rose-50"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Category Section */}
        <div className="p-4 border-t border-[#F2ECE4] bg-[#FCFBF9] space-y-2 shrink-0">
          <label className="block text-[11px] font-bold text-amm-espresso">
            Agregar Nueva Categoría
          </label>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. Tés & Tisanas, Desayunos..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-white text-amm-espresso placeholder:text-amm-roast/50 focus:outline-none focus:border-amm-mauve"
            />
            <button
              type="submit"
              disabled={!newLabel.trim()}
              className="px-4 py-2 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar</span>
            </button>
          </form>
          <p className="text-[10px] text-amm-roast text-center pt-1">
            Las categorías aparecerán automáticamente en el filtro y al dar de alta productos.
          </p>
        </div>

      </div>
    </div>
  );
}
