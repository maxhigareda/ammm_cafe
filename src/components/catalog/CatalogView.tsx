'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Product, Category } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

export default function CatalogView() {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductStock } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'todos'>>('cafe');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDirectStock, setIsDirectStock] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('');

  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'todos' || prod.category === selectedCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory('cafe');
    setPrice('');
    setCost('');
    setImageUrl('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80');
    setIsDirectStock(false);
    setStockQuantity('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setCost(prod.cost.toString());
    setImageUrl(prod.imageUrl);
    setIsDirectStock(prod.isDirectStock);
    setStockQuantity(prod.stockQuantity?.toString() || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const parsedPrice = parseFloat(price) || 0;
    const parsedCost = parseFloat(cost) || 0;
    const parsedStock = isDirectStock ? parseInt(stockQuantity) || 0 : undefined;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        description,
        category,
        price: parsedPrice,
        cost: parsedCost,
        imageUrl: imageUrl || editingProduct.imageUrl,
        isDirectStock,
        stockQuantity: parsedStock,
        inStock: isDirectStock ? (parsedStock || 0) > 0 : true,
      });
    } else {
      addProduct({
        name,
        description,
        category,
        price: parsedPrice,
        cost: parsedCost,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        inStock: true,
        isDirectStock,
        stockQuantity: parsedStock,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-[#FAF8F5]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <h1 className="font-serif font-bold text-2xl text-amm-espresso tracking-tight">
            Catálogo & Menú
          </h1>
          <p className="text-xs text-amm-roast mt-0.5">
            Alta, edición de precios y control de visibilidad en el punto de venta.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amm-roast/60" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#EAE6DF] focus:outline-none focus:border-amm-mauve"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
          {['todos', 'cafe', 'panaderia', 'bocados', 'bebidas_frias', 'postres', 'paquetes'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amm-espresso text-white font-semibold'
                  : 'bg-white border border-[#EAE6DF] text-amm-roast hover:bg-[#FAF8F5]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((prod) => {
          const margin = prod.price > 0 ? (((prod.price - prod.cost) / prod.price) * 100).toFixed(0) : 0;

          return (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden flex flex-col justify-between transition-all ${
                !prod.inStock ? 'opacity-50' : 'hover:border-amm-mauve/60'
              }`}
            >
              <div className="relative aspect-[4/3] w-full bg-[#F5F2EB] overflow-hidden">
                <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                  <button
                    onClick={() => toggleProductStock(prod.id)}
                    className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-xs flex items-center justify-center text-amm-espresso hover:bg-white transition-colors"
                    title={prod.inStock ? 'Ocultar' : 'Mostrar'}
                  >
                    {prod.inStock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-xs sm:text-sm text-amm-espresso leading-snug line-clamp-1">
                      {prod.name}
                    </h3>
                    <span className="font-serif font-bold text-xs sm:text-sm text-amm-espresso shrink-0">
                      ${prod.price.toFixed(0)}
                    </span>
                  </div>

                  <p className="text-[11px] text-amm-roast line-clamp-2 mt-1">
                    {prod.description}
                  </p>

                  <div className="text-[10px] text-amm-roast mt-2">
                    Costo: ${prod.cost.toFixed(2)} • {margin}% margen
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EB] text-xs">
                  <span className={`text-[11px] font-medium ${prod.inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {prod.inStock ? '● Activo' : '○ Inactivo'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-lg text-amm-roast hover:text-amm-espresso hover:bg-[#FAF8F5]"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(prod.id)}
                      className="p-1.5 rounded-lg text-amm-roast hover:text-rose-600 hover:bg-rose-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#EAE6DF] p-6 space-y-4 shadow-card max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
              <h3 className="font-serif font-bold text-base text-amm-espresso">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-amm-roast" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Latte Lavanda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]"
                  >
                    <option value="cafe">Café</option>
                    <option value="panaderia">Panadería</option>
                    <option value="bocados">Bocados</option>
                    <option value="bebidas_frias">Bebidas Frías</option>
                    <option value="postres">Postres</option>
                    <option value="paquetes">Combos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    Precio ($) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    Costo Insumos ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amm-espresso mb-1">
                    URL de Foto
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amm-espresso mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
