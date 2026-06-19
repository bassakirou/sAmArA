const PRODUCT_PLACEHOLDER = '/assets/placeholder/products/samara-boutique.svg';

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

export function getAbsoluteMediaSrc(url?: string | null) {
  if (!url) return PRODUCT_PLACEHOLDER;

  const apiBaseUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

  // Replace localhost or 127.0.0.1 with the correct NEXT_PUBLIC_REST_API_ENDPOINT if the latter is a production URL
  if (apiBaseUrl && !apiBaseUrl.includes('localhost') && !apiBaseUrl.includes('127.0.0.1')) {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      try {
        const parsed = new URL(url);
        const relativePath = parsed.pathname + parsed.search;
        return `${apiBaseUrl.replace(/\/+$/, '')}${relativePath}`;
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
    if (apiBaseUrl) {
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return `${apiBaseUrl.replace(/\/+$/, '')}${normalizedPath}`;
    }
  }

  return url;
}

export function getShopLogoSrc(shop?: any) {
  const logo = normalizeMedia(shop?.logo);
  return getAbsoluteMediaSrc(
    logo?.original ??
      logo?.thumbnail ??
      (typeof logo === 'string' ? logo : null)
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
      null
  );
}

export { PRODUCT_PLACEHOLDER };
