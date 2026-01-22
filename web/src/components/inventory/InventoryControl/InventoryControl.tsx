import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Button, NumberInput, Group, ActionIcon, Paper, Affix } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { selectItemAmount, setItemAmount } from "../../../store/inventory";
import { fetchNui } from "../../../utils/fetchNui";
import { Locale } from "../../../store/locale";
import UsefulControls from "../UsefulControls/UsefulControls";
import { useDisclosure } from "@mantine/hooks";

const InventoryControl: React.FC = () => {
    const itemAmount = useAppSelector(selectItemAmount);
    const dispatch = useAppDispatch();
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
        dispatch(setItemAmount(sanitizedValue));
    };

    return (
        <>
            <UsefulControls opened={infoVisible} onClose={close} />

            <Paper shadow="md" p="md" withBorder>
                <Group >
                    <NumberInput
                        value={itemAmount}
                        onChange={handleAmountChange}
                        min={0}
                        w={100}
                        hideControls
                        allowNegative={false}
                        allowDecimal={false}
                    />

                    <Button
                        ref={useRef}
                        variant={isOverUse ? "light" : "filled"}
                    >
                        {Locale.ui_use || "Use"}
                    </Button>

                    <Button
                        ref={giveRef}
                        variant={isOverGive ? "light" : "filled"}
                    >
                        {Locale.ui_give || "Give"}
                    </Button>

                    <Button onClick={() => fetchNui("exit")}>
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