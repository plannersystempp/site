import { create } from 'zustand';

type UIState = {
  showPlansModal: boolean;
  showContactModal: boolean;
  openPlansModal: () => void;
  closePlansModal: () => void;
  openContactModal: () => void;
  closeContactModal: () => void;
};

const useUIStore = create<UIState>((set) => ({
  showPlansModal: false,
  showContactModal: false,
  openPlansModal: () => set({ showPlansModal: true }),
  closePlansModal: () => set({ showPlansModal: false }),
  openContactModal: () => set({ showContactModal: true }),
  closeContactModal: () => set({ showContactModal: false }),
}));

export default useUIStore;
