/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';
import {
  MD3LightTheme,
  MD3DarkTheme,
  MD3Theme,
  configureFonts
} from 'react-native-paper';

const fontConfig = {
  default: {
    fontFamily: 'System',
  },
};

export const colors = {
  primary: '#FF6B9D',
  primaryDark: '#E0527F',
  secondary: '#845EC2',
  background: '#FFF8FB',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F0F4',
  error: '#CF6679',
  success: '#4CAF50',
  warning: '#FFC107',
  text: '#2D1B33',
  textSecondary: '#7B5B70',
  textLight: '#B09BAB',
  border: '#EAD8E5',
  cardBg: '#FFFFFF',
  pink100: '#FFE4EF',
  pink200: '#FFB8D5',
  purple100: '#EEE4FF',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.pink100,
    secondary: colors.secondary,
    secondaryContainer: colors.purple100,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    background: colors.background,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: colors.text,
    onSurface: colors.text,
    outline: colors.border,
      accent: '#FF9671',

  },
  roundness: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' },
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 20, fontWeight: '600' },
  h4: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const PaperLightTheme = {
  ...MD3LightTheme,
  roundness: 6,
  //fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,

    primary: '#6B645B',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E6DFD6',
    onPrimaryContainer: '#3B3732',

    secondary: '#8C857B',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#EDE6DC',
    onSecondaryContainer: '#3F3B36',

    tertiary: '#A89F94',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#F2EBE1',
    onTertiaryContainer: '#423E39',

    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',

    background: '#F5EFE6',
    onBackground: '#2B2A28',

    surface: '#F2EBE1',
    onSurface: '#2B2A28',

    surfaceVariant: '#E3DDD4',
    onSurfaceVariant: '#4A463F',

    outline: '#938F88',
    outlineVariant: '#C7C2BB',

    inverseSurface: '#31302D',
    inverseOnSurface: '#F5EFE6',
    inversePrimary: '#CFC6BB',

    shadow: '#000000',
    scrim: '#000000',

    surfaceDisabled: 'rgba(43,42,40,0.12)',
    onSurfaceDisabled: 'rgba(43,42,40,0.38)',

    backdrop: 'rgba(74,70,63,0.4)',
      accent: '#a39a2f',

  },
};
export const PaperDarkTheme = {
  ...MD3DarkTheme,
  roundness: 6,
  //fonts:configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,

    primary: '#CFC6BB',
    onPrimary: '#3A3732',
    primaryContainer: '#4A463F',
    onPrimaryContainer: '#E6DFD6',

    secondary: '#D8D0C5',
    onSecondary: '#3F3B36',
    secondaryContainer: '#5A554E',
    onSecondaryContainer: '#EDE6DC',

    tertiary: '#E3DBD0',
    onTertiary: '#423E39',
    tertiaryContainer: '#6A645C',
    onTertiaryContainer: '#F2EBE1',

    error: '#F2B8B5',
    onError: '#601410',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',

    background: '#1F1D1A',
    onBackground: '#E6DFD6',

    surface: '#262421',
    onSurface: '#E6DFD6',

    surfaceVariant: '#49443D',
    onSurfaceVariant: '#C7C2BB',

    outline: '#8F8A83',
    outlineVariant: '#4A463F',

    inverseSurface: '#E6DFD6',
    inverseOnSurface: '#2B2A28',
    inversePrimary: '#6B645B',

    shadow: '#000000',
    scrim: '#000000',

    surfaceDisabled: 'rgba(230,223,214,0.12)',
    onSurfaceDisabled: 'rgba(230,223,214,0.38)',

    backdrop: 'rgba(74,70,63,0.4)',
      accent: '#FF9671',

  },
};
