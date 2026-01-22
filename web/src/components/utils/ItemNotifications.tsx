import React, { useContext, useEffect, useState } from 'react';
import { Affix, Paper, Stack, Group, Image, Text, Transition, Box, rem } from '@mantine/core';
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
    <Paper
      withBorder
      p="sm"
      shadow="xl"
      w={rem(130)}
    >
      <Stack gap={4} align="center">
        <Text size="xs" fw={800} tt="uppercase" ta="center">
          {item.text}
        </Text>

        <Box pos="relative" w={rem(64)} h={rem(64)}>
          <Image
            src={getItemUrl(slotItem)}
            fallbackSrc="none"
            fit="contain"
          />
        </Box>

        <Text size="xs" fw={600} tt="uppercase" ta="center" truncate="end" w="100%" c="gray.1">
          {slotItem.metadata?.label || Items[slotItem.name]?.label}
        </Text>
      </Stack>
    </Paper>
  );
};

export const ItemNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationInstance[]>([]);

  const add = (item: ItemNotificationProps) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { ...item, id }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  useNuiEvent<[item: SlotWithItem, text: string, count?: number]>('itemNotify', ([item, text, count]) => {
    add({ item: item, text: count ? `${Locale[text]} ${count}x` : `${Locale[text]}` });
  });

  return (
    <ItemNotificationsContext.Provider value={{ add }}>
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
    </ItemNotificationsContext.Provider>
  );
};
