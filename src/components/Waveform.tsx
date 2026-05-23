import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const BAR_COUNT = 28;

type Props = {
  color: string;
  metering: number; // -160 (silent) to 0 (max volume) dB
};

export default function Waveform({ color, metering }: Props) {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.15))
  ).current;
  const history = useRef<number[]>(Array(BAR_COUNT).fill(0.15));

  useEffect(() => {
    // metering: -160 (silent) → 0 (loudest)
    // Map to 0..1 range
    const normalized = Math.max(0, Math.min(1, (metering + 60) / 60));
    // Add slight randomness so bars look natural
    const level = normalized * 0.9 + Math.random() * 0.1;

    // Shift history left and add new value at end
    history.current.shift();
    history.current.push(level);

    // Animate each bar to its position in history
    history.current.forEach((value, i) => {
      Animated.timing(bars[i], {
        toValue: Math.max(0.15, value),
        duration: 80,
        useNativeDriver: false,
      }).start();
    });
  }, [metering]);

  return (
    <View style={styles.container}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: bar.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 32],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 40,
  },
  bar: { width: 3, borderRadius: 2 },
});