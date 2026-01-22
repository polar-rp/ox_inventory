import { canStack, findAvailableSlot, getTargetInventory, isSlotWithItem } from '../helpers';
import { validateMove } from '../store/actions/validateMove';
import { useStore } from '../store';
import { DragSource, DropTarget, InventoryType, SlotWithItem } from '../typings';
import { Items } from '../store/items';
import { fetchNui } from '../utils/fetchNui';

export const onDrop = (source: DragSource, target?: DropTarget) => {
  const state = useStore.getState();

  // If dragging to rightInventory but it's hidden, drop the item instead
  if (target?.inventory === 'right' && !state.showRightInventory) {
    const sourceSlot = state.leftInventory.items[source.item.slot - 1] as SlotWithItem;
    const count = state.itemAmount || sourceSlot.count;

    fetchNui('dropFromInventory', {
      fromSlot: sourceSlot.slot,
      count: count
    });
    return;
  }

  const { sourceInventory, targetInventory } = getTargetInventory(state, source.inventory, target?.inventory);

  const sourceSlot = sourceInventory.items[source.item.slot - 1] as SlotWithItem;

  const sourceData = Items[sourceSlot.name];

  if (sourceData === undefined) return console.error(`${sourceSlot.name} item data undefined!`);

  // If dragging from container slot
  if (sourceSlot.metadata?.container !== undefined) {
    // Prevent storing container in container
    if (targetInventory.type === InventoryType.CONTAINER)
      return console.log(`Cannot store container ${sourceSlot.name} inside another container`);

    // Prevent dragging of container slot when opened
    if (state.rightInventory.id === sourceSlot.metadata.container)
      return console.log(`Cannot move container ${sourceSlot.name} when opened`);
  }

  const targetSlot = target
    ? targetInventory.items[target.item.slot - 1]
    : findAvailableSlot(sourceSlot, sourceData, targetInventory.items);

  if (targetSlot === undefined) return console.error('Target slot undefined!');

  // If dropping on container slot when opened
  if (targetSlot.metadata?.container !== undefined && state.rightInventory.id === targetSlot.metadata.container)
    return console.log(`Cannot swap item ${sourceSlot.name} with container ${targetSlot.name} when opened`);

  const count =
    state.shiftPressed && sourceSlot.count > 1 && sourceInventory.type !== 'shop'
      ? Math.floor(sourceSlot.count / 2)
      : state.itemAmount === 0 || state.itemAmount > sourceSlot.count
        ? sourceSlot.count
        : state.itemAmount;

  const data = {
    fromSlot: sourceSlot,
    toSlot: targetSlot,
    fromType: sourceInventory.type,
    toType: targetInventory.type,
    count: count,
  };

  validateMove({
    ...data,
    fromSlot: sourceSlot.slot,
    toSlot: targetSlot.slot,
  });

  const { moveSlots, stackSlots, swapSlots } = useStore.getState();

  isSlotWithItem(targetSlot, true)
    ? sourceData.stack && canStack(sourceSlot, targetSlot)
      ? stackSlots({
          ...data,
          toSlot: targetSlot,
        })
      : swapSlots({
          ...data,
          toSlot: targetSlot,
        })
    : moveSlots(data);
};
