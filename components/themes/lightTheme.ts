import { MD3LightTheme as PaperLightTheme } from 'react-native-paper';

const lightTheme = {
  ...PaperLightTheme,
  colors: {
    ...PaperLightTheme.colors,
    primary: '#1976d2',
    secondary: '#9c27b0', // custom (used in components manually)
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#d32f2f',
    text: '#1a1a1a',
    onBackground: '#1a1a1a',
    onSurface: '#1a1a1a',
    divider: '#e0e0e0', // custom
    info: '#0288d1',    // custom
  },
};

export default lightTheme;
