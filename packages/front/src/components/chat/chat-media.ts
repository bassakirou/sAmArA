import { productPlaceholder, shopPlaceholder } from '@lib/placeholders';

const PRODUCT_PLACEHOLDER = (productPlaceholder as any)?.src ?? productPlaceholder;
const SHOP_PLACEHOLDER = (shopPlaceholder as any)?.src ?? shopPlaceholder;

function normalizeMedia(value: any) {
  if (!value) return null;

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

export function getAbsoluteMediaSrc(url?: string | null, fallback: string = PRODUCT_PLACEHOLDER) {
  if (!url) return fallback;

  const apiBaseUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
  let apiOrigin = apiBaseUrl || '';
  try {
    if (apiBaseUrl) {
      apiOrigin = new URL(apiBaseUrl).origin;
    }
  } catch {}

  // Replace localhost or 127.0.0.1 with the correct NEXT_PUBLIC_REST_API_ENDPOINT if the latter is a production URL
  if (apiOrigin && !apiOrigin.includes('localhost') && !apiOrigin.includes('127.0.0.1')) {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      try {
        const parsed = new URL(url);
        const relativePath = parsed.pathname + parsed.search;
        return `${apiOrigin}${relativePath}`;
      } catch {
        // Fallback if URL parsing fails
      }
    }
  }

  try {
    const parsed = new URL(url);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return url;
    }
  } catch {
    if (apiOrigin) {
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return `${apiOrigin}${normalizedPath}`;
    }
  }

  return url;
}

export function getShopLogoSrc(shop?: any) {
  const logo = normalizeMedia(shop?.logo);
  return getAbsoluteMediaSrc(
    logo?.original ??
      logo?.thumbnail ??
      (typeof logo === 'string' ? logo : null),
    SHOP_PLACEHOLDER
  );
}

export function getProductImageSrc(product?: any | null) {
  if (!product) return PRODUCT_PLACEHOLDER;

  const rawProductImage = Array.isArray(product?.image)
    ? product.image[0]
    : product?.image;
  const productImage = normalizeMedia(rawProductImage);
  const galleryImage = Array.isArray(product?.gallery)
    ? normalizeMedia(product.gallery[0])
    : null;

  return getAbsoluteMediaSrc(
    productImage?.original ??
      productImage?.thumbnail ??
      (typeof productImage === 'string' ? productImage : null) ??
      galleryImage?.original ??
      galleryImage?.thumbnail ??
      (typeof galleryImage === 'string' ? galleryImage : null) ??
      null,
    PRODUCT_PLACEHOLDER
  );
}

export { PRODUCT_PLACEHOLDER, SHOP_PLACEHOLDER };
