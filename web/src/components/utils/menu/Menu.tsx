import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Menu as MantineMenu, Portal } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useStore, selectContextMenu, selectCloseContextMenu } from '../../../store';

interface MenuProps {
  label?: string;
  children?: React.ReactNode;
}

interface MenuItemProps {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function MenuItem({ label, disabled, onClick, icon }: MenuItemProps) {
  const closeContextMenu = useStore(selectCloseContextMenu);

  const handleClick = () => {
    onClick?.();
    closeContextMenu();
  };

  return (
    <MantineMenu.Item disabled={disabled} onClick={handleClick} leftSection={icon}>
      {label}
    </MantineMenu.Item>
  );
}

export function Menu({ label, children }: MenuProps) {
  const contextMenu = useStore(selectContextMenu);
  const closeContextMenu = useStore(selectCloseContextMenu);
  const [opened, setOpened] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Keep last position to prevent jump to (0,0) during close animation
  const lastCoordsRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (contextMenu.coords) {
      lastCoordsRef.current = contextMenu.coords;
      setOpened(true);
    } else {
      setOpened(false);
    }
  }, [contextMenu.coords]);

  const handleClose = useCallback(() => {
    setOpened(false);
    closeContextMenu();
  }, [closeContextMenu]);

  // Close menu on click outside
  useEffect(() => {
    if (!opened) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    // Delay adding listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('contextmenu', handleContextMenu);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [opened, handleClose]);

  if (label) {
    return (
      <MantineMenu
        trigger="hover"
        position="right-start"
        offset={0}
        openDelay={75}
        closeDelay={100}
      >
        <MantineMenu.Target>
          <MantineMenu.Item rightSection={<IconChevronRight size={14} />}>
            {label}
          </MantineMenu.Item>
        </MantineMenu.Target>
        <MantineMenu.Dropdown>
          {children}
        </MantineMenu.Dropdown>
      </MantineMenu>
    );
  }

  return (
    <Portal>
      <MantineMenu
        opened={opened}
        onClose={handleClose}
        position="bottom-start"
        withinPortal={false}
        styles={{
          dropdown: {
            position: 'fixed',
            left: lastCoordsRef.current.x,
            top: lastCoordsRef.current.y,
          },
        }}
      >
        <MantineMenu.Dropdown ref={dropdownRef}>
          {children}
        </MantineMenu.Dropdown>
      </MantineMenu>
    </Portal>
  );
}
