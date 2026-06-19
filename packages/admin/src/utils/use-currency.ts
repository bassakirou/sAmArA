import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSettings } from '@/contexts/settings.context';

const BASE_CURRENCY = 'XAF';
const API_URL = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`;
const CACHE_KEY = `samara.fxrates.${BASE_CURRENCY.toLowerCase()}`;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

interface ExchangeRates {
  [key: string]: number;
}

type CachedRates = {
  fetchedAt: number;
  rates: ExchangeRates;
};

function readCachedRates(): CachedRates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRates;
    if (!parsed?.fetchedAt || !parsed?.rates) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedRates(payload: CachedRates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    return;
  }
}

export function useCurrency() {
  const { currency } = useSettings();
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [targetCurrency, setTargetCurrency] = useState<string>(
    currency ?? BASE_CURRENCY
  );

  useEffect(() => {
    setTargetCurrency(currency ?? BASE_CURRENCY);
  }, [currency]);

  useEffect(() => {
    const cached = readCachedRates();
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setRates(cached.rates);
    }

    let mounted = true;

    async function fetchRates() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!mounted) return;
        if (data?.result === 'success' && data?.rates) {
          setRates(data.rates);
          writeCachedRates({ fetchedAt: Date.now(), rates: data.rates });
        }
      } catch {
        return;
      }
    }

    const shouldFetch = !cached || Date.now() - cached.fetchedAt >= CACHE_TTL_MS;
    if (shouldFetch) {
      fetchRates();
    }

    const interval = window.setInterval(fetchRates, CACHE_TTL_MS);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const convert = useCallback(
    (amount: number, fromCurrency: string = BASE_CURRENCY, toCurrency = targetCurrency) => {
      if (!rates) return amount;
      if (!fromCurrency || !toCurrency) return amount;
      if (fromCurrency === toCurrency) return amount;

      const fromRate = rates[fromCurrency];
      const toRate = rates[toCurrency];
      if (!fromRate || !toRate) return amount;

      if (fromCurrency === BASE_CURRENCY) {
        return amount * toRate;
      }
      if (toCurrency === BASE_CURRENCY) {
        return amount / fromRate;
      }

      const amountInBase = amount / fromRate;
      return amountInBase * toRate;
    },
    [rates, targetCurrency]
  );

  const baseCurrency = useMemo(() => BASE_CURRENCY, []);

  return { baseCurrency, rates, targetCurrency, setTargetCurrency, convert };
}
