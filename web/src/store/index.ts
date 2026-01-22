import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { Inventory, InventoryType, Slot, SlotWithItem, State } from '../typings';
import { getItemData, getTargetInventory, itemDurability } from '../helpers';
import { Items } from './items';

// Tooltip state
interface TooltipState {
  open: boolean;
  item: SlotWithItem | null;
  inventoryType: Inventory['type'] | null;
}

// Context menu state
interface ContextMenuState {
  coords: {
    x: number;
    y: number;
  } | null;
  item: SlotWithItem | null;
}

// Combined store state
interface StoreState extends State {
  // Tooltip state
  tooltip: TooltipState;
  // Context menu state
  contextMenu: ContextMenuState;

  // Inventory actions
  setupInventory: (payload: { leftInventory?: Inventory; rightInventory?: Inventory }) => void;
  swapSlots: (payload: {
    fromSlot: SlotWithItem;
    fromType: Inventory['type'];
    toSlot: SlotWithItem;
    toType: Inventory['type'];
  }) => void;
  moveSlots: (payload: {
    fromSlot: SlotWithItem;
    fromType: Inventory['type'];
    toSlot: Slot;
    toType: Inventory['type'];
    count: number;
  }) => void;
  stackSlots: (payload: {
    fromSlot: SlotWithItem;
    fromType: Inventory['type'];
    toSlot: SlotWithItem;
    toType: Inventory['type'];
    count: number;
  }) => void;
  refreshSlots: (payload: {
    items?: { item: Slot; inventory?: InventoryType } | { item: Slot; inventory?: InventoryType }[];
    itemCount?: Record<string, number>;
    weightData?: { inventoryId: string; maxWeight: number };
    slotsData?: { inventoryId: string; slots: number };
  }) => void;
  setAdditionalMetadata: (payload: Array<{ metadata: string; value: string }>) => void;
  setItemAmount: (amount: number) => void;
  setShiftPressed: (pressed: boolean) => void;
  setContainerWeight: (weight: number) => void;

  // Tooltip actions
  openTooltip: (payload: { item: SlotWithItem; inventoryType: Inventory['type'] }) => void;
  closeTooltip: () => void;

  // Context menu actions
  openContextMenu: (payload: { item: SlotWithItem; coords: { x: number; y: number } }) => void;
  closeContextMenu: () => void;

  // Async helpers for thunks
  startBusyState: () => void;
  endBusyState: (success: boolean) => void;
}

const initialInventory: Inventory = {
  id: '',
  type: '',
  slots: 0,
  maxWeight: 0,
  items: [],
};

