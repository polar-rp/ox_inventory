import { ItemData } from '../typings/item';

export const Items: {
  [key: string]: ItemData | undefined;
} = {
  water: {
    name: 'water',
    close: false,
    label: 'VODA',
    stack: true,
    usable: true,
    count: 0,
  },
  burger: {
    name: 'burger',
    close: false,
    label: 'BURGR',
    stack: false,
    usable: false,
    count: 0,
  },
  paperbag: {
    name: 'paperbag',
    close: false,
    label: 'PAPERBAG',
    stack: false,
    usable: false,
    count: 0,
  },
  phone: {
    name: 'phone',
    close: false,
    label: 'PHONE',
    stack: false,
    usable: false,
    count: 0,
  },
};
