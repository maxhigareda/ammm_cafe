'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Check, Plus, Trash2, Pencil } from 'lucide-react';

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

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

  const saveTeamToStorage = (updatedTeam: string[]) => {
    setTeam(updatedTeam);
    try {
      localStorage.setItem('amm_team_members', JSON.stringify(updatedTeam));
    } catch {}
  };

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
      saveTeamToStorage(updated);
    }
    onSelectCollaborator(trimmed);
    setNewCollabName('');
    setIsAdding(false);
    onClose();
  };

  const startEditing = (e: React.MouseEvent, index: number, name: string) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditingName(name);
  };

  const saveEdit = (e: React.MouseEvent | React.FormEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    const trimmed = editingName.trim();
    if (!trimmed) return;

    const oldName = team[index];
    const updated = [...team];
    updated[index] = trimmed;
    saveTeamToStorage(updated);

    // If the one being edited was the currently active collaborator, update it
    if (currentCollaborator.toLowerCase() === oldName.toLowerCase()) {
      onSelectCollaborator(trimmed);
    }

    setEditingIndex(null);
    setEditingName('');
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIndex(null);
    setEditingName('');
  };

  const handleDeleteCollab = (e: React.MouseEvent, nameToDelete: string) => {
    e.stopPropagation();
    if (team.length <= 1) {
      alert('Debe haber al menos un colaborador registrado.');
      return;
    }
    const updated = team.filter((n) => n !== nameToDelete);
    saveTeamToStorage(updated);

    // If deleting the active one, pick the first available
    if (currentCollaborator.toLowerCase() === nameToDelete.toLowerCase()) {
      if (updated.length > 0) {
        onSelectCollaborator(updated[0]);
      }
    }
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
                Colaboradores de Barra
              </h3>
              <p className="text-[11px] text-amm-roast">
                Elige, renombra o añade al personal en turno
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
        <div className="p-5 space-y-2.5 max-h-[55vh] overflow-y-auto">
          {team.map((name, index) => {
            const isSelected = currentCollaborator.toLowerCase() === name.toLowerCase();
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <div
                  key={`edit-${index}`}
                  className="p-2.5 rounded-xl border border-amm-mauve bg-[#FAF8F5] space-y-2"
                >
                  <label className="block text-[10px] font-bold uppercase text-amm-mauve-dark">
                    Renombrar colaborador:
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#EAE6DF] bg-white text-amm-espresso focus:outline-none focus:border-amm-mauve"
                    placeholder="Escribe el nombre..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(e, index);
                      if (e.key === 'Escape') setEditingIndex(null);
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 py-1 px-2 rounded-lg border border-[#EAE6DF] text-xs text-amm-roast hover:bg-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => saveEdit(e, index)}
                      disabled={!editingName.trim()}
                      className="flex-1 py-1 px-2 rounded-lg bg-amm-mauve text-white text-xs font-bold hover:bg-amm-mauve-dark disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              );
            }

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
                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amm-sand text-amm-espresso'
                    }`}
                  >
                    {name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-xs block truncate">{name}</span>
                    <span
                      className={`text-[10px] block truncate ${
                        isSelected ? 'text-white/70' : 'text-amm-roast'
                      }`}
                    >
                      {isSelected ? '● Atendiendo en caja' : 'Toca para seleccionar'}
                    </span>
                  </div>
                </div>

                {/* Actions: Edit name and Delete button (Always visible and touch-friendly) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={(e) => startEditing(e, index, name)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-amm-roast hover:text-amm-espresso hover:bg-white border border-transparent hover:border-[#EAE6DF]'
                    }`}
                    title="Editar nombre"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button (if more than 1) */}
                  {team.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCollab(e, name)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSelected
                          ? 'text-white/60 hover:text-rose-300 hover:bg-white/10'
                          : 'text-amm-roast/60 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100'
                      }`}
                      title="Eliminar colaborador"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isSelected && (
                    <div className="ml-1 pl-1 border-l border-white/20">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add custom collaborator button/form */}
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

        {/* Footer info */}
        <div className="p-3.5 border-t border-[#F2ECE4] bg-[#FCFBF9] text-center">
          <p className="text-[10px] text-amm-roast">
            Puedes renombrar o eliminar cualquiera de los nombres de prueba tocando el lápiz o el basurero.
          </p>
        </div>
      </div>
    </div>
  );
}
