import { useStore } from '..';
import { fetchNui } from '../../utils/fetchNui';

export const craftItem = async (data: {
  fromSlot: number;
  fromType: string;
  toSlot: number;
  toType: string;
  count: number;
}) => {
  const { startBusyState, endBusyState } = useStore.getState();

  startBusyState();

  try {
    const response = await fetchNui<boolean>('craftItem', data);

    if (response === false) {
      endBusyState(false);
      return;
    }

    endBusyState(true);
  } catch (error) {
    endBusyState(false);
  }
};
