import { useEffect } from 'react';
import { useStore, selectSetShiftPressed } from '../../store';
import useKeyPress from '../../hooks/useKeyPress';

const KeyPress: React.FC = () => {
  const setShiftPressed = useStore(selectSetShiftPressed);
  const shiftPressed = useKeyPress('Shift');

  useEffect(() => {
    setShiftPressed(shiftPressed);
  }, [shiftPressed, setShiftPressed]);

  return <></>;
};

export default KeyPress;
