"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StageCar = {
  slug: string;
  brand: string;
  model: string;
  year: number;
  priceUSD: number;
  colorHex: string;
  bodyType: string;
  image?: string;
};

type UIState = {
  stageCar: StageCar | null;
  setStageCar: (c: StageCar) => void;
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  compare: string[];
  toggleCompare: (slug: string) => void;
  clearCompare: () => void;
};

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      stageCar: null,
      setStageCar: (c) => set({ stageCar: c }),
      favorites: [],
      toggleFavorite: (slug) =>
        set({
          favorites: get().favorites.includes(slug)
            ? get().favorites.filter((s) => s !== slug)
            : [...get().favorites, slug],
        }),
      compare: [],
      toggleCompare: (slug) => {
        const cur = get().compare;
        if (cur.includes(slug)) set({ compare: cur.filter((s) => s !== slug) });
        else if (cur.length < 3) set({ compare: [...cur, slug] });
      },
      clearCompare: () => set({ compare: [] }),
    }),
    { name: "bm-ui" }
  )
);
