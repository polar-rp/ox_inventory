import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inventory } from '../../typings';
import WeightBar from '../utils/WeightBar';
import InventorySlot from './InventorySlot';
import { getTotalWeight } from '../../helpers';
import { useAppSelector } from '../../store';
import { useIntersection } from '../../hooks/useIntersection';

const PAGE_SIZE = 30;

interface InventoryGridProps {
  inventory: Inventory;
  maxDisplaySlots?: number;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ inventory, maxDisplaySlots }) => {
  const weight = useMemo(
    () => (inventory.maxWeight !== undefined ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0),
    [inventory.maxWeight, inventory.items]
  );
  const [page, setPage] = useState(0);
  const containerRef = useRef(null);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useAppSelector((state) => state.inventory.isBusy);

  // Calculate display count and dynamic height
  const displayCount = maxDisplaySlots || inventory.slots;
  const itemsToDisplay = inventory.items.slice(0, displayCount);
  const gridCols = 5;
  const gridRows = Math.ceil(displayCount / gridCols);
  const gridSize = 9; // vh
  const gridGap = 2; // px
  const dynamicHeight = `calc(${gridRows} * (${gridSize}vh + 0.22vh) + ${gridRows} * ${gridGap}px)`;

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      setPage((prev) => ++prev);
    }
  }, [entry]);

  return (
    <>
      <div className="inventory-grid-wrapper" style={{ pointerEvents: isBusy ? 'none' : 'auto' }}>
        <div>
          <div className="inventory-grid-header-wrapper">
            <p>{inventory.label}</p>
            {inventory.maxWeight && (
              <p>
                {weight / 1000}/{inventory.maxWeight / 1000}kg
              </p>
            )}
          </div>
          <WeightBar percent={inventory.maxWeight ? (weight / inventory.maxWeight) * 100 : 0} />
        </div>
        <div
          className="inventory-grid-container"
          ref={containerRef}
          style={maxDisplaySlots ? { height: dynamicHeight } : undefined}
        >
          <>
            {itemsToDisplay.slice(0, (page + 1) * PAGE_SIZE).map((item, index) => (
              <InventorySlot
                key={`${inventory.type}-${inventory.id}-${item.slot}`}
                item={item}
                ref={index === (page + 1) * PAGE_SIZE - 1 ? ref : null}
                inventoryType={inventory.type}
                inventoryGroups={inventory.groups}
                inventoryId={inventory.id}
              />
            ))}
          </>
        </div>
      </div>
    </>
  );
};

export default InventoryGrid;
