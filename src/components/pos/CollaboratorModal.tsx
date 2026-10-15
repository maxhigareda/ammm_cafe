'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Check, Plus, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentCollaborator: string;
  onSelectCollaborator: (name: string) => void;
}

const DEFAULT_TEAM = [
  'Sofía Méndez',
  'Carlos Rodríguez',
  'Mateo Vargas',
  'Valentina Luna',
];

export default function CollaboratorModal({
  isOpen,
  onClose,
  currentCollaborator,
  onSelectCollaborator,
}: Props) {
  const [team, setTeam] = useState<string[]>(DEFAULT_TEAM);
  const [newCollabName, setNewCollabName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('amm_team_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeam(parsed);
        }
      }
    } catch {}
  }, []);

  if (!isOpen) return null;

  const handleSelect = (name: string) => {
    onSelectCollaborator(name);
    onClose();
  };

  const handleAddCollab = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCollabName.trim();
    if (!trimmed) return;
    if (!team.includes(trimmed)) {
      const updated = [...team, trimmed];
      setTeam(updated);
      try {
        localStorage.setItem('amm_team_members', JSON.stringify(updated));
      } catch {}
    }
    onSelectCollaborator(trimmed);
    setNewCollabName('');
    setIsAdding(false);
    onClose();
  };

  const handleDeleteCollab = (e: React.MouseEvent, nameToDelete: string) => {
    e.stopPropagation();
    const updated = team.filter((n) => n !== nameToDelete);
    setTeam(updated);
    try {
      localStorage.setItem('amm_team_members', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-[#EAE6DF] shadow-card flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amm-mauve/15 text-amm-mauve-dark flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-amm-espresso">
                Colaborador en Turno
              </h3>
              <p className="text-[11px] text-amm-roast">
                Selecciona quién está cobrando en caja
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

        {/* Team list */}
        <div className="p-5 space-y-2 max-h-[50vh] overflow-y-auto">
          {team.map((name) => {
            const isSelected = currentCollaborator.toLowerCase() === name.toLowerCase();

            return (
              <div
                key={name}
                onClick={() => handleSelect(name)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amm-espresso text-white border-amm-espresso shadow-xs'
                    : 'bg-[#FAF8F5] text-amm-espresso border-[#EAE6DF] hover:bg-white hover:border-amm-mauve/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amm-sand text-amm-espresso'
                    }`}
                  >
                    {name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-xs block">{name}</span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-white/70' : 'text-amm-roast'
                      }`}
                    >
                      {isSelected ? '● Atendiendo actualmente' : 'Colaborador'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isSelected ? (
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  ) : (
                    team.length > 2 && (
                      <button
                        onClick={(e) => handleDeleteCollab(e, name)}
                        className="p-1 rounded text-amm-roast/40 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar de la lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}

          {/* Add custom collaborator */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#EAE6DF] text-amm-roast hover:text-amm-espresso hover:border-amm-mauve text-xs font-medium flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar nuevo colaborador</span>
            </button>
          ) : (
            <form onSubmit={handleAddCollab} className="pt-2 space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="Nombre del nuevo colaborador..."
                value={newCollabName}
                onChange={(e) => setNewCollabName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-amm-mauve bg-white text-amm-espresso focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-[#EAE6DF] text-xs text-amm-roast hover:bg-[#FAF8F5]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newCollabName.trim()}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-amm-mauve hover:bg-amm-mauve-dark text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Guardar y Activar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#F2ECE4] bg-[#FCFBF9] text-center">
          <p className="text-[10px] text-amm-roast">
            Las ventas y comandas se registrarán con el nombre seleccionado.
          </p>
        </div>
      </div>
    </div>
  );
}
