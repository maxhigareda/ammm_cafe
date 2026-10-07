'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SupplyItem, SupplyRequest } from '@/types';
import {
  Package,
  Plus,
  Send,
  CheckCircle2,
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
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-[#FAF8F5]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <h1 className="font-serif font-bold text-2xl text-amm-espresso tracking-tight">
            Inventario & Suministros
          </h1>
          <p className="text-xs text-amm-roast mt-0.5">
            {role === 'admin'
              ? 'Control de materias primas, costos y pedidos pendientes de la barra.'
              : 'Existencias de barra y reporte rápido de insumos faltantes para compra.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Reportar Faltante</span>
          </button>

          {role === 'admin' && (
            <button
              onClick={() => setIsAddSupplyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
          <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
            Total Insumos
          </span>
          <div className="font-serif font-black text-2xl text-amm-espresso">
            {supplies.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
          <span className="text-[11px] font-medium text-amber-800 uppercase tracking-wider block">
            Stock Bajo
          </span>
          <div className="font-serif font-black text-2xl text-amber-700">
            {lowStockCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
          <span className="text-[11px] font-medium text-rose-800 uppercase tracking-wider block">
            Solicitudes Pendientes
          </span>
          <div className="font-serif font-black text-2xl text-rose-700">
            {pendingRequestsCount}
          </div>
        </div>

        {role === 'admin' ? (
          <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
            <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
              Valor Estimado Stock
            </span>
            <div className="font-serif font-black text-2xl text-amm-mauve-dark">
              ${supplies.reduce((sum, s) => sum + s.currentStock * s.unitCost, 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })} <span className="text-xs font-sans font-normal text-amm-roast">MXN</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
            <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
              Estado de Barra
            </span>
            <div className="text-xs font-bold text-emerald-800 pt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Operando Normal
            </div>
          </div>
        )}
      </div>

      {/* Pending Requests Section (if any) */}
      {supplyRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden">
          <div className="p-5 border-b border-[#F2ECE4] flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-amm-espresso">
              Solicitudes de Compra del Equipo
            </h2>
            <span className="text-xs text-amm-roast">
              {pendingRequestsCount} pendientes
            </span>
          </div>

          <div className="p-5 divide-y divide-[#F5F2EB]">
            {supplyRequests.map((req) => {
              const isPending = req.status === 'pendiente';

              return (
                <div key={req.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amm-espresso">
                        {req.supplyName}
                      </span>
                      {req.quantityNeeded && (
                        <span className="text-[11px] text-amm-roast px-1.5 py-0.5 rounded bg-[#FAF8F5]">
                          {req.quantityNeeded}
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        req.urgency === 'alta' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Urgencia {req.urgency}
                      </span>
                    </div>

                    <p className="text-[11px] text-amm-roast">
                      {req.notes || 'Sin observaciones.'} • Por {req.requestedBy}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isPending ? (
                      role === 'admin' && (
                        <button
                          onClick={() => updateSupplyRequestStatus(req.id, 'comprado')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Marcar Comprado</span>
                        </button>
                      )
                    ) : (
                      <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Comprado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Supplies Table */}
      <div className="bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden">
        <div className="p-5 border-b border-[#F2ECE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-serif font-bold text-base text-amm-espresso">
            Existencias de Insumos Base
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amm-roast/60" />
            <input
              type="text"
              placeholder="Buscar insumo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] focus:outline-none focus:border-amm-mauve"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FCFBF9] text-amm-roast/80 border-b border-[#F2ECE4] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Insumo</th>
                <th className="py-3 px-5">Categoría</th>
                <th className="py-3 px-5">Existencia</th>
                <th className="py-3 px-5">Mínimo</th>
                <th className="py-3 px-5">Estado</th>
                {role === 'admin' && (
                  <>
                    <th className="py-3 px-5">Costo Unitario</th>
                    <th className="py-3 px-5 text-right">Ajuste</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] text-amm-espresso">
              {filteredSupplies.map((item) => {
                const isLow = item.currentStock <= item.minStock;

                return (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-5 font-medium">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-5 capitalize text-amm-roast">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-5 font-serif font-bold text-sm">
                      {item.currentStock} <span className="text-xs font-sans font-normal text-amm-roast">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-5 text-amm-roast">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className={`text-[11px] font-medium ${isLow ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {isLow ? 'Faltante' : 'Óptimo'}
                        </span>
                      </div>
                    </td>

                    {role === 'admin' && (
                      <>
                        <td className="py-3.5 px-5 text-amm-roast">
                          ${item.unitCost.toFixed(2)} / {item.unit}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => updateSupplyStock(item.id, Math.max(0, item.currentStock - 1))}
                              className="w-6 h-6 rounded-lg border border-[#EAE6DF] hover:bg-[#FAF8F5] text-xs font-bold text-amm-roast flex items-center justify-center"
                            >
                              -
                            </button>
                            <button
                              onClick={() => updateSupplyStock(item.id, item.currentStock + 1)}
                              className="w-6 h-6 rounded-lg border border-[#EAE6DF] hover:bg-[#FAF8F5] text-xs font-bold text-amm-roast flex items-center justify-center"
                            >
                              +
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

      {/* Modal: Report Shortage */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#EAE6DF] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
              <h3 className="font-serif font-bold text-base text-amm-espresso">
                Reportar Insumo Faltante
              </h3>
              <button onClick={() => setIsRequestModalOpen(false)}>
                <X className="w-4 h-4 text-amm-roast" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  ¿Qué insumo hace falta? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Leche de Avena, Vasos 12 oz..."
                  value={reqSupplyName}
                  onChange={(e) => setReqSupplyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Cantidad aproximada
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1 caja, 5 kg, 2 mangas..."
                  value={reqQuantity}
                  onChange={(e) => setReqQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Urgencia
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['baja', 'media', 'alta'] as const).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setReqUrgency(urg)}
                      className={`py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        reqUrgency === urg
                          ? 'bg-amm-espresso text-white border-amm-espresso'
                          : 'bg-[#FAF8F5] text-amm-roast border-[#EAE6DF]'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Notas adicionales
                </label>
                <textarea
                  rows={2}
                  placeholder="Observaciones de barra..."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#EAE6DF] text-xs font-semibold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  Enviar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Supply Item (Admin only) */}
      {isAddSupplyModalOpen && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#EAE6DF] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
              <h3 className="font-serif font-bold text-base text-amm-espresso">
                Alta de Insumo
              </h3>
              <button onClick={() => setIsAddSupplyModalOpen(false)}>
                <X className="w-4 h-4 text-amm-roast" />
              </button>
            </div>

            <form onSubmit={handleCreateSupply} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Jarabe de Avellana"
                  value={newSupplyName}
                  onChange={(e) => setNewSupplyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    Unidad
                  </label>
                  <select
                    value={newSupplyUnit}
                    onChange={(e) => setNewSupplyUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="piezas">piezas</option>
                    <option value="paquetes">paquetes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    Categoría
                  </label>
                  <select
                    value={newSupplyCategory}
                    onChange={(e) => setNewSupplyCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]"
                  >
                    <option value="cafe_grano">Café Grano</option>
                    <option value="lacteos">Lácteos</option>
                    <option value="jarabes">Jarabes</option>
                    <option value="desechables">Desechables</option>
                    <option value="panaderia_insumos">Panadería</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-amm-espresso mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newSupplyStock}
                    onChange={(e) => setNewSupplyStock(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#EAE6DF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amm-espresso mb-1">
                    Mínimo
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newSupplyMin}
                    onChange={(e) => setNewSupplyMin(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#EAE6DF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amm-espresso mb-1">
                    Costo ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newSupplyCost}
                    onChange={(e) => setNewSupplyCost(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-[#EAE6DF]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplyModalOpen(false)}
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

    </div>
  );
}
