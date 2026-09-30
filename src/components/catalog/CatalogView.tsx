'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Product, Category } from '@/types';
import {
  Coffee,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Search,
  AlertTriangle,
  Eye,
  EyeOff,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amm-latte shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amm-mauve/20 text-amm-mauve-dark">
              Catálogo & Menú
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-amm-espresso">
            Gestión de Productos
          </h2>
          <p className="text-xs text-amm-roast max-w-xl">
            Edita precios, fotos, descripciones y controla qué productos se ofrecen en tiempo real en la pantalla de cobro del colaborador.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amm-mauve hover:bg-amm-mauve-dark text-white font-bold text-xs shadow-soft transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amm-roast" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-2xl bg-white border border-amm-latte focus:outline-none focus:ring-2 focus:ring-amm-mauve shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
          {['todos', 'cafe', 'panaderia', 'bocados', 'bebidas_frias', 'postres', 'paquetes'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-amm-espresso text-white border-amm-espresso font-bold'
                  : 'bg-white border-amm-latte text-amm-roast hover:bg-amm-sand'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => {
          const margin = prod.price > 0 ? (((prod.price - prod.cost) / prod.price) * 100).toFixed(0) : 0;

          return (
            <div
              key={prod.id}
              className={`bg-white rounded-3xl border border-amm-latte shadow-card overflow-hidden flex flex-col justify-between transition-all ${
                !prod.inStock ? 'opacity-65' : ''
              }`}
            >
              <div className="relative h-40 w-full bg-amm-sand overflow-hidden">
                <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/90 text-amm-espresso backdrop-blur-xs">
                  {prod.category.replace('_', ' ')}
                </span>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => toggleProductStock(prod.id)}
                    className={`p-1.5 rounded-xl backdrop-blur-md transition-colors ${
                      prod.inStock
                        ? 'bg-emerald-500/90 hover:bg-emerald-600 text-white'
                        : 'bg-rose-600/90 hover:bg-rose-700 text-white'
                    }`}
                    title={prod.inStock ? 'Marcar agotado' : 'Marcar disponible'}
                  >
                    {prod.inStock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif font-bold text-base leading-tight">
                    {prod.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="font-black text-sm text-amm-mint">
                      ${prod.price.toFixed(2)} MXN
                    </span>
                    <span className="text-[10px] text-white/90 font-medium">
                      Costo: ${prod.cost.toFixed(2)} ({margin}% margen)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-amm-roast line-clamp-2">
                  {prod.description || 'Sin descripción.'}
                </p>

                {prod.isDirectStock && (
                  <div className="p-2.5 rounded-xl bg-amm-sand text-xs flex items-center justify-between">
                    <span className="text-[11px] text-amm-roast">Existencias contadas:</span>
                    <span className="font-bold text-amm-espresso">{prod.stockQuantity || 0} piezas</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-amm-latte/60">
                  <span className={`text-[10px] font-extrabold uppercase ${prod.inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {prod.inStock ? '● Activo en POS' : '○ Oculto / Agotado'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-xl hover:bg-amm-sand text-amm-roast hover:text-amm-espresso transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(prod.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-card border border-amm-latte p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amm-latte">
              <h3 className="font-serif font-bold text-lg text-amm-espresso">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-amm-roast" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Flat White con Avena"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream"
                  >
                    <option value="cafe">Café</option>
                    <option value="panaderia">Panadería</option>
                    <option value="bocados">Bocados</option>
                    <option value="bebidas_frias">Bebidas Frías</option>
                    <option value="postres">Postres</option>
                    <option value="paquetes">Combos & Paquetes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    Precio Venta ($ MXN) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="55.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    Costo Estimado de Insumos ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="12.50"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amm-espresso mb-1">
                    URL de la Fotografía
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amm-espresso mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre ingredientes, origen y preparación..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amm-latte bg-amm-cream focus:bg-white"
                />
              </div>

              {/* Direct Stock checkbox */}
              <div className="p-3.5 rounded-2xl bg-amm-sand/50 border border-amm-latte space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDirectStock}
                    onChange={(e) => setIsDirectStock(e.target.checked)}
                    className="rounded accent-amm-mauve"
                  />
                  <span className="text-xs font-bold text-amm-espresso">
                    Controlar inventario por piezas directas (Ej. Pan dulce, bocados)
                  </span>
                </label>

                {isDirectStock && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-amm-roast mb-1">
                      Piezas disponibles en vitrina:
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-32 px-3 py-1.5 text-xs rounded-xl border border-amm-latte bg-white font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-amm-latte text-xs font-bold text-amm-roast"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amm-mauve hover:bg-amm-mauve-dark text-white text-xs font-bold shadow-soft"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
