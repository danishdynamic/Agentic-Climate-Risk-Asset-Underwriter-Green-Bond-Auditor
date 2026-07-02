import { create } from 'zustand';

interface AppStore {
             activeAssetId: number | null;
             setActiveAsset: (id: number | null) => void;
             sessionId: string;
}

export const useAppStore = create<AppStore>((set) => ({
  activeAssetId: null,
  setActiveAsset: (id) => set({ activeAssetId: id }),
  sessionId: crypto.randomUUID(),
}));