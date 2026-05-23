import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

type Props = {
  theme: 'dark' | 'light';
  onToggle: () => void;
};

function SunIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={1.8} />
      <Line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="20" x2="12" y2="22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="2" y1="12" x2="4" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="20" y1="12" x2="22" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="4.9" y1="4.9" x2="6.3" y2="6.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="17.7" y1="17.7" x2="19.1" y2="19.1" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="4.9" y1="19.1" x2="6.3" y2="17.7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="17.7" y1="6.3" x2="19.1" y2="4.9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function MoonIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ThemeToggle({ theme, onToggle }: Props) {
  const position = useRef(new Animated.Value(theme === 'dark' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(position, {
      toValue: theme === 'dark' ? 0 : 1,
      useNativeDriver: false,
      friction: 7,
      tension: 60,
    }).start();
  }, [theme]);

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 28],
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <View
        style={[
          styles.track,
          { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#e4e6eb' },
        ]}
      >
        <View style={styles.iconWrap}>
          <MoonIcon color={theme === 'dark' ? '#8e8e93' : '#65676b'} />
        </View>
        <View style={styles.iconWrap}>
          <SunIcon color={theme === 'dark' ? '#8e8e93' : '#65676b'} />
        </View>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX }],
              backgroundColor: theme === 'dark' ? '#000' : '#fff',
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 56,
    height: 28,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    position: 'relative',
  },
  iconWrap: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    top: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});