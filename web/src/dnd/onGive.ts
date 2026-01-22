import { useStore } from '../store';
import { Slot } from '../typings';
import { fetchNui } from '../utils/fetchNui';

export const onGive = (item: Slot) => {
  const { itemAmount } = useStore.getState();
  fetchNui('giveItem', { slot: item.slot, count: itemAmount });
};
