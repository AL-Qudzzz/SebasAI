
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@/lib/localStorage';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Initialize state with initialValue. This ensures server and client initial render match.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Effect to read from localStorage and update state after initial mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') {
      // This should ideally not be reached if running in a client component context,
      // but good for safety.
      return;
    }

    let valueFromStorage: T;
    try {
      const item = getItem<T>(key);
      valueFromStorage = item !== null ? item : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}” on mount:`, error);
      valueFromStorage = initialValue;
    }

    // Only update state if the fetched value is different from the current state
    // (which is `initialValue` on first client render before this effect runs).
    // Using JSON.stringify for comparison to handle objects/arrays correctly.
    if (JSON.stringify(valueFromStorage) !== JSON.stringify(storedValue)) {
      setStoredValue(valueFromStorage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]); // Rerun if key or initialValue prop changes.
                           // storedValue is implicitly initialValue from useState on the first run of this effect.

  const setValue: SetValue<T> = useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`
        );
        return;
      }
      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        setItem<T>(key, newValue);
        setStoredValue(newValue); // Update state
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue] // storedValue is needed for the functional update `value(storedValue)`
  );

  // Effect for synchronizing with changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        let newValueFromEvent: T;
        if (event.newValue === null) { // Item was removed or cleared from another tab
          newValueFromEvent = initialValue;
        } else {
          try {
            newValueFromEvent = JSON.parse(event.newValue) as T;
          } catch (error) {
            console.warn(`Error parsing storage event for key "${key}":`, error);
            return; // Don't proceed if parse fails
          }
        }

        // Update state only if the new value from event is different from current stored value
        if (JSON.stringify(newValueFromEvent) !== JSON.stringify(storedValue)) {
          setStoredValue(newValueFromEvent);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, storedValue]); // Dependencies ensure fresh closures

  return [storedValue, setValue];
}
