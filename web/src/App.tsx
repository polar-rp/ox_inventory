import { useCallback, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import InventoryComponent from './components/inventory';
import useNuiEvent from './hooks/useNuiEvent';
import { Items } from './store/items';
import { Locale } from './store/locale';
import { setImagePath } from './store/imagepath';
import { setupInventory } from './store/inventory';
import { DragSource, DropTarget, Inventory, InventoryType } from './typings';
import { useAppDispatch } from './store';
import { debugData } from './utils/debugData';
import { fetchNui } from './utils/fetchNui';
import { onDrop } from './dnd/onDrop';
import { onBuy } from './dnd/onBuy';
import { onCraft } from './dnd/onCraft';
import { onUse } from './dnd/onUse';
import { onGive } from './dnd/onGive';
import { closeTooltip } from './store/tooltip';
import KeyPress from './components/utils/KeyPress';

debugData([
  {
    action: 'setupInventory',
    data: {
      leftInventory: {
        id: 'test',
        type: 'player',
        slots: 50,
        label: 'Bob Smith',
        weight: 3000,
        maxWeight: 5000,
        items: [
          {
            slot: 1,
            name: 'burger',
            weight: 350,

            count: 5,
          },
          { slot: 2, name: 'paperbag', weight: 4, count: 1, metadata: { durability: 75 } },
          { slot: 3, name: 'phone', weight: 240, count: 12, metadata: { type: 'Special' } },
          {
            slot: 4,
            name: 'water',
            weight: 100,
            count: 1,
            metadata: { description: 'Generic item description' },
          },
          { slot: 5, name: 'water', weight: 100, count: 1 },
        ],
      },
      rightInventory: {
        id: 'shop',
        type: 'crafting',
        slots: 5000,
        label: 'Bob Smith',
        weight: 3000,
        maxWeight: 5000,
        items: [
          {
            slot: 1,
            name: 'lockpick',
            weight: 500,
            price: 300,
            ingredients: {
              iron: 5,
              copper: 12,
              powersaw: 0.1,
            },
            metadata: {
              description: 'Simple lockpick that breaks easily and can pick basic door locks',
            },
          },
        ],
      },
    },
  },
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeDragData, setActiveDragData] = useState<DragSource | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  useNuiEvent<{
    locale: { [key: string]: string };
    items: typeof Items;
    leftInventory: Inventory;
    imagepath: string;
  }>('init', ({ locale, items, leftInventory, imagepath }) => {
    for (const name in locale) Locale[name] = locale[name];
    for (const name in items) Items[name] = items[name];

    setImagePath(imagepath);
    dispatch(setupInventory({ leftInventory }));
  });

  fetchNui('uiLoaded', {});

  useNuiEvent('closeInventory', () => {
    setActiveDragData(null);
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragSource | undefined;
    if (data) {
      setActiveDragData(data);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragData(null);
      dispatch(closeTooltip());

      const { active, over } = event;

      if (!over || !active.data.current) return;

      const source = active.data.current as DragSource;
      const targetData = over.data.current as DropTarget | { action: string } | undefined;

      if (!targetData) return;

      // Handle control buttons (Use/Give)
      if ('action' in targetData) {
        if (targetData.action === 'use' && source.inventory === 'player') {
          onUse(source.item);
        } else if (targetData.action === 'give' && source.inventory === 'player') {
          onGive(source.item);
        }
        return;
      }

      // Handle inventory drops
      switch (source.inventory) {
        case InventoryType.SHOP:
          onBuy(source, targetData);
          break;
        case InventoryType.CRAFTING:
          onCraft(source, targetData);
          break;
        default:
          onDrop(source, targetData);
          break;
      }
    },
    [dispatch]
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="app-wrapper">
        <InventoryComponent />
        <DragOverlay dropAnimation={null}>
          {activeDragData && (
            <div
              className="item-drag-preview"
              style={{
                backgroundImage: activeDragData.image,
              }}
            />
          )}
        </DragOverlay>
        <KeyPress />
      </div>
    </DndContext>
  );
};

addEventListener('dragstart', function (event) {
  event.preventDefault();
});

export default App;
