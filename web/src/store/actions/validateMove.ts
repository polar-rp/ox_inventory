import { useStore } from '..';
import { fetchNui } from '../../utils/fetchNui';

export const validateMove = async (data: {
  fromSlot: number;
  fromType: string;
  toSlot: number;
  toType: string;
  count: number;
}) => {
  const { startBusyState, endBusyState, setContainerWeight } = useStore.getState();

  startBusyState();

  try {
    const response = await fetchNui<boolean | number>('swapItems', data);

    if (response === false) {
      endBusyState(false);
      return;
    }

    if (typeof response === 'number') {
      setContainerWeight(response);
    }

    endBusyState(true);
  } catch (error) {
    endBusyState(false);
  }
};
