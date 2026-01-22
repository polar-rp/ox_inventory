import React, { useContext, useState, useEffect } from 'react';
import { Affix, Card, Stack, Group, Image, Text, Transition, Box } from '@mantine/core';
import { isEnvBrowser } from '../../utils/misc';
import { debugData } from '../../utils/debugData';
import useNuiEvent from '../../hooks/useNuiEvent';
import { Locale } from '../../store/locale';
import { getItemUrl } from '../../helpers';
import { SlotWithItem } from '../../typings';
import { Items } from '../../store/items';

interface ItemNotificationProps {
  item: SlotWithItem;
  text: string;
}

interface NotificationInstance extends ItemNotificationProps {
  id: number;
}

export const ItemNotificationsContext = React.createContext<{
  add: (item: ItemNotificationProps) => void;
} | null>(null);

export const useItemNotifications = () => {
  const itemNotificationsContext = useContext(ItemNotificationsContext);
  if (!itemNotificationsContext) throw new Error(`ItemNotificationsContext undefined`);
  return itemNotificationsContext;
};

const ItemNotification: React.FC<{ item: ItemNotificationProps }> = ({ item }) => {
  const slotItem = item.item;

  return (
    <Card
      withBorder
      shadow="xl"
      padding="xs"
      w={130}
      ta="center"
    >
      <Text
        size="xs"
        fw={800}
        tt="uppercase"
        c="dimmed"
      >
        {item.text}
      </Text>

      <Card.Section withBorder>
        <Image
          src={getItemUrl(slotItem)}
          fit="contain"
          mx="auto"
          w={64}
          h={64}
          alt={slotItem.metadata?.label || Items[slotItem.name]?.label}
        />
      </Card.Section>

      <Text
        size="sm"
        fw={600}
        truncate="end"
      >
        {slotItem.metadata?.label || Items[slotItem.name]?.label}
      </Text>
    </Card>
  );
};

export const ItemNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationInstance[]>([]);

  const add = (item: ItemNotificationProps) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { ...item, id }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  };

  useNuiEvent<[item: SlotWithItem, text: string, count?: number]>('itemNotify', ([item, text, count]) => {
    add({ item: item, text: count ? `${Locale[text] || text} ${count}x` : `${Locale[text] || text}` });
  });

  useEffect(() => {
    if (isEnvBrowser()) {
      debugData([
        {
          action: 'itemNotify',
          data: [
            { name: 'water', metadata: { label: 'Water' } },
            'ui_removed',
            1,
          ],
        },
      ], 1500);

      (window as any).debugNotify = (item: any, text: string, count?: number) => {
        add({
          item: item as SlotWithItem,
          text: count ? `${Locale[text] || text} ${count}x` : `${Locale[text] || text}`
        });
      };
    }
  }, []);

  return (
    <ItemNotificationsContext value={{ add }}>
      {children}
      <Affix position={{ bottom: 30, left: '50%' }} style={{ transform: 'translateX(-50%)', zIndex: 1000 }}>
        <Group gap="md" wrap="nowrap" justify="center">
          {notifications.map((notification) => (
            <Transition
              key={notification.id}
              mounted={true}
              transition="slide-up"
              duration={400}
            >
              {(styles) => (
                <div style={styles}>
                  <ItemNotification item={notification} />
                </div>
              )}
            </Transition>
          ))}
        </Group>
      </Affix>
    </ItemNotificationsContext>
  );
};
