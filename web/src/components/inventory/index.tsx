import React, { useState } from 'react';
import { Stack, Transition, Box } from '@mantine/core';
import useNuiEvent from '../../hooks/useNuiEvent';
import InventoryControl from './InventoryControl/InventoryControl';
import InventoryHotbar from './InventoryHotbar';
import {
  useStore,
  selectShowRightInventory,
  selectSetupInventory,
  selectRefreshSlots,
  selectSetAdditionalMetadata,
  selectCloseContextMenu,
  selectCloseTooltip,
} from '../../store';
import { useExitListener } from '../../hooks/useExitListener';
import type { Inventory as InventoryProps } from '../../typings';
import RightInventory from './RightInventory';
import LeftInventory from './LeftInventory';
import Tooltip from '../utils/Tooltip';
import InventoryContext from './InventoryContext';

const Inventory: React.FC = () => {
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const showRightInventory = useStore(selectShowRightInventory);
  const setupInventory = useStore(selectSetupInventory);
  const refreshSlots = useStore(selectRefreshSlots);
  const setAdditionalMetadata = useStore(selectSetAdditionalMetadata);
  const closeContextMenu = useStore(selectCloseContextMenu);
  const closeTooltip = useStore(selectCloseTooltip);

  useNuiEvent<boolean>('setInventoryVisible', setInventoryVisible);
  useNuiEvent<false>('closeInventory', () => {
    setInventoryVisible(false);
    closeContextMenu();
    closeTooltip();
  });
  useExitListener(setInventoryVisible);

  useNuiEvent<{
    leftInventory?: InventoryProps;
    rightInventory?: InventoryProps;
  }>('setupInventory', (data) => {
    setupInventory(data);
    !inventoryVisible && setInventoryVisible(true);
  });

  useNuiEvent('refreshSlots', (data) => refreshSlots(data));

  useNuiEvent('displayMetadata', (data: Array<{ metadata: string; value: string }>) => {
    setAdditionalMetadata(data);
  });

  return (
    <>
      <Transition mounted={inventoryVisible} transition="fade" duration={200}>
        {(styles) => (
          <Box
            style={styles}
            h="100%"
            w="100%"
            pt={20}
            pb={20}
            pr={30}
          >
            <Stack
              justify="flex-start"
              align="flex-end"
              gap="md"
            >
              <Stack gap="md" w="fit-content">
                <LeftInventory />
                <InventoryControl />
                {showRightInventory && <RightInventory />}
              </Stack>
              <Tooltip />
              <InventoryContext />
            </Stack>
          </Box>
        )}
      </Transition>
      <InventoryHotbar />
    </>
  );
};

export default Inventory;
