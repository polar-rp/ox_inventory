import React from 'react';
import InventoryGrid from './InventoryGrid';
import { useStore, selectRightInventory } from '../../store';
import { calculateDisplaySlots } from '../../helpers/calculateOccupiedSlots';

const RightInventory: React.FC = () => {
  const rightInventory = useStore(selectRightInventory);
  const displaySlots = calculateDisplaySlots(rightInventory.items, rightInventory.slots);

  return <InventoryGrid inventory={rightInventory} maxDisplaySlots={displaySlots} />;
};

export default RightInventory;
