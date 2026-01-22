import React from "react";
import { Modal, Stack, Text, Divider, Kbd } from "@mantine/core";
import { Locale } from "../../../store/locale";

interface Props {
    opened: boolean;
    onClose: () => void;
}

const UsefulControls: React.FC<Props> = ({ opened, onClose }) => {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={Locale.ui_usefulcontrols || "Useful controls"}
            centered
            size="md"
        >
            <Stack gap="lg">
                <div>
                    <Kbd>RMB</Kbd>
                    <Text size="sm" mt="xs" c="dimmed">
                        {Locale.ui_rmb}
                    </Text>
                </div>

                <Divider />

                <div>
                    <Kbd>ALT</Kbd> + <Kbd>LMB</Kbd>
                    <Text size="sm" mt="xs" c="dimmed">
                        {Locale.ui_alt_lmb}
                    </Text>
                </div>

                <Divider />

                <div>
                    <Kbd>CTRL</Kbd> + <Kbd>LMB</Kbd>
                    <Text size="sm" mt="xs" c="dimmed">
                        {Locale.ui_ctrl_lmb}
                    </Text>
                </div>

                <Divider />

                <div>
                    <Kbd>SHIFT</Kbd> + <Text component="span">Drag</Text>
                    <Text size="sm" mt="xs" c="dimmed">
                        {Locale.ui_shift_drag}
                    </Text>
                </div>

                <Divider />

                <div>
                    <Kbd>CTRL</Kbd> + <Kbd>SHIFT</Kbd> + <Kbd>LMB</Kbd>
                    <Text size="sm" mt="xs" c="dimmed">
                        {Locale.ui_ctrl_shift_lmb}
                    </Text>
                </div>

                <Text ta="right" mt="md">🐂</Text>
            </Stack>
        </Modal>
    );
};

export default UsefulControls;