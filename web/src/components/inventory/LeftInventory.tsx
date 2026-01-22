import React from 'react';
import InventoryGrid from './InventoryGrid';
import { useStore, selectLeftInventory } from '../../store';

const LeftInventory: React.FC = () => {
  const leftInventory = useStore(selectLeftInventory);

  return <InventoryGrid inventory={leftInventory} />;
};

export default LeftInventory;
