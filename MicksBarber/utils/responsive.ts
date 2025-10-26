import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints for different screen sizes
export const Breakpoints = {
  small: 320,
  medium: 375,
  large: 414,
  xlarge: 768,
};

// Device type detection
export const DeviceType = {
  isSmall: SCREEN_WIDTH < Breakpoints.medium,
  isMedium: SCREEN_WIDTH >= Breakpoints.medium && SCREEN_WIDTH < Breakpoints.large,
  isLarge: SCREEN_WIDTH >= Breakpoints.large && SCREEN_WIDTH < Breakpoints.xlarge,
  isTablet: SCREEN_WIDTH >= Breakpoints.xlarge,
  isMobile: SCREEN_WIDTH < Breakpoints.xlarge,
};

// Responsive scale
export const scale = (size: number): number => {
  const baseWidth = 375; // iPhone X width as baseline
  return (SCREEN_WIDTH / baseWidth) * size;
};

// Responsive font size
export const scaleFont = (size: number): number => {
  const baseWidth = 375;
  const fontSize = (SCREEN_WIDTH / baseWidth) * size;
  return Math.max(12, Math.min(fontSize, 24)); // Clamp between 12 and 24
};

// Get responsive value based on screen width
export const responsiveWidth = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

// Get responsive height based on screen height
export const responsiveHeight = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Padding helpers
export const getResponsivePadding = () => ({
  horizontal: DeviceType.isSmall ? 12 : DeviceType.isTablet ? 24 : 16,
  vertical: DeviceType.isSmall ? 8 : DeviceType.isTablet ? 16 : 12,
  large: DeviceType.isSmall ? 16 : DeviceType.isTablet ? 32 : 20,
});

// Margin helpers
export const getResponsiveMargin = () => ({
  small: DeviceType.isSmall ? 4 : DeviceType.isTablet ? 12 : 8,
  medium: DeviceType.isSmall ? 8 : DeviceType.isTablet ? 20 : 12,
  large: DeviceType.isSmall ? 12 : DeviceType.isTablet ? 32 : 16,
  xlarge: DeviceType.isSmall ? 16 : DeviceType.isTablet ? 48 : 24,
});

// Font size helpers
export const getResponsiveFontSize = () => ({
  xs: scaleFont(10),
  sm: scaleFont(12),
  base: scaleFont(14),
  lg: scaleFont(16),
  xl: scaleFont(18),
  xxl: scaleFont(20),
  xxxl: scaleFont(24),
  title: scaleFont(28),
  hero: scaleFont(32),
});

// Card size helpers
export const getCardDimensions = () => ({
  width: DeviceType.isSmall ? SCREEN_WIDTH - 32 : DeviceType.isTablet ? 400 : SCREEN_WIDTH - 40,
  minHeight: DeviceType.isSmall ? 100 : DeviceType.isTablet ? 150 : 120,
});

// Grid helpers
export const getColumnCount = (baseCount: number = 2): number => {
  if (DeviceType.isTablet) {
    return baseCount + 1;
  } else if (DeviceType.isLarge) {
    return baseCount;
  } else {
    return Math.max(1, baseCount - 1);
  }
};

// Export screen dimensions
export const getDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
});

