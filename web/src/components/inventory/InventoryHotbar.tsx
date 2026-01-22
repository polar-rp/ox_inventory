import React, { useState } from 'react';
import { Affix, Group, Box, Text, Stack, Badge, Transition } from '@mantine/core';
import { getItemUrl, isSlotWithItem } from '../../helpers';
import useNuiEvent from '../../hooks/useNuiEvent';
import { Items } from '../../store/items';
import WeightBar from '../utils/WeightBar';
import { useStore, selectLeftInventory } from '../../store';
import { SlotWithItem } from '../../typings';

const SLOT_SIZE = '9vh';

const InventoryHotbar: React.FC = () => {
  const [hotbarVisible, setHotbarVisible] = useState(false);
  const items = useStore(selectLeftInventory).items.slice(0, 5);

  const [handle, setHandle] = useState<NodeJS.Timeout>();
  useNuiEvent('toggleHotbar', () => {
    if (hotbarVisible) {
      setHotbarVisible(false);
    } else {
      if (handle) clearTimeout(handle);
      setHotbarVisible(true);
      setHandle(setTimeout(() => setHotbarVisible(false), 3000));
    }
  });

  const formatWeight = (weight: number) => {
    if (weight <= 0) return '';
    return weight >= 1000
      ? `${(weight / 1000).toLocaleString('en-us', { minimumFractionDigits: 2 })}kg`
      : `${weight.toLocaleString('en-us', { minimumFractionDigits: 0 })}g`;
  };

  return (
    <Affix position={{ bottom: '2vh', left: '50%' }} style={{ transform: 'translateX(-50%)' }}>
      <Transition mounted={hotbarVisible} transition="slide-up" duration={200}>
        {(styles) => (
          <Group gap={2} style={styles}>
            {items.map((item) => (
              <Box
                key={`hotbar-${item.slot}`}
                w={SLOT_SIZE}
                h={SLOT_SIZE}
                style={{
                  backgroundImage: item?.name ? `url(${getItemUrl(item as SlotWithItem)})` : undefined,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: '7vh',
                  imageRendering: '-webkit-optimize-contrast',
                  borderRadius: 'var(--mantine-radius-sm)',
                  border: '1px solid var(--mantine-color-dark-4)',
                  backgroundColor: 'var(--mantine-color-dark-6)',
                }}
              >
                {isSlotWithItem(item) && (
                  <Stack h="100%" justify="space-between" gap={0}>
                    <Group justify="space-between" align="flex-start" gap={2} wrap="nowrap">
                      <Badge
                        size="xs"
                        color="gray.0"
                        c="dark"
                        radius="xs"
                        style={{ borderTopLeftRadius: 'var(--mantine-radius-sm)' }}
                      >
                        {item.slot}
                      </Badge>
                      <Group gap={2} p={2}>
                        {item.weight > 0 && (
                          <Text size="xs" c="dimmed">{formatWeight(item.weight)}</Text>
                        )}
                        {item.count && (
                          <Text size="xs" c="dimmed">{item.count.toLocaleString('en-us')}x</Text>
                        )}
                      </Group>
                    </Group>

                    <Stack gap={0}>
                      {item?.durability !== undefined && <WeightBar percent={item.durability} durability />}
                      <Box
                        bg="dark.7"
                        ta="center"
                        py={2}
                        px={4}
                        style={{
                          borderTop: '1px solid var(--mantine-color-dark-4)',
                          borderBottomLeftRadius: 'var(--mantine-radius-sm)',
                          borderBottomRightRadius: 'var(--mantine-radius-sm)',
                        }}
                      >
                        <Text size="xs" tt="uppercase" truncate fw={400}>
                          {item.metadata?.label || Items[item.name]?.label || item.name}
                        </Text>
                      </Box>
                    </Stack>
                  </Stack>
                )}
              </Box>
            ))}
          </Group>
        )}
      </Transition>
    </Affix>
  );
};

export default InventoryHotbar;