export const useStore = create<StoreState>()(
  devtools(
    immer((set, get) => ({
      // Initial inventory state
      leftInventory: initialInventory,
      rightInventory: initialInventory,
      showRightInventory: false,
      additionalMetadata: [],
      itemAmount: 0,
      shiftPressed: false,
      isBusy: false,
      history: undefined,

      // Initial tooltip state
      tooltip: {
        open: false,
        item: null,
        inventoryType: null,
      },

      // Initial context menu state
      contextMenu: {
        coords: null,
        item: null,
      },

      // Inventory actions
      setupInventory: (payload) =>
        set((state) => {
          const { leftInventory, rightInventory } = payload;
          const curTime = Math.floor(Date.now() / 1000);

          if (leftInventory) {
            state.leftInventory = {
              ...leftInventory,
              items: Array.from(Array(leftInventory.slots), (_, index) => {
                const item = Object.values(leftInventory.items).find((item) => item?.slot === index + 1) || {
                  slot: index + 1,
                };

                if (!item.name) return item;

                if (typeof Items[item.name] === 'undefined') {
                  getItemData(item.name);
                }

                item.durability = itemDurability(item.metadata, curTime);
                return item;
              }),
            };
          }

          if (rightInventory) {
            state.rightInventory = {
              ...rightInventory,
              items: Array.from(Array(rightInventory.slots), (_, index) => {
                const item = Object.values(rightInventory.items).find((item) => item?.slot === index + 1) || {
                  slot: index + 1,
                };

                if (!item.name) return item;

                if (typeof Items[item.name] === 'undefined') {
                  getItemData(item.name);
                }

                item.durability = itemDurability(item.metadata, curTime);
                return item;
              }),
            };
            state.showRightInventory = rightInventory.type !== 'newdrop';
          } else {
            state.showRightInventory = false;
          }

          state.shiftPressed = false;
          state.isBusy = false;
        }),

      swapSlots: (payload) =>
        set((state) => {
          const { fromSlot, fromType, toSlot, toType } = payload;
          const { sourceInventory, targetInventory } = getTargetInventory(state, fromType, toType);
          const curTime = Math.floor(Date.now() / 1000);

          [sourceInventory.items[fromSlot.slot - 1], targetInventory.items[toSlot.slot - 1]] = [
            {
              ...targetInventory.items[toSlot.slot - 1],
              slot: fromSlot.slot,
              durability: itemDurability(toSlot.metadata, curTime),
            },
            {
              ...sourceInventory.items[fromSlot.slot - 1],
              slot: toSlot.slot,
              durability: itemDurability(fromSlot.metadata, curTime),
            },
          ];
        }),

      moveSlots: (payload) =>
        set((state) => {
          const { fromSlot, fromType, toSlot, toType, count } = payload;
          const { sourceInventory, targetInventory } = getTargetInventory(state, fromType, toType);
          const pieceWeight = fromSlot.weight / fromSlot.count;
          const curTime = Math.floor(Date.now() / 1000);
          const fromItem = sourceInventory.items[fromSlot.slot - 1];

          targetInventory.items[toSlot.slot - 1] = {
            ...fromItem,
            count: count,
            weight: pieceWeight * count,
            slot: toSlot.slot,
            durability: itemDurability(fromItem.metadata, curTime),
          };

          if (fromType === InventoryType.SHOP || fromType === InventoryType.CRAFTING) return;

          sourceInventory.items[fromSlot.slot - 1] =
            fromSlot.count - count > 0
              ? {
                  ...sourceInventory.items[fromSlot.slot - 1],
                  count: fromSlot.count - count,
                  weight: pieceWeight * (fromSlot.count - count),
                }
              : {
                  slot: fromSlot.slot,
                };
        }),

      stackSlots: (payload) =>
        set((state) => {
          const { fromSlot, fromType, toSlot, toType, count } = payload;
          const { sourceInventory, targetInventory } = getTargetInventory(state, fromType, toType);
          const pieceWeight = fromSlot.weight / fromSlot.count;

          targetInventory.items[toSlot.slot - 1] = {
            ...targetInventory.items[toSlot.slot - 1],
            count: toSlot.count + count,
            weight: pieceWeight * (toSlot.count + count),
          };

          if (fromType === InventoryType.SHOP || fromType === InventoryType.CRAFTING) return;

          sourceInventory.items[fromSlot.slot - 1] =
            fromSlot.count - count > 0
              ? {
                  ...sourceInventory.items[fromSlot.slot - 1],
                  count: fromSlot.count - count,
                  weight: pieceWeight * (fromSlot.count - count),
                }
              : {
                  slot: fromSlot.slot,
                };
        }),

      refreshSlots: (payload) =>
        set((state) => {
          if (payload.items) {
            const items = Array.isArray(payload.items) ? payload.items : [payload.items];
            const curTime = Math.floor(Date.now() / 1000);

            items
              .filter((data) => !!data)
              .forEach((data) => {
                const targetInventory = data.inventory
                  ? data.inventory !== InventoryType.PLAYER
                    ? state.rightInventory
                    : state.leftInventory
                  : state.leftInventory;

                data.item.durability = itemDurability(data.item.metadata, curTime);
                targetInventory.items[data.item.slot - 1] = data.item;
              });

            // Janky workaround to force a state rerender for crafting inventory
            if (state.rightInventory.type === InventoryType.CRAFTING) {
              state.rightInventory = { ...state.rightInventory };
            }
          }

          if (payload.itemCount) {
            const items = Object.entries(payload.itemCount);

            for (let i = 0; i < items.length; i++) {
              const item = items[i][0];
              const count = items[i][1];

              if (Items[item]!) {
                Items[item]!.count += count;
              } else console.log(`Item data for ${item} is undefined`);
            }
          }

          if (payload.weightData) {
            const inventoryId = payload.weightData.inventoryId;
            const inventoryMaxWeight = payload.weightData.maxWeight;
            const inv =
              inventoryId === state.leftInventory.id
                ? 'leftInventory'
                : inventoryId === state.rightInventory.id
                ? 'rightInventory'
                : null;

            if (!inv) return;

            state[inv].maxWeight = inventoryMaxWeight;
          }

          if (payload.slotsData) {
            const { inventoryId, slots } = payload.slotsData;

            const inv =
              inventoryId === state.leftInventory.id
                ? 'leftInventory'
                : inventoryId === state.rightInventory.id
                ? 'rightInventory'
                : null;

            if (!inv) return;

            state[inv].slots = slots;

            // Re-run setupInventory logic for the affected inventory
            const curTime = Math.floor(Date.now() / 1000);
            const inventory = state[inv];

            state[inv] = {
              ...inventory,
              items: Array.from(Array(slots), (_, index) => {
                const item = Object.values(inventory.items).find((item) => item?.slot === index + 1) || {
                  slot: index + 1,
                };

                if (!item.name) return item;

                if (typeof Items[item.name] === 'undefined') {
                  getItemData(item.name);
                }

                item.durability = itemDurability(item.metadata, curTime);
                return item;
              }),
            };
          }
        }),

      setAdditionalMetadata: (payload) =>
        set((state) => {
          const metadata = [];

          for (let i = 0; i < payload.length; i++) {
            const entry = payload[i];
            if (!state.additionalMetadata.find((el) => el.value === entry.value)) metadata.push(entry);
          }

          state.additionalMetadata = [...state.additionalMetadata, ...metadata];
        }),

      setItemAmount: (amount) =>
        set((state) => {
          state.itemAmount = amount;
        }),

      setShiftPressed: (pressed) =>
        set((state) => {
          state.shiftPressed = pressed;
        }),

      setContainerWeight: (weight) =>
        set((state) => {
          const container = state.leftInventory.items.find(
            (item) => item.metadata?.container === state.rightInventory.id
          );

          if (!container) return;

          container.weight = weight;
        }),

      // Tooltip actions
      openTooltip: (payload) =>
        set((state) => {
          state.tooltip.open = true;
          state.tooltip.item = payload.item;
          state.tooltip.inventoryType = payload.inventoryType;
        }),

      closeTooltip: () =>
        set((state) => {
          state.tooltip.open = false;
        }),

      // Context menu actions
      openContextMenu: (payload) =>
        set((state) => {
          state.contextMenu.coords = payload.coords;
          state.contextMenu.item = payload.item;
        }),

      closeContextMenu: () =>
        set((state) => {
          state.contextMenu.coords = null;
        }),

      // Async helpers
      startBusyState: () =>
        set((state) => {
          state.isBusy = true;
          state.history = {
            leftInventory: JSON.parse(JSON.stringify(state.leftInventory)),
            rightInventory: JSON.parse(JSON.stringify(state.rightInventory)),
          };
        }),

      endBusyState: (success) =>
        set((state) => {
          if (!success && state.history) {
            state.leftInventory = state.history.leftInventory;
            state.rightInventory = state.history.rightInventory;
          }
          state.isBusy = false;
        }),
    })),
    { name: 'ox_inventory' }
  )
);

