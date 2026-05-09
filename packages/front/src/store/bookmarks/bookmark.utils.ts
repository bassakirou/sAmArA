export interface Item {
    id: string | number;
    name?: string;
    productId?: string,
    slug?:any,
    price?: any,
    image?: any,
    [key: string]: any;
}

export interface UpdateItemInput extends Partial<Omit<Item, "id">> { }

export function addItem(
    items: Item[],
    item: Item,
) {
    const existingItemIndex = items.findIndex(
        (existingItem) => existingItem.id === item.id
    );

    if (existingItemIndex > -1) {
        const newItems = [...items];
        return newItems;
    }
    return [...items, item];
}


export function getItem(items: Item[], id: Item["id"]) {
    return items.find((item) => item.id === id);
}


export function updateItem(
    items: Item[],
    id: Item["id"],
    item: UpdateItemInput
) {
    return items.map((existingItem) =>
        existingItem.id === id ? { ...existingItem, ...item } : existingItem
    );
}

export function removeItem(items: Item[], id: Item["id"]) {
    return items.filter((existingItem) => existingItem.id !== id);
}

export const calculateTotalItems = (items: Item[]) => items.length;


