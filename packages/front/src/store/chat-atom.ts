import { atom } from 'jotai';

interface ChatState {
  isOpen: boolean;
  isExpanded: boolean;
  activeProduct: any | null;
  activeConversationId: number | string | null;
  activeShopId: number | string | null;
}

export const chatAtom = atom<ChatState>({
  isOpen: false,
  isExpanded: false,
  activeProduct: null,
  activeConversationId: null,
  activeShopId: null,
});
