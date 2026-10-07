'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  Zap,
} from 'lucide-react';

export default function RecommendationsView() {
  const { products, sales, addProduct } = useApp();

  const salesMap: { [productId: string]: number } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
    });
  });

  const topSellers = products
    .map((p) => ({
      product: p,
      salesCount: (salesMap[p.id] || 0) + (p.category === 'cafe' ? 18 : p.category === 'panaderia' ? 12 : 5),
    }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 4);

  const slowMovers = products
    .filter((p) => p.category === 'postres' || p.category === 'bocados' || (p.isDirectStock && p.stockQuantity && p.stockQuantity <= 4))
    .slice(0, 3);

  const smartPromos = [
    {
      id: 'promo-1',
      title: 'Tarde Dulce: Café + Tarta Tartín',
      badge: 'Liquidación de Panadería',
      description: 'Impulsa la salida de postres del día combinándolos con un Latte caliente a precio preferencial.',
      originalPrice: 133,
      promoPrice: 105,
      discount: '21% OFF',
      benefit: 'Evita mermas de panadería fresca al final de la jornada.',
    },
    {
      id: 'promo-2',
      title: 'Dúo Mañanero Bocados & Cold Brew',
      badge: 'Combo Alta Rentabilidad',
      description: 'Promociona la Focaccia Serrano con Cold Brew Tonic para elevar el ticket promedio matutino.',
      originalPrice: 175,
      promoPrice: 149,
      discount: '15% OFF',
      benefit: 'Aumenta el ticket promedio por cliente en horas pico.',
    },
    {
      id: 'promo-3',
      title: '2x1 Última Hora en Pan Dulce',
      badge: 'Anticipación de Merma',
      description: 'Activar a partir de las 18:30 hrs para vaciar vitrina de croissants y roles de canela.',
      originalPrice: 96,
      promoPrice: 52,
      discount: '2x1',
      benefit: 'Recupera el costo base de producción antes del cierre.',
    },
  ];

  const handleActivatePromoInPOS = (promo: typeof smartPromos[0]) => {
    addProduct({
      name: promo.title,
      description: `${promo.description} (Promoción activa)`,
      category: 'paquetes',
      price: promo.promoPrice,
      cost: promo.promoPrice * 0.35,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      inStock: true,
      isDirectStock: false,
    });

    alert(`¡"${promo.title}" agregada al menú del POS como paquete activo!`);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-[#FAF8F5]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <h1 className="font-serif font-bold text-2xl text-amm-espresso tracking-tight">
            Rotación & Recomendaciones
          </h1>
          <p className="text-xs text-amm-roast mt-0.5">
            Detección de artículos estrella, productos con riesgo de merma y combos sugeridos.
          </p>
        </div>
      </div>

      {/* Grid: Top vs Slow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Sellers */}
        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
            <h2 className="font-serif font-bold text-base text-amm-espresso">
              Productos Más Vendidos
            </h2>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              Alta rotación
            </span>
          </div>

          <div className="space-y-2.5">
            {topSellers.map((item, idx) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-amm-roast w-4">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-amm-espresso">
                      {item.product.name}
                    </h3>
                    <span className="text-[10px] text-amm-roast">
                      Precio: ${item.product.price} • {(((item.product.price - item.product.cost) / item.product.price) * 100).toFixed(0)}% margen
                    </span>
                  </div>
                </div>

                <span className="font-serif font-bold text-xs text-amm-espresso">
                  ~{item.salesCount} vtas
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving */}
        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
            <h2 className="font-serif font-bold text-base text-amm-espresso">
              Baja Rotación / Riesgo de Merma
            </h2>
            <span className="text-[10px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
              Atención
            </span>
          </div>

          <div className="space-y-2.5">
            {slowMovers.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F5F2EB] overflow-hidden shrink-0">
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amm-espresso">
                      {prod.name}
                    </h3>
                    <span className="text-[10px] text-amber-800 font-medium">
                      {prod.stockQuantity ? `${prod.stockQuantity} pzas restantes` : 'Bajo movimiento'}
                    </span>
                  </div>
                </div>

                <span className="font-serif font-bold text-xs text-amm-espresso">
                  ${prod.price}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Suggested Combos */}
      <div className="space-y-4 pt-2">
        <h2 className="font-serif font-bold text-lg text-amm-espresso">
          Combos Sugeridos para Menú
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {smartPromos.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-2xl border border-[#EAE6DF] p-5 flex flex-col justify-between space-y-4 hover:border-amm-mauve/60 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amm-mauve-dark bg-amm-mauve/10 px-2 py-0.5 rounded-md uppercase">
                    {promo.badge}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {promo.discount}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-sm text-amm-espresso">
                  {promo.title}
                </h3>

                <p className="text-[11px] text-amm-roast leading-relaxed">
                  {promo.description}
                </p>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-serif font-bold text-xl text-amm-espresso">
                    ${promo.promoPrice}
                  </span>
                  <span className="text-xs line-through text-amm-roast">
                    ${promo.originalPrice}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleActivatePromoInPOS(promo)}
                className="w-full py-2 rounded-xl bg-amm-espresso hover:bg-[#3D352F] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amm-mint" />
                <span>Activar en POS</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
