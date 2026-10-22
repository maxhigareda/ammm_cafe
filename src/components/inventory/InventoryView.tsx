'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SupplyItem, SupplyRequest, Product } from '@/types';
import {
  Package,
  Plus,
  Send,
  CheckCircle2,
  Search,
  Check,
  X,
  Trash2,
  Coffee,
  AlertCircle,
} from 'lucide-react';
import { getProductSizeLabel } from '@/lib/productUtils';

export default function InventoryView() {
  const {
    role,
    supplies,
    updateSupplyStock,
    addSupply,
    deleteSupply,
    supplyRequests,
    createSupplyRequest,
    updateSupplyRequestStatus,
    collaboratorName,
    products,
    updateProduct,
    deleteProduct,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'insumos' | 'productos'>('insumos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAddSupplyModalOpen, setIsAddSupplyModalOpen] = useState(false);
  const [toastAlert, setToastAlert] = useState<string | null>(null);

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

  // Trigger feedback toast
  const showToast = (message: string) => {
    setToastAlert(message);
    setTimeout(() => setToastAlert(null), 3500);
  };

  // Filter supplies
  const filteredSupplies = supplies.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter products with direct stock
  const directStockProducts = products.filter((p) => p.isDirectStock);
  const filteredProducts = directStockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockSuppliesCount = supplies.filter((s) => s.currentStock <= s.minStock).length;
  const lowStockProductsCount = directStockProducts.filter((p) => (p.stockQuantity ?? 0) <= 3).length;
  const totalLowStock = lowStockSuppliesCount + lowStockProductsCount;
  const pendingRequestsCount = supplyRequests.filter((r) => r.status === 'pendiente').length;

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSupplyName.trim()) return;

    createSupplyRequest(reqSupplyName, reqNotes, reqUrgency, reqQuantity);
    setReqSupplyName('');
    setReqQuantity('');
    setReqNotes('');
    setIsRequestModalOpen(false);
    showToast('Reporte de insumo faltante enviado.');
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
    showToast(`Insumo "${newSupplyName}" agregado al inventario.`);
  };

  const handleDeleteSupply = (id: string, name: string) => {
    if (confirm(`¿Eliminar "${name}" del inventario? Ya no aparecerá en la lista de insumos.`)) {
      deleteSupply(id);
      showToast(`Insumo "${name}" eliminado del inventario.`);
    }
  };

  const handleUpdateProductStock = (prod: Product, delta: number) => {
    const current = prod.stockQuantity ?? 0;
    const newQty = Math.max(0, current + delta);
    updateProduct(prod.id, {
      stockQuantity: newQty,
      inStock: newQty > 0,
    });
  };

  const handleDeleteProduct = (prod: Product) => {
    if (confirm(`¿Eliminar "${prod.name}" del catálogo y menú? Ya no aparecerá en el punto de venta ni en inventario.`)) {
      deleteProduct(prod.id);
      showToast(`Producto "${prod.name}" eliminado del catálogo.`);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-[#FAF8F5]">
      
      {/* Toast Alert */}
      {toastAlert && (
        <div className="fixed top-5 right-5 z-50 bg-amm-espresso text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-card flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200 border border-amm-mauve/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastAlert}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <h1 className="font-serif font-bold text-2xl text-amm-espresso tracking-tight">
            Inventario & Suministros
          </h1>
          <p className="text-xs text-amm-roast mt-0.5">
            {role === 'admin'
              ? 'Control de materias primas, stock de productos del menú y pedidos de la barra.'
              : 'Existencias de barra y reporte rápido de insumos faltantes para compra.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Reportar Faltante</span>
          </button>

          {role === 'admin' && activeTab === 'insumos' && (
            <button
              onClick={() => setIsAddSupplyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1 shadow-2xs">
          <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
            Insumos & Productos
          </span>
          <div className="font-serif font-black text-2xl text-amm-espresso">
            {supplies.length + directStockProducts.length}
          </div>
          <span className="text-[10px] text-amm-roast">
            {supplies.length} insumos • {directStockProducts.length} prod. con stock
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1 shadow-2xs">
          <span className="text-[11px] font-medium text-amber-800 uppercase tracking-wider block">
            Stock Bajo / Faltante
          </span>
          <div className="font-serif font-black text-2xl text-amber-700">
            {totalLowStock}
          </div>
          <span className="text-[10px] text-amm-roast">
            {lowStockSuppliesCount} insumos • {lowStockProductsCount} productos
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1 shadow-2xs">
          <span className="text-[11px] font-medium text-rose-800 uppercase tracking-wider block">
            Solicitudes Pendientes
          </span>
          <div className="font-serif font-black text-2xl text-rose-700">
            {pendingRequestsCount}
          </div>
          <span className="text-[10px] text-amm-roast">
            Reportadas por el equipo
          </span>
        </div>

        {role === 'admin' ? (
          <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1 shadow-2xs">
            <span className="text-[11px] font-medium text-amm-roast uppercase tracking-wider block">
              Valor Estimado Stock
            </span>
            <div className="font-serif font-black text-2xl text-amm-mauve-dark">
              ${supplies.reduce((sum, s) => sum + s.currentStock * s.unitCost, 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })} <span className="text-xs font-sans font-normal text-amm-roast">MXN</span>
            </div>
            <span className="text-[10px] text-amm-roast">
              Basado en costo unitario
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-1 shadow-2xs">
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
        <div className="bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden shadow-2xs">
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

      {/* Main Inventory Container with Tabs */}
      <div className="bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden shadow-2xs">
        
        {/* Table Top Toolbar: Tabs & Search */}
        <div className="p-5 border-b border-[#F2ECE4] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FCFBF9]">
          
          {/* Sub-tabs: Insumos vs Productos del Menú */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EAE6DF] shadow-2xs self-start">
            <button
              onClick={() => setActiveTab('insumos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'insumos'
                  ? 'bg-amm-espresso text-white shadow-xs'
                  : 'text-amm-roast hover:text-amm-espresso'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Insumos Base ({supplies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('productos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'productos'
                  ? 'bg-amm-espresso text-white shadow-xs'
                  : 'text-amm-roast hover:text-amm-espresso'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Productos con Stock ({directStockProducts.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amm-roast/60" />
            <input
              type="text"
              placeholder={activeTab === 'insumos' ? 'Buscar insumo...' : 'Buscar producto...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#EAE6DF] focus:outline-none focus:border-amm-mauve"
            />
          </div>

        </div>

        {/* TAB 1: INSUMOS BASE TABLE */}
        {activeTab === 'insumos' && (
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
                      <th className="py-3 px-5 text-right">Ajuste & Borrar</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EB] text-amm-espresso">
                {filteredSupplies.length > 0 ? (
                  filteredSupplies.map((item) => {
                    const isLow = item.currentStock <= item.minStock;
                    const isZero = item.currentStock === 0;

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
                            <span className={`w-2 h-2 rounded-full ${isZero ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span className={`text-[11px] font-medium ${isZero ? 'text-rose-700 font-bold' : isLow ? 'text-amber-700' : 'text-emerald-700'}`}>
                              {isZero ? 'Agotado (0)' : isLow ? 'Faltante' : 'Óptimo'}
                            </span>
                          </div>
                        </td>

                        {role === 'admin' && (
                          <>
                            <td className="py-3.5 px-5 text-amm-roast">
                              ${item.unitCost.toFixed(2)} / {item.unit}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="inline-flex items-center gap-1 justify-end">
                                {/* Minus button */}
                                <button
                                  onClick={() => updateSupplyStock(item.id, Math.max(0, item.currentStock - 1))}
                                  className="w-6 h-6 rounded-lg border border-[#EAE6DF] hover:bg-white text-xs font-bold text-amm-roast flex items-center justify-center transition-colors"
                                  title="Disminuir stock (-1)"
                                >
                                  -
                                </button>
                                {/* Plus button */}
                                <button
                                  onClick={() => updateSupplyStock(item.id, item.currentStock + 1)}
                                  className="w-6 h-6 rounded-lg border border-[#EAE6DF] hover:bg-white text-xs font-bold text-amm-roast flex items-center justify-center transition-colors"
                                  title="Aumentar stock (+1)"
                                >
                                  +
                                </button>
                                {/* Delete button next to +- */}
                                <button
                                  onClick={() => handleDeleteSupply(item.id, item.name)}
                                  className="w-6 h-6 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-amm-roast hover:text-rose-600 flex items-center justify-center transition-colors ml-1"
                                  title={`Eliminar "${item.name}" del inventario`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={role === 'admin' ? 7 : 5} className="py-8 text-center text-xs text-amm-roast italic">
                      No se encontraron insumos con ese criterio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PRODUCTOS DEL MENÚ CON STOCK DIRECTO */}
        {activeTab === 'productos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FCFBF9] text-amm-roast/80 border-b border-[#F2ECE4] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-5">Producto</th>
                  <th className="py-3 px-5">Categoría</th>
                  <th className="py-3 px-5">Stock Disponible</th>
                  <th className="py-3 px-5">Precio</th>
                  <th className="py-3 px-5">Estado</th>
                  {role === 'admin' && (
                    <th className="py-3 px-5 text-right">Ajuste & Borrar</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EB] text-amm-espresso">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod) => {
                    const size = getProductSizeLabel(prod);
                    const qty = prod.stockQuantity ?? 0;
                    const isZero = qty === 0;
                    const isLow = qty > 0 && qty <= 3;

                    return (
                      <tr key={prod.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#F5F2EB] overflow-hidden shrink-0 border border-[#EAE6DF]">
                              <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-amm-espresso">{prod.name}</span>
                                {size && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#F2ECE4] text-amm-mauve-dark border border-[#EAE6DF] uppercase">
                                    {size}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-amm-roast">Costo: ${prod.cost.toFixed(2)}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 capitalize text-amm-roast">
                          {prod.category.replace('_', ' ')}
                        </td>

                        <td className="py-3.5 px-5 font-serif font-bold text-sm">
                          {qty} <span className="text-xs font-sans font-normal text-amm-roast">pzas</span>
                        </td>

                        <td className="py-3.5 px-5 font-serif font-bold text-sm text-amm-espresso">
                          ${prod.price.toFixed(0)}
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isZero ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span className={`text-[11px] font-medium ${isZero ? 'text-rose-700 font-bold' : isLow ? 'text-amber-700 font-semibold' : 'text-emerald-700'}`}>
                              {isZero ? 'Agotado (0 pzas)' : isLow ? 'Stock Bajo' : 'Disponible'}
                            </span>
                          </div>
                        </td>

                        {role === 'admin' && (
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              {/* Minus button */}
                              <button
                                onClick={() => handleUpdateProductStock(prod, -1)}
                                className="w-6 h-6 rounded-lg border border-[#EAE6DF] hover:bg-white text-xs font-bold text-amm-roast flex items-center justify-center transition-colors"
                                title="Disminuir stock (-1)"
                              >
                                -
                              </button>
                              {/* Plus button */}
                              <button
                                onClick={() => handleUpdateProductStock(prod, 1)}
                                className="w-6 h-6 rounded-lg border border-[#EAE6DF] hover:bg-white text-xs font-bold text-amm-roast flex items-center justify-center transition-colors"
                                title="Aumentar stock (+1)"
                              >
                                +
                              </button>
                              {/* Delete button next to +- */}
                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                className="w-6 h-6 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-amm-roast hover:text-rose-600 flex items-center justify-center transition-colors ml-1"
                                title={`Eliminar "${prod.name}" del menú`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={role === 'admin' ? 6 : 5} className="py-8 text-center text-xs text-amm-roast italic">
                      No hay productos con control de stock directo registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
