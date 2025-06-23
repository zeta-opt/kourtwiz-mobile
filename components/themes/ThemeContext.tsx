import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
  } from 'react';
  import { Provider as PaperProvider, DefaultTheme, DarkTheme } from 'react-native-paper';
  import AsyncStorage from '@react-native-async-storage/async-storage';  
  import { RootState } from '@/store';
  import { useSelector } from 'react-redux';

  // Replace with your custom light/dark theme objects compatible with react-native-paper
  import { lightTheme } from './lightTheme';
  import { darkTheme } from './darkTheme';
  
  const ThemeModeContext = createContext(null);
  
  // AsyncStorage helpers
  const getStorageItem = async (key, fallback = {}) => {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };
  
  const setStorageItem = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };
  
  export const ThemeContextProvider = ({ children }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [mode, setMode] = useState('light');
    const [customThemes, setCustomThemes] = useState([]);
  
    const userId = user?.userId;
    const clubId = user?.currentActiveClubId;
  
    // Load theme mode and custom themes
    useEffect(() => {
      const loadThemes = async () => {
        if (!userId || !clubId) return;
  
        const modesByUser = await getStorageItem('themeModeByUser');
        const themesByUser = await getStorageItem('customThemesByUser');
  
        const themeMode = modesByUser[clubId] || 'light';
        const clubThemes = themesByUser[clubId] || [];
  
        setMode(themeMode);
        setCustomThemes(clubThemes);
      };
  
      loadThemes();
    }, [userId, clubId]);
  
    // Save theme mode when it changes
    useEffect(() => {
      const saveMode = async () => {
        if (!userId || !clubId) return;
  
        const modesByUser = await getStorageItem('themeModeByUser');
        modesByUser[clubId] = mode;
        await setStorageItem('themeModeByUser', modesByUser);
      };
  
      saveMode();
    }, [mode, userId, clubId]);
  
    // Save custom themes when they change
    useEffect(() => {
      const saveThemes = async () => {
        if (!userId || !clubId) return;
  
        const themesByUser = await getStorageItem('customThemesByUser');
        themesByUser[clubId] = customThemes;
        await setStorageItem('customThemesByUser', themesByUser);
      };
  
      saveThemes();
    }, [customThemes, userId, clubId]);
  
    const currentTheme = useMemo(() => {
      if (!userId || !clubId) return DefaultTheme;
  
      if (mode === 'light') return lightTheme;
      if (mode === 'dark') return darkTheme;
  
      const custom = customThemes.find((t) => t.name === mode);
      return custom ? custom.theme : lightTheme;
    }, [mode, customThemes]);
  
    const addCustomTheme = (name, theme) => {
      setCustomThemes((prev) => [...prev, { name, theme }]);
      setMode(name);
    };
  
    return (
      <ThemeModeContext.Provider
        value={{ mode, setTheme: setMode, addCustomTheme, customThemes }}
      >
        <PaperProvider theme={currentTheme}>
          {children}
        </PaperProvider>
      </ThemeModeContext.Provider>
    );
  };
  
  export const useThemeMode = () => useContext(ThemeModeContext);
  