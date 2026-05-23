import React from 'react';
import Svg, { Path, Line, Rect } from 'react-native-svg';

type Props = { size?: number; color?: string };

export default function MicIcon({ size = 28, color = '#ffffff' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Mic body — rounded rectangle */}
      <Rect
        x="9.5"
        y="3"
        width="5"
        height="11"
        rx="2.5"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* U-shaped stand (wider than mic) */}
      <Path
        d="M6 11.5a6 6 0 0 0 12 0"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Stem */}
      <Line
        x1="12"
        y1="17.5"
        x2="12"
        y2="21"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Base line */}
      <Line
        x1="8.5"
        y1="21"
        x2="15.5"
        y2="21"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}