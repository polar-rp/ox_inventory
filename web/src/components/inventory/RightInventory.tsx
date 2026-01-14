import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import { selectRightInventory } from '../../store/inventory';
import { calculateDisplaySlots } from '../../helpers/calculateOccupiedSlots';

const RightInventory: React.FC = () => {
  const rightInventory = useAppSelector(selectRightInventory);
  const displaySlots = calculateDisplaySlots(rightInventory.items, rightInventory.slots);

  return <InventoryGrid inventory={rightInventory} maxDisplaySlots={displaySlots} />;
};

export default RightInventory;
