import React, { useMemo } from 'react';
import { Progress } from '@mantine/core';

const colorChannelMixer = (colorChannelA: number, colorChannelB: number, amountToMix: number) => {
  const channelA = colorChannelA * amountToMix;
  const channelB = colorChannelB * (1 - amountToMix);
  return channelA + channelB;
};

const colorMixer = (rgbA: number[], rgbB: number[], amountToMix: number) => {
  const r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
  const g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
  const b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
  return `rgb(${r}, ${g}, ${b})`;
};

const COLORS = {
  primaryColor: [231, 76, 60], // Red
  secondColor: [39, 174, 96], // Green
  accentColor: [211, 84, 0], // Orange
};

interface WeightBarProps {
  percent: number;
  durability?: boolean;
}

const WeightBar: React.FC<WeightBarProps> = ({ percent, durability }) => {
  const color = useMemo(
    () =>
      durability
        ? percent < 50
          ? colorMixer(COLORS.accentColor, COLORS.primaryColor, percent / 100)
          : colorMixer(COLORS.secondColor, COLORS.accentColor, percent / 100)
        : percent > 50
          ? colorMixer(COLORS.primaryColor, COLORS.accentColor, percent / 100)
          : colorMixer(COLORS.accentColor, COLORS.secondColor, percent / 50),
    [durability, percent]
  );

  return (
    <Progress
      value={percent}
      size={durability ? 3 : 'xs'}
      color={color}
      transitionDuration={300}
    />
  );
};

export default WeightBar;
