// stores/encryptionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the store state interface
interface EncryptionState {
  encryptionKey: CryptoKey | null;
  rawKey: number[] | null; // Store raw key bytes for persistence
  setEncryptionKey: (key: CryptoKey | null) => void;
  clearEncryptionKey: () => void;
}

// Utility to export CryptoKey to raw bytes
const exportCryptoKey = async (
  key: CryptoKey | null
): Promise<number[] | null> => {
  if (!key) return null;
  const rawKey = await crypto.subtle.exportKey("raw", key);
  return Array.from(new Uint8Array(rawKey));
};

// Utility to import raw bytes back to CryptoKey
const importCryptoKey = async (
  rawKey: number[] | null
): Promise<CryptoKey | null> => {
  if (!rawKey) return null;
  return await crypto.subtle.importKey(
    "raw",
    new Uint8Array(rawKey),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

// Create the store with TypeScript and persist middleware
const useEncryptionStore = create<EncryptionState>()(
  persist(
    (set, get) => ({
      encryptionKey: null,
      rawKey: null,
      setEncryptionKey: async (key: CryptoKey | null) => {
        const rawKey = await exportCryptoKey(key);
        set({ encryptionKey: key, rawKey });
      },
      clearEncryptionKey: () => set({ encryptionKey: null, rawKey: null }),
    }),
    {
      name: "encryption-storage", // Key for storage
      storage: {
        // Custom storage to support cookies or sessionStorage
        getItem: async (name: string) => {
          // Try cookies first
          const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${name}=`))
            ?.split("=")[1];
          if (cookieValue) {
            const state = JSON.parse(cookieValue);
            if (state.rawKey) {
              state.encryptionKey = await importCryptoKey(state.rawKey);
            }
            return state;
          }

          // Fallback to sessionStorage
          const sessionValue = sessionStorage.getItem(name);
          if (sessionValue) {
            const state = JSON.parse(sessionValue);
            if (state.rawKey) {
              state.encryptionKey = await importCryptoKey(state.rawKey);
            }
            return state;
          }

          return null;
        },
        setItem: async (name: string, value: any) => {
          // Prefer cookies
          const cookieOptions = {
            path: "/",
            secure: true, // Use HTTPS
            sameSite: "strict" as "strict", // Mitigate CSRF
            maxAge: 604800, // 7 days (same as token)
          };
          const cookieValue = JSON.stringify(value);
          document.cookie = `${name}=${cookieValue}; path=${cookieOptions.path}; secure=${cookieOptions.secure}; samesite=${cookieOptions.sameSite}; max-age=${cookieOptions.maxAge}`;

          // Also save to sessionStorage as fallback
          sessionStorage.setItem(name, cookieValue);
        },
        removeItem: (name: string) => {
          // Remove from cookies
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          // Remove from sessionStorage
          sessionStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        rawKey: state.rawKey, // Only persist rawKey, not the CryptoKey
      }),
      onRehydrateStorage: () => async (state) => {
        if (state && state.rawKey) {
          const key = await importCryptoKey(state.rawKey);
          state.encryptionKey = key;
        }
      },
    }
  )
);

export default useEncryptionStore;
