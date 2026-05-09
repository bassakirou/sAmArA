import React, { useCallback } from 'react';
import { bookmarkReducer, State, initialState } from './bookmark.reducer';
import { Item, getItem } from './bookmark.utils';
import { useLocalStorage } from '@lib/use-local-storage';
import { BOOKMARK_KEY } from '@lib/constants';
import { useAtom } from 'jotai';
import { verifiedResponseAtom } from '@store/checkout';
interface BookmarkProviderState extends State {
  addItemToBookmark: (item: Item, quantity: number) => void;
  removeItemFromBookmark: (id: Item['id']) => void;
  getItemFromBookmark: (id: Item['id']) => any | undefined;
  isInBookmark: (id: Item['id']) => boolean;
  getItemsBookmark: () => Item[];
}
export const bookmarkContext = React.createContext<BookmarkProviderState | undefined>(
  undefined
);

bookmarkContext.displayName = 'BookmarkContext';

export const useBookmark = () => {
  const context = React.useContext(bookmarkContext);
  if (context === undefined) {
    throw new Error(`useBookmark must be used within a BookmarkProvider`);
  }
  return context;
};

export const BookmarkProvider: React.FC<{ children?: React.ReactNode }> = (
  props
) => {
  const [savedBookmark, saveBookmark] = useLocalStorage(
    BOOKMARK_KEY,
    JSON.stringify(initialState)
  );
  const [state, dispatch] = React.useReducer(
    bookmarkReducer,
    JSON.parse(savedBookmark!)
  );
  const [, emptyVerifiedResponse] = useAtom(verifiedResponseAtom);
  React.useEffect(() => {
    emptyVerifiedResponse(null);
  }, [emptyVerifiedResponse, state]);

  React.useEffect(() => {
    saveBookmark(JSON.stringify(state));
  }, [state, saveBookmark]);

  const addItemToBookmark = (item: Item, id: Item['id']) =>
    dispatch({ type: 'ADD_ITEM', id, item });
  const removeItemFromBookmark = (id: Item['id']) =>
    dispatch({ type: 'REMOVE_ITEM', id });
  const isInBookmark = useCallback(
    (id: Item['id']) => !!getItem(state.items, id),
    [state.items]
  );
  const getItemFromBookmark = useCallback(
    (id: Item['id']) => getItem(state.items, id),
    [state.items]
  );

  const getItemsBookmark = () => state.items;
  const resetBookmark = () => dispatch({ type: 'RESET_BOOKMARK' });
  const value = React.useMemo(
    () => ({
      ...state,
      addItemToBookmark,
      removeItemFromBookmark,
      getItemFromBookmark,
      isInBookmark,
      getItemsBookmark,
      resetBookmark,
    }),
    [getItemFromBookmark, isInBookmark, state]
  );
  return <bookmarkContext.Provider value={value} {...props} />;
};
