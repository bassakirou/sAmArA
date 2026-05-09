import {
  Item,
  UpdateItemInput,
  addItem,
  updateItem,
  removeItem,
  calculateTotalItems
} from "./bookmark.utils";

interface Metadata {
  [key: string]: any;
}

type Action =
  | { type: "ADD_ITEM"; id: Item["id"]; item: Item }
  | { type: "UPDATE_ITEM"; id: Item["id"]; item: UpdateItemInput }
  | { type: "REMOVE_ITEM"; id: Item["id"] }
  | { type: "RESET_BOOKMARK" };

export interface State {
  items: Item[];
  isEmpty: boolean;
  totalItems: number;
  meta?: Metadata | null;
}
export const initialState: State = {
  items: [],
  isEmpty: true,
  totalItems: 0,
  meta: null,
};
export function bookmarkReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_ITEM": {
      const items = addItem(state.items, action.item);
      return generateFinalState(state, items);
    }
    case "REMOVE_ITEM": {
      const items = removeItem(state.items, action.id);
      return generateFinalState(state, items);
    }
    case "UPDATE_ITEM": {
      const items = updateItem(state.items, action.id, action.item);
      return generateFinalState(state, items);
    }
    case "RESET_BOOKMARK":
      return initialState;
    default:
      return state;
  }
}

const generateFinalState = (state: State, items: Item[]) => {
  const totalItems = calculateTotalItems(items);
  return {
    ...state,
    items: items,
    totalItems,
    isEmpty: totalItems === 0,
  };
};
