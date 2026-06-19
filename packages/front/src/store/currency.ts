import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { DISPLAY_CURRENCY } from '@lib/constants';

export type DisplayCurrency = 'XAF' | 'USD' | 'EUR';

export const displayCurrencyAtom = atomWithStorage<DisplayCurrency>(
  DISPLAY_CURRENCY,
  'XAF'
);

export const setDisplayCurrencyAtom = atom(
  null,
  (_get, set, next: DisplayCurrency) => {
    return set(displayCurrencyAtom, next);
  }
);

