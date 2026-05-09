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


export function generateBookmarkItem(item: Item) {
  const { id, name, slug, image, price, sale_price } = item;
  return {
    id,
    name,
    slug,
    image: image?.thumbnail,
    price: sale_price ? sale_price : price,
  };
}