// Export store state type for use in components
export type { StoreState };

// Selectors - state
export const selectLeftInventory = (state: StoreState) => state.leftInventory;
export const selectRightInventory = (state: StoreState) => state.rightInventory;
export const selectShowRightInventory = (state: StoreState) => state.showRightInventory;
export const selectItemAmount = (state: StoreState) => state.itemAmount;
export const selectIsBusy = (state: StoreState) => state.isBusy;
export const selectTooltip = (state: StoreState) => state.tooltip;
export const selectContextMenu = (state: StoreState) => state.contextMenu;
export const selectAdditionalMetadata = (state: StoreState) => state.additionalMetadata;

// Selectors - actions
export const selectSetupInventory = (state: StoreState) => state.setupInventory;
export const selectRefreshSlots = (state: StoreState) => state.refreshSlots;
export const selectSetAdditionalMetadata = (state: StoreState) => state.setAdditionalMetadata;
export const selectSetItemAmount = (state: StoreState) => state.setItemAmount;
export const selectSetShiftPressed = (state: StoreState) => state.setShiftPressed;
export const selectOpenTooltip = (state: StoreState) => state.openTooltip;
export const selectCloseTooltip = (state: StoreState) => state.closeTooltip;
export const selectOpenContextMenu = (state: StoreState) => state.openContextMenu;
export const selectCloseContextMenu = (state: StoreState) => state.closeContextMenu;
