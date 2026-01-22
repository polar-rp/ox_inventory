import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Paper, Stack, Group, Text, SimpleGrid, ScrollArea, Box } from '@mantine/core';
import { Inventory } from '../../typings';
import WeightBar from '../utils/WeightBar';
import InventorySlot from './InventorySlot';
import { getTotalWeight } from '../../helpers';
import { useStore, selectIsBusy } from '../../store';
import { useIntersection } from '../../hooks/useIntersection';

const PAGE_SIZE = 30;
const GRID_COLS = 5;
const SLOT_SIZE = '9vh';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useStore(selectIsBusy);

  const displayCount = maxDisplaySlots || inventory.slots;
  const itemsToDisplay = inventory.items.slice(0, displayCount);
  const gridRows = Math.ceil(displayCount / GRID_COLS);
  const dynamicHeight = maxDisplaySlots ? `calc(${gridRows} * (${SLOT_SIZE} + 2px))` : `calc(5 * (${SLOT_SIZE} + 2px))`;

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      setPage((prev) => ++prev);
    }
  }, [entry]);

  return (
    <Paper
      shadow="md"
      p="xs"
      withBorder
      style={{ pointerEvents: isBusy ? 'none' : 'auto' }}
    >
      <Stack gap="xs">
        <Box>
          <Group justify="space-between" mb={4}>
            <Text size="sm" fw={500}>{inventory.label}</Text>
            {inventory.maxWeight && (
              <Text size="sm" c="dimmed">
                {weight / 1000}/{inventory.maxWeight / 1000}kg
              </Text>
            )}
          </Group>
          <WeightBar percent={inventory.maxWeight ? (weight / inventory.maxWeight) * 100 : 0} />
        </Box>

        <ScrollArea h={dynamicHeight} ref={containerRef} scrollbars="y">
          <SimpleGrid cols={GRID_COLS} spacing={4}>
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
          </SimpleGrid>
        </ScrollArea>
      </Stack>
    </Paper>
  );
};

export default InventoryGrid;
