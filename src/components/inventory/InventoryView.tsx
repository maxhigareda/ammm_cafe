'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SupplyItem, SupplyRequest } from '@/types';
import {
  Package,
  AlertTriangle,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Check,
  X,
} from 'lucide-react';

export default function InventoryView() {
  const {
    role,
    supplies,
    updateSupplyStock,
    addSupply,
    supplyRequests,
    createSupplyRequest,
    updateSupplyRequestStatus,
    collaboratorName,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAddSupplyModalOpen, setIsAddSupplyModalOpen] = useState(false);

  // New Request Form State
  const [reqSupplyName, setReqSupplyName] = useState('');
  const [reqQuantity, setReqQuantity] = useState('');
  const [reqUrgency, setReqUrgency] = useState<'alta' | 'media' | 'baja'>('alta');
  const [reqNotes, setReqNotes] = useState('');

  // New Supply Item State (Admin)
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyUnit, setNewSupplyUnit] = useState('kg');
  const [newSupplyStock, setNewSupplyStock] = useState('5');
  const [newSupplyMin, setNewSupplyMin] = useState('2');
  const [newSupplyCost, setNewSupplyCost] = useState('150');
  const [newSupplyCategory, setNewSupplyCategory] = useState<SupplyItem['category']>('cafe_grano');

  const filteredSupplies = supplies.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = supplies.filter((s) => s.currentStock <= s.minStock).length;
  const pendingRequestsCount = supplyRequests.filter((r) => r.status === 'pendiente').length;

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSupplyName.trim()) return;

    createSupplyRequest(reqSupplyName, reqNotes, reqUrgency, reqQuantity);
    setReqSupplyName('');
    setReqQuantity('');
    setReqNotes('');
    setIsRequestModalOpen(false);
  };

  const handleCreateSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplyName.trim()) return;

    addSupply({
      name: newSupplyName,
      unit: newSupplyUnit,
      currentStock: parseFloat(newSupplyStock) || 0,
      minStock: parseFloat(newSupplyMin) || 0,
      unitCost: parseFloat(newSupplyCost) || 0,
      category: newSupplyCategory,
    });

    setNewSupplyName('');
    setIsAddSupplyModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Banner / Hero */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amm-latte shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amm-mauve/20 text-amm-mauve-dark">
              {role === 'admin' ? 'Gestión Total de Almacén' : 'Control de Barra & Suministros'}
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-amm-espresso">
            Inventario & Faltantes
          </h2>
          <p className="text-xs text-amm-roast max-w-xl">
            {role === 'admin'
              ? 'Supervisa existencias mínimas de materias primas, costos de insumos y aprueba compras solicitadas por el equipo de barra.'
              : 'Revisa qué insumos están disponibles y envía solicitudes inmediatas al administrador cuando algo empiece a escasear.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-soft transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>Reportar Faltante</span>
          </button>

          {role === 'admin' && (
            <button
              onClick={() => setIsAddSupplyModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs shadow-soft transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-amm-latte shadow-xs">
          <span className="text-[11px] text-amm-roast font-semibold">Total Insumos</span>
          <div className="text-2xl font-black text-amm-espresso mt-1">
            {supplies.length}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-amm-latte shadow-xs">
          <span className="text-[11px] text-amm-roast font-semibold flex items-center gap-1 text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5" /> Stock Bajo
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {lowStockCount}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-amm-latte shadow-xs">
          <span className="text-[11px] text-amm-roast font-semibold flex items-center gap-1 text-rose-700">
            <Clock className="w-3.5 h-3.5" /> Solicitudes Pendientes
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {pendingRequestsCount}
          </div>
        </div>

        {role === 'admin' ? (
          <div className="p-4 rounded-3xl bg-white border border-amm-latte shadow-xs">
            <span className="text-[11px] text-amm-roast font-semibold">Valor Estimado Stock</span>
            <div className="text-2xl font-black text-amm-mauve-dark mt-1">
              ${supplies.reduce((sum, s) => sum + s.currentStock * s.unitCost, 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })} <span className="text-xs font-normal">MXN</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-white border border-amm-latte shadow-xs">
            <span className="text-[11px] text-amm-roast font-semibold">Estado de Barra</span>
            <div className="text-sm font-bold text-emerald-700 mt-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Operando Normal
            </div>
          </div>
        )}
      </div>

      {/* Pending Procurement Requests Section */}
      <div className="bg-white rounded-3xl border border-amm-latte shadow-card overflow-hidden">
        <div className="p-4 border-b border-amm-latte/60 flex items-center justify-between bg-amm-sand/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-base text-amm-espresso">
              Solicitudes de Compra Levantadas por el Equipo
            </h3>
          </div>
          <span className="text-xs text-amm-roast font-medium">
            {supplyRequests.length} registradas
          </span>
        </div>

        <div className="p-4 divide-y divide-amm-latte/40">
          {supplyRequests.length > 0 ? (
            supplyRequests.map((req) => {
              const isPending = req.status === 'pendiente';

              return (
                <div key={req.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-amm-espresso">
                        {req.supplyName}
                      </span>
                      {req.quantityNeeded && (
                        <span className="px-2 py-0.5 rounded-lg bg-amm-sand text-amm-roast text-xs font-semibold">
                          {req.quantityNeeded}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          req.urgency === 'alta'
                            ? 'bg-rose-100 text-rose-800'
                            : req.urgency === 'media'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Urgencia {req.urgency}
                      </span>
                    </div>

                    <p className="text-xs text-amm-roast">
                      {req.notes || 'Sin notas adicionales.'}
                    </p>

                    <div className="text-[10px] text-amm-roast/80 flex items-center gap-3">
                      <span>Solicitado por: <strong>{req.requestedBy}</strong></span>
                      <span>•</span>
                      <span>{req.requestedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isPending ? (
                      <>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          Pendiente
                        </span>

                        {role === 'admin' && (
                          <button
                            onClick={() => updateSupplyRequestStatus(req.id, 'comprado')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Marcar Comprado</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Comprado
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-xs text-amm-roast italic">
              No hay solicitudes de compra pendientes.
            </p>
          )}
        </div>
      </div>

      {/* Supplies Table */}
      <div className="bg-white rounded-3xl border border-amm-latte shadow-card overflow-hidden">
        <div className="p-4 border-b border-amm-latte/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amm-sand/30">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amm-mauve" />
            <h3 className="font-serif font-bold text-base text-amm-espresso">
              Catálogo de Existencias de Insumos Base
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amm-roast" />
            <input
              type="text"
              placeholder="Filtrar insumo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-amm-latte focus:outline-none focus:ring-2 focus:ring-amm-mauve"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amm-sand/50 text-amm-roast border-b border-amm-latte uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Insumo</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Existencia Actual</th>
                <th className="py-3 px-4">Stock Mínimo</th>
                <th className="py-3 px-4">Estado</th>
                {role === 'admin' && (
                  <>
                    <th className="py-3 px-4">Costo Unitario</th>
                    <th className="py-3 px-4 text-right">Ajuste Rápido</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-amm-latte/40 text-amm-espresso">
              {filteredSupplies.map((item) => {
                const isLow = item.currentStock <= item.minStock;

                return (
                  <tr key={item.id} className="hover:bg-amm-cream/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-amm-roast">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-sm">
                      {item.currentStock} <span className="text-xs font-normal text-amm-roast">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-amm-roast">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" /> Faltante
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          Óptimo
                        </span>
                      )}
                    </td>

                    {role === 'admin' && (
                      <>
                        <td className="py-3.5 px-4 font-medium text-amm-roast">
                          ${item.unitCost.toFixed(2)} / {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => updateSupplyStock(item.id, Math.max(0, item.currentStock - 1))}
                              className="px-2 py-0.5 rounded-lg border border-amm-latte bg-white hover:bg-amm-sand font-bold text-xs text-amm-roast"
                              title="Restar 1"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => updateSupplyStock(item.id, item.currentStock + 1)}
                              className="px-2 py-0.5 rounded-lg border border-amm-latte bg-white hover:bg-amm-sand font-bold text-xs text-amm-roast"
                              title="Sumar 1"
                            >
                              +1
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Report Shortage / Supply Request */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-card border border-amm-latte p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amm-latte">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif font-bold text-lg text-amm-espresso">
                  Reportar Faltante o Insumo
                </h3>
              </div>
              <button onClick={() => setIsRequestModalOpen(false)}>
                <X className="w-5 h-5 text-amm-roast" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  ¿Qué insumo hace falta? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Leche de Avena, Vasos 12oz, Servilletas..."
                  value={reqSupplyName}
                  onChange={(e) => setReqSupplyName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Cantidad sugerida
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1 caja (12 L), 2 paquetes, 5 kg..."
                  value={reqQuantity}
                  onChange={(e) => setReqQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Urgencia
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['baja', 'media', 'alta'] as const).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setReqUrgency(urg)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                        reqUrgency === urg
                          ? urg === 'alta'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : urg === 'media'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-amm-sand text-amm-roast border-amm-latte'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Notas para la compra
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales sobre la marca, estado en barra..."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-amm-latte text-xs font-bold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-soft"
                >
                  Enviar al Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Supply Item (Admin only) */}
      {isAddSupplyModalOpen && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-card border border-amm-latte p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amm-latte">
              <h3 className="font-serif font-bold text-lg text-amm-espresso">
                Alta de Nuevo Insumo
              </h3>
              <button onClick={() => setIsAddSupplyModalOpen(false)}>
                <X className="w-5 h-5 text-amm-roast" />
              </button>
            </div>

            <form onSubmit={handleCreateSupply} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Jarabe de Avellana tostada"
                  value={newSupplyName}
                  onChange={(e) => setNewSupplyName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={newSupplyUnit}
                    onChange={(e) => setNewSupplyUnit(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream"
                  >
                    <option value="kg">kg (Kilogramos)</option>
                    <option value="L">L (Litros)</option>
                    <option value="piezas">piezas</option>
                    <option value="paquetes">paquetes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    Categoría
                  </label>
                  <select
                    value={newSupplyCategory}
                    onChange={(e) => setNewSupplyCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream"
                  >
                    <option value="cafe_grano">Café Grano</option>
                    <option value="lacteos">Lácteos & Bebidas</option>
                    <option value="jarabes">Jarabes & Polvos</option>
                    <option value="desechables">Desechables</option>
                    <option value="panaderia_insumos">Panadería</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-amm-espresso mb-1">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newSupplyStock}
                    onChange={(e) => setNewSupplyStock(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amm-latte"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amm-espresso mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newSupplyMin}
                    onChange={(e) => setNewSupplyMin(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amm-latte"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amm-espresso mb-1">
                    Costo Unitario ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newSupplyCost}
                    onChange={(e) => setNewSupplyCost(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-amm-latte"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddSupplyModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-amm-latte text-xs font-bold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white text-xs font-bold shadow-soft"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
