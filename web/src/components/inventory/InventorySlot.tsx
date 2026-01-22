import React, { useCallback, useRef } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Box, Text, Group, Stack, Image, Badge } from '@mantine/core';
import { DragSource, Inventory, InventoryType, Slot, SlotWithItem } from '../../typings';
import { useStore, selectOpenTooltip, selectCloseTooltip, selectOpenContextMenu } from '../../store';
import WeightBar from '../utils/WeightBar';
import { onDrop } from '../../dnd/onDrop';
import { Items } from '../../store/items';
import { canCraftItem, canPurchaseItem, getItemUrl, isSlotWithItem } from '../../helpers';
import { onUse } from '../../dnd/onUse';
import { Locale } from '../../store/locale';
import { useMergeRefs } from '@floating-ui/react';

const SLOT_SIZE = '9vh';

interface SlotProps {
  inventoryId: Inventory['id'];
  inventoryType: Inventory['type'];
  inventoryGroups: Inventory['groups'];
  item: Slot;
  ref?: React.Ref<HTMLDivElement>;
}

function InventorySlot({ item, inventoryId, inventoryType, inventoryGroups, ref }: SlotProps) {
  const openTooltip = useStore(selectOpenTooltip);
  const closeTooltip = useStore(selectCloseTooltip);
  const openContextMenu = useStore(selectOpenContextMenu);
  const timerRef = useRef<number | null>(null);

  const canDrag = useCallback(() => {
    return canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) && canCraftItem(item, inventoryType);
  }, [item, inventoryType, inventoryGroups]);

  const uniqueId = `${inventoryType}-${inventoryId}-${item.slot}`;

  const dragData: DragSource | null = isSlotWithItem(item, inventoryType !== InventoryType.SHOP)
    ? {
        inventory: inventoryType as Inventory['type'],
        item: {
          name: item.name,
          slot: item.slot,
        },
        image: item?.name ? `url(${getItemUrl(item) || 'none'}` : undefined,
      }
    : null;

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: uniqueId,
    data: dragData || undefined,
    disabled: !canDrag() || !dragData,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `drop-${uniqueId}`,
    data: {
      item: { slot: item.slot },
      inventory: inventoryType,
    },
    disabled: inventoryType === InventoryType.SHOP || inventoryType === InventoryType.CRAFTING,
  });

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setDraggableRef(node);
      setDroppableRef(node);
    },
    [setDraggableRef, setDroppableRef]
  );

  const handleContext = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (inventoryType !== 'player' || !isSlotWithItem(item)) return;
    openContextMenu({ item, coords: { x: event.clientX, y: event.clientY } });
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    closeTooltip();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (event.ctrlKey && isSlotWithItem(item) && inventoryType !== 'shop' && inventoryType !== 'crafting') {
      onDrop({ item: item, inventory: inventoryType });
    } else if (event.altKey && isSlotWithItem(item) && inventoryType === 'player') {
      onUse(item);
    }
  };

  const refs = useMergeRefs([combinedRef, ref]);

  const formatWeight = (weight: number) => {
    if (weight <= 0) return '';
    return weight >= 1000
      ? `${(weight / 1000).toLocaleString('en-us', { minimumFractionDigits: 2 })}kg`
      : `${weight.toLocaleString('en-us', { minimumFractionDigits: 0 })}g`;
  };

  const isDisabled = !canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) || !canCraftItem(item, inventoryType);
  const isHotslot = inventoryType === 'player' && item.slot <= 5;

  return (
    <Box
      ref={refs}
      {...listeners}
      {...attributes}
      onContextMenu={handleContext}
      onClick={handleClick}
      w={SLOT_SIZE}
      h={SLOT_SIZE}
      pos="relative"
      style={{
        filter: isDisabled ? 'brightness(80%) grayscale(100%)' : undefined,
        opacity: isDragging ? 0.4 : 1.0,
        backgroundImage: item?.name ? `url(${getItemUrl(item as SlotWithItem)})` : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '7vh',
        imageRendering: '-webkit-optimize-contrast',
        borderRadius: 'var(--mantine-radius-sm)',
        border: isOver ? '1px dashed rgba(255,255,255,0.4)' : '1px solid var(--mantine-color-dark-4)',
        backgroundColor: 'var(--mantine-color-dark-6)',
        cursor: 'pointer',
      }}
    >
      {isSlotWithItem(item) && (
        <Stack
          h="100%"
          justify="space-between"
          gap={0}
          onMouseEnter={() => {
            timerRef.current = window.setTimeout(() => {
              openTooltip({ item, inventoryType });
            }, 500) as unknown as number;
          }}
          onMouseLeave={() => {
            closeTooltip();
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
          }}
        >
          <Group justify={isHotslot ? 'space-between' : 'flex-end'} align="flex-start" gap={2} wrap="nowrap">
            {isHotslot && (
              <Badge
                size="xs"
                color="gray.0"
                c="dark"
                radius="xs"
                style={{ borderTopLeftRadius: 'var(--mantine-radius-sm)' }}
              >
                {item.slot}
              </Badge>
            )}
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
            {inventoryType !== 'shop' && item?.durability !== undefined && (
              <WeightBar percent={item.durability} durability />
            )}

            {inventoryType === 'shop' && item?.price !== undefined && item.price > 0 && (
              <Group justify="flex-end" gap={2} px={4}>
                {item?.currency !== 'money' && item.currency !== 'black_money' && item.currency ? (
                  <>
                    <Image
                      src={getItemUrl(item.currency)}
                      w={16}
                      h={16}
                      fit="contain"
                    />
                    <Text size="xs" fw={500}>{item.price.toLocaleString('en-us')}</Text>
                  </>
                ) : (
                  <Text
                    size="xs"
                    fw={500}
                    c={item.currency === 'money' || !item.currency ? 'green' : 'red'}
                    style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.7)' }}
                  >
                    {Locale.$ || '$'}{item.price.toLocaleString('en-us')}
                  </Text>
                )}
              </Group>
            )}

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
              <Text
                size="xs"
                tt="uppercase"
                truncate
                fw={400}
              >
                {item.metadata?.label || Items[item.name]?.label || item.name}
              </Text>
            </Box>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}

export default React.memo(InventorySlot);
