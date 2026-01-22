import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Button, NumberInput, Group, ActionIcon, Paper, Affix, CloseButton } from "@mantine/core";
import { IconInfoCircle, IconHandGrab, IconGift, IconLogout } from "@tabler/icons-react";
import { useStore, selectItemAmount, selectSetItemAmount } from "../../../store";
import { fetchNui } from "../../../utils/fetchNui";
import { Locale } from "../../../store/locale";
import UsefulControls from "../UsefulControls/UsefulControls";
import { useDisclosure } from "@mantine/hooks";

const InventoryControl: React.FC = () => {
    const itemAmount = useStore(selectItemAmount);
    const setItemAmount = useStore(selectSetItemAmount);
    const [infoVisible, { open, close }] = useDisclosure(false);

    const { setNodeRef: useRef, isOver: isOverUse } = useDroppable({
        id: "control-use",
        data: { action: "use" },
    });

    const { setNodeRef: giveRef, isOver: isOverGive } = useDroppable({
        id: "control-give",
        data: { action: "give" },
    });

    const handleAmountChange = (value: string | number) => {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        const sanitizedValue = isNaN(numValue) || numValue < 0 ? 0 : Math.floor(numValue);
        setItemAmount(sanitizedValue);
    };

    const handleReset = () => setItemAmount(0);

    return (
        <>
            <UsefulControls opened={infoVisible} onClose={close} />

            <Paper shadow="md" p="xs" withBorder w="100%">
                <Group justify="space-between">
                    <NumberInput
                        value={itemAmount}
                        onChange={handleAmountChange}
                        min={0}
                        w={80}
                        hideControls
                        allowNegative={false}
                        allowDecimal={false}
                        rightSection={
                            itemAmount > 0 && (
                                <CloseButton
                                    size="sm"
                                    onClick={handleReset}
                                    aria-label="Reset amount"
                                />
                            )
                        }
                        rightSectionPointerEvents="auto"
                    />

                    <Group gap="xs">
                        <Button
                            ref={useRef}
                            variant={isOverUse ? "light" : "filled"}
                            leftSection={<IconHandGrab size={16} />}
                            size="sm"
                        >
                            {Locale.ui_use || "Use"}
                        </Button>

                        <Button
                            ref={giveRef}
                            variant={isOverGive ? "light" : "filled"}
                            leftSection={<IconGift size={16} />}
                            size="sm"
                        >
                            {Locale.ui_give || "Give"}
                        </Button>
                    </Group>

                    <Button
                        onClick={() => fetchNui("exit")}
                        variant="light"
                        color="gray"
                        leftSection={<IconLogout size={16} />}
                        size="sm"
                    >
                        {Locale.ui_close || "Close"}
                    </Button>
                </Group>
            </Paper>

            <Affix position={{ bottom: 30, right: 30 }}>
                <ActionIcon
                    size="xl"
                    onClick={open}
                    variant="default"
                >
                    <IconInfoCircle />
                </ActionIcon>
            </Affix>
        </>
    );
};

export default InventoryControl;
