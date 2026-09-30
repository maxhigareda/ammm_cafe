'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  Flame,
  TrendingDown,
  Gift,
  Clock,
  ArrowRight,
  CheckCircle2,
  Tag,
  Zap,
} from 'lucide-react';

export default function RecommendationsView() {
  const { products, sales, addProduct } = useApp();

  // Calculate product sales counts from sales history
  const salesMap: { [productId: string]: number } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
    });
  });

  // Top Sellers (Simulated + real)
  const topSellers = products
    .map((p) => ({
      product: p,
      salesCount: (salesMap[p.id] || 0) + (p.category === 'cafe' ? 18 : p.category === 'panaderia' ? 12 : 5),
    }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 4);

  // Slow Moving items (Products with low direct stock movement or low sales)
  const slowMovers = products
    .filter((p) => p.category === 'postres' || p.category === 'bocados' || (p.isDirectStock && p.stockQuantity && p.stockQuantity <= 4))
    .slice(0, 3);

  // Suggested promotions
  const smartPromos = [
    {
      id: 'promo-1',
      title: 'Tarde Dulce: Café + Tarta Tartín',
      badge: 'Liquidación de Panadería',
      description: 'Impulsa la salida de tartas y postres horneados del día combinándolos con un Latte caliente a precio preferencial.',
      originalPrice: 133,
      promoPrice: 105,
      discount: '21% OFF',
      targetProductId: 'prod-11',
      benefit: 'Evita mermas de panadería fresca al final de la jornada.',
    },
    {
      id: 'promo-2',
      title: 'Dúo Mañanero Bocados & Cold Brew',
      badge: 'Combo Alta Rentabilidad',
      description: 'Promociona la Focaccia Serrano con Cold Brew Tonic para elevar el ticket promedio matutino a más de $140 MXN.',
      originalPrice: 175,
      promoPrice: 149,
      discount: '15% OFF',
      targetProductId: 'prod-5',
      benefit: 'Aumenta el ticket promedio por cliente en horas pico.',
    },
    {
      id: 'promo-3',
      title: '2x1 Última Hora en Pan Dulce',
      badge: 'Anticipación de Merma',
      description: 'Activar a partir de las 18:30 hrs para vaciar vitrina de croissants y roles de canela sin pérdida de costo de insumo.',
      originalPrice: 96,
      promoPrice: 52,
      discount: '2x1',
      targetProductId: 'prod-7',
      benefit: 'Recupera el costo base de producción antes del cierre.',
    },
  ];

  const handleActivatePromoInPOS = (promo: typeof smartPromos[0]) => {
    // Add combo as a package in the live catalog
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

    alert(`¡"${promo.title}" ha sido agregada como paquete activo al menú del POS! Los colaboradores ya pueden cobrarlo.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-amm-latte shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amm-mint text-emerald-950">
              Motor de Recomendaciones & Combos
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-amm-espresso">
            Rotación de Menú & Promociones
          </h2>
          <p className="text-xs text-amm-roast max-w-xl">
            Detecta qué productos vuelan de la barra y cuáles se están quedando rezagados para lanzar promociones oportunas que protejan tu margen y eviten el desperdicio.
          </p>
        </div>
      </div>

      {/* Grid: Top Sellers vs Slow Moving */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Sellers (Estrellas) */}
        <div className="bg-white rounded-3xl border border-amm-latte p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amm-latte/60">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Flame className="w-4 h-4 fill-amber-500" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-amm-espresso">
                  Productos Estrella (Más Vendidos)
                </h3>
                <p className="text-[11px] text-amm-roast">
                  Alta rotación y preferencia de clientes
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
              Mantener Stock
            </span>
          </div>

          <div className="space-y-3">
            {topSellers.map((item, idx) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 rounded-2xl bg-amm-cream/60 border border-amm-latte">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amm-mauve text-white text-xs font-black flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-amm-espresso">
                      {item.product.name}
                    </h4>
                    <span className="text-[10px] text-amm-roast">
                      Precio: ${item.product.price} MXN • Margen: {(((item.product.price - item.product.cost) / item.product.price) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-white border border-amm-latte font-extrabold text-xs text-amm-espresso">
                  ~{item.salesCount} ventas
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-amm-mint/30 border border-amm-mint-dark/40 text-xs text-emerald-950 font-medium">
            💡 <strong>Estrategia sugerida:</strong> Ofrecer estos productos como "Recomendación del Barista" durante el cobro para clientes indecisos.
          </div>
        </div>

        {/* Slow Moving / Risk of Waste */}
        <div className="bg-white rounded-3xl border border-amm-latte p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amm-latte/60">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-amm-espresso">
                  Baja Rotación / Riesgo de Merma
                </h3>
                <p className="text-[11px] text-amm-roast">
                  Artículos que conviene sacar o promocionar hoy
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
              Acción Requerida
            </span>
          </div>

          <div className="space-y-3">
            {slowMovers.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amm-sand overflow-hidden shrink-0">
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-amm-espresso">
                      {prod.name}
                    </h4>
                    <span className="text-[10px] text-rose-700 font-semibold">
                      {prod.stockQuantity ? `Quedan solo ${prod.stockQuantity} pzas en vitrina` : 'Rotación inferior al 10%'}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-xl bg-white border border-rose-200 text-[11px] font-bold text-rose-700">
                  ${prod.price} MXN
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            ⚠️ <strong>Recomendación:</strong> Agrupar en paquete con café o aplicar 15%-25% de descuento en el turno vespertino para recuperar el costo.
          </div>
        </div>

      </div>

      {/* Suggested Combos & Promos Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amm-mauve" />
          <h3 className="font-serif font-bold text-xl text-amm-espresso">
            Combos y Promociones Sugeridas para el Menú
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {smartPromos.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-3xl border border-amm-latte p-5 shadow-card flex flex-col justify-between space-y-4 hover:border-amm-mauve transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amm-mauve-soft text-amm-mauve-dark text-[10px] font-extrabold uppercase">
                    {promo.badge}
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                    {promo.discount}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-amm-espresso leading-snug">
                  {promo.title}
                </h4>

                <p className="text-xs text-amm-roast leading-relaxed">
                  {promo.description}
                </p>

                {/* Price pill */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-black text-amm-espresso">
                    ${promo.promoPrice} <span className="text-xs font-normal">MXN</span>
                  </span>
                  <span className="text-xs line-through text-amm-roast font-semibold">
                    ${promo.originalPrice}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                  🎯 {promo.benefit}
                </p>
              </div>

              <button
                onClick={() => handleActivatePromoInPOS(promo)}
                className="w-full py-2.5 px-4 rounded-2xl bg-amm-espresso hover:bg-amm-roast text-white text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amm-mint" />
                <span>Activar Combo en POS</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
