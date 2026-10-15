import { Product } from '@/types';
import { INITIAL_PRODUCTS } from './mockData';

/**
 * Returns a clean, capitalized size label ('Chico', 'Mediano', 'Grande') or null if not applicable.
 * Includes intelligent auto-detection from product names and drink defaults.
 */
export function getProductSizeLabel(prod: Product): string | null {
  if (prod.size) {
    if (prod.size === 'unico') return null;
    if (prod.size === 'chico') return 'Chico';
    if (prod.size === 'mediano') return 'Mediano';
    if (prod.size === 'grande') return 'Grande';
    return String(prod.size);
  }

  const name = (prod.name || '').trim();

  // Check for Chico / Ch
  if (
    /\b(chico|pequeño|chica)\b/i.test(name) ||
    /(^|\s)(ch|ch\.)(\s|$)/i.test(name) ||
    name.endsWith(' CH') ||
    name.endsWith(' Ch') ||
    name.endsWith(' ch')
  ) {
    return 'Chico';
  }

  // Check for Mediano / M
  if (
    /\b(mediano|mediana)\b/i.test(name) ||
    /(^|\s)(m|m\.)(\s|$)/i.test(name) ||
    name.endsWith(' M') ||
    name.endsWith(' m')
  ) {
    return 'Mediano';
  }

  // Check for Grande / G
  if (
    /\b(grande|gde)\b/i.test(name) ||
    /(^|\s)(g|g\.)(\s|$)/i.test(name) ||
    name.endsWith(' G') ||
    name.endsWith(' g')
  ) {
    return 'Grande';
  }

  // Match initial mock products
  const match = INITIAL_PRODUCTS.find(
    (ip) => ip.id === prod.id || ip.name.toLowerCase() === name.toLowerCase()
  );
  if (match?.size && match.size !== 'unico') {
    return match.size === 'chico'
      ? 'Chico'
      : match.size === 'mediano'
      ? 'Mediano'
      : match.size === 'grande'
      ? 'Grande'
      : String(match.size);
  }

  // Fallback for beverage categories
  if (['cafe', 'bebidas_frias'].includes(prod.category)) {
    return 'Mediano';
  }

  return null;
}
