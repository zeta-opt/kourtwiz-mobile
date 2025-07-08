import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5E3ADB',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#5E3ADB',
    background: '#000000',
    surface: '#1c1c1e',
    text: '#ffffff',
  },
};
