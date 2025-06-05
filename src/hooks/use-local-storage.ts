
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@/lib/localStorage';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = getItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: SetValue<T> = useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`
        );
      }
      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        setItem<T>(key, newValue);
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue]
  );

  useEffect(() => {
    const newValue = readValue();
    // Only set state if the new value is actually different from the current stored value.
    // For objects/arrays, JSON.stringify can help compare content rather than reference,
    // mitigating loops caused by new references from JSON.parse or unstable initialValue props.
    if (
      (typeof newValue === 'object' && newValue !== null && typeof storedValue === 'object' && storedValue !== null)
      ? JSON.stringify(newValue) !== JSON.stringify(storedValue)
      : newValue !== storedValue
    ) {
      setStoredValue(newValue);
    }
  }, [readValue, storedValue]); // readValue changes if key/initialValue prop changes. storedValue ensures we compare against current state.

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
         try {
            setStoredValue(JSON.parse(event.newValue) as T);
        } catch (error) {
            console.warn(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
