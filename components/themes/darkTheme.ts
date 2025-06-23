import { MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';

export const darkTheme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#1976d2',
    secondary: '#ffffff',
    background: '#000000',
    surface: '#000000',
    error: '#f44336',
    text: '#ffffff',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
    info: '#2196f3', // optional, not native to react-native-paper, can be custom
  },
};

export default darkTheme;
