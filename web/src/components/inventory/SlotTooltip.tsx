import { Inventory, SlotWithItem } from '../../typings';
import { Fragment, useMemo } from 'react';
import { Paper, Stack, Group, Text, Divider, Image, Box } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { Items } from '../../store/items';
import { Locale } from '../../store/locale';
import ReactMarkdown from 'react-markdown';
import { useStore, selectAdditionalMetadata } from '../../store';
import { getItemUrl } from '../../helpers';

interface SlotTooltipProps {
  item: SlotWithItem;
  inventoryType: Inventory['type'];
  style: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}

function SlotTooltip({ item, inventoryType, style, ref }: SlotTooltipProps) {
  const additionalMetadata = useStore(selectAdditionalMetadata);
  const itemData = useMemo(() => Items[item.name], [item]);
  const ingredients = useMemo(() => {
    if (!item.ingredients) return null;
    return Object.entries(item.ingredients).sort((a, b) => a[1] - b[1]);
  }, [item]);
  const description = item.metadata?.description || itemData?.description;
  const ammoName = itemData?.ammoName && Items[itemData?.ammoName]?.label;

  if (!itemData) {
    return (
      <Paper
        ref={ref}
        style={{ ...style, pointerEvents: 'none' }}
        shadow="md"
        p="xs"
        withBorder
        w={200}
        maw={250}
      >
        <Text size="sm" fw={500}>{item.name}</Text>
        <Divider my="xs" />
      </Paper>
    );
  }

  return (
    <Paper
      ref={ref}
      style={{ ...style, pointerEvents: 'none' }}
      shadow="md"
      p="xs"
      withBorder
      w={200}
      maw={250}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>
            {item.metadata?.label || itemData.label || item.name}
          </Text>
          {inventoryType === 'crafting' ? (
            <Group gap={4}>
              <IconClock size={14} />
              <Text size="xs">{(item.duration !== undefined ? item.duration : 3000) / 1000}s</Text>
            </Group>
          ) : (
            item.metadata?.type && <Text size="xs" c="dimmed">{item.metadata.type}</Text>
          )}
        </Group>

        <Divider />

        {description && (
          <Box>
            <ReactMarkdown
              components={{
                p: ({ children }) => <Text size="xs" c="dimmed">{children}</Text>,
              }}
            >
              {description}
            </ReactMarkdown>
          </Box>
        )}

        {inventoryType !== 'crafting' ? (
          <Stack gap={2}>
            {item.durability !== undefined && (
              <Text size="xs">
                {Locale.ui_durability}: {Math.trunc(item.durability)}
              </Text>
            )}
            {item.metadata?.ammo !== undefined && (
              <Text size="xs">
                {Locale.ui_ammo}: {item.metadata.ammo}
              </Text>
            )}
            {ammoName && (
              <Text size="xs">
                {Locale.ammo_type}: {ammoName}
              </Text>
            )}
            {item.metadata?.serial && (
              <Text size="xs">
                {Locale.ui_serial}: {item.metadata.serial}
              </Text>
            )}
            {item.metadata?.components && item.metadata?.components[0] && (
              <Text size="xs">
                {Locale.ui_components}:{' '}
                {item.metadata.components.map((component: string, index: number, array: string[]) =>
                  index + 1 === array.length ? Items[component]?.label : Items[component]?.label + ', '
                )}
              </Text>
            )}
            {item.metadata?.weapontint && (
              <Text size="xs">
                {Locale.ui_tint}: {item.metadata.weapontint}
              </Text>
            )}
            {additionalMetadata.map((data: { metadata: string; value: string }, index: number) => (
              <Fragment key={`metadata-${index}`}>
                {item.metadata && item.metadata[data.metadata] && (
                  <Text size="xs">
                    {data.value}: {item.metadata[data.metadata]}
                  </Text>
                )}
              </Fragment>
            ))}
          </Stack>
        ) : (
          <Stack gap={4}>
            {ingredients?.map((ingredient) => {
              const [ingredientName, count] = [ingredient[0], ingredient[1]];
              return (
                <Group key={`ingredient-${ingredientName}`} gap="xs" wrap="nowrap">
                  <Image
                    src={ingredientName ? getItemUrl(ingredientName) : 'none'}
                    w={24}
                    h={24}
                    fit="contain"
                  />
                  <Text size="xs">
                    {count >= 1
                      ? `${count}x ${Items[ingredientName]?.label || ingredientName}`
                      : count === 0
                        ? `${Items[ingredientName]?.label || ingredientName}`
                        : `${count * 100}% ${Items[ingredientName]?.label || ingredientName}`}
                  </Text>
                </Group>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default SlotTooltip;
