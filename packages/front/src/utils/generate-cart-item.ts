import isEmpty from "lodash/isEmpty";

interface Item {
  id: string | number;
  name: string;
  slug: string;
  image: {
    thumbnail: string;
    [key: string]: unknown;
  };
  price: number;
  sale_price?: number;
  quantity?: number;
  [key: string]: unknown;
}

// interface Variation {
//   id: string | number;
//   title: string;
//   price: number;
//   sale_price?: number;
//   quantity: number;
//   [key: string]: unknown;
// }

export function generateCartItem(item: Item, variation: any) {
  const { id, name, slug, image, price, sale_price, quantity, unit } = item;
  const shopId = (item as any)?.shop?.id ?? (item as any)?.shop_id ?? null;
  const shopSlug =
    (item as any)?.shop?.slug ?? (item as any)?.shop_slug ?? null;
  if (!isEmpty(variation)) {
    return {
      id: `${id}.${variation.id}`,
      productId: id,
      name: `${name} - ${variation.title}`,
      slug,
      unit,
      stock: variation.quantity,
      price: variation.sale_price ? variation.sale_price : variation.price,
      image: image?.thumbnail,
      variationId: variation.id,
      shop_id: shopId,
      shop_slug: shopSlug,
    };
  }
  return {
    id,
    name,
    slug,
    unit,
    image: image?.thumbnail,
    stock: quantity,
    price: sale_price ? sale_price : price,
    shop_id: shopId,
    shop_slug: shopSlug,
  };
}
