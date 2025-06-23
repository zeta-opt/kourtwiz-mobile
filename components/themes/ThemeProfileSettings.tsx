import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Title,
  useTheme,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useThemeMode } from './ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const defaultNewTheme = {
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#ffffff', paper: '#f5f5f5' },
    text: { primary: '#000000', secondary: '#5f5f5f' },
    error: { main: '#f44336' },
    info: { main: '#2196f3' },
  },
};

const ThemeProfileSettings = () => {
  const { setTheme, addCustomTheme, customThemes } = useThemeMode();
  const [open, setOpen] = useState(false);
  const [newTheme, setNewTheme] = useState(defaultNewTheme);
  const [name, setName] = useState('');

  const handleInputChange = (path: string, value: string) => {
    const keys = path.split('.');
    const updatedTheme = { ...newTheme };
    let current = updatedTheme as any;
    while (keys.length > 1) {
      const key = keys.shift();
      current[key!] = { ...current[key!] };
      current = current[key!];
    }
    current[keys[0]] = value;
    setNewTheme(updatedTheme);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    addCustomTheme(name.trim(), newTheme);
    setOpen(false);
    setName('');
    setNewTheme(defaultNewTheme);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Theme Settings</Title>

      <View style={styles.cardRow}>
        <Card style={styles.themeCard} onPress={() => setTheme('light')}>
          <Card.Content>
            <Text style={styles.cardTitle}>Light Theme</Text>
            <Text style={styles.cardSubtitle}>Click to Apply</Text>
          </Card.Content>
        </Card>

        <Card style={styles.themeCard} onPress={() => setTheme('dark')}>
          <Card.Content>
            <Text style={styles.cardTitle}>Dark Theme</Text>
            <Text style={styles.cardSubtitle}>Click to Apply</Text>
          </Card.Content>
        </Card>

        {customThemes.map((theme: any) => (
          <Card key={theme.name} style={styles.themeCard} onPress={() => setTheme(theme.name)}>
            <Card.Content>
              <Text style={styles.cardTitle}>{theme.name}</Text>
              <Text style={styles.cardSubtitle}>Click to Apply</Text>
            </Card.Content>
          </Card>
        ))}

        <TouchableOpacity onPress={() => setOpen(true)}>
          <Card style={[styles.themeCard, styles.addCard]}>
            <Card.Content style={styles.centered}>
              <Icon name="add" size={24} color="#fff" />
              <Text style={styles.cardSubtitle}>Add Theme</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </View>

      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)}>
          <Dialog.Title>Create Custom Theme</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Theme Name"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 12 }}
            />
            {Object.entries(newTheme.palette).map(([sectionKey, sectionVal]) => {
              if (typeof sectionVal === 'object') {
                return Object.entries(sectionVal).map(([colorKey, colorVal]) => {
                  const fullKey = `palette.${sectionKey}.${colorKey}`;
                  return (
                    <TextInput
                      key={fullKey}
                      label={`${sectionKey}.${colorKey}`}
                      mode="outlined"
                      value={colorVal}
                      onChangeText={(val) => handleInputChange(fullKey, val)}
                      style={{ marginBottom: 12 }}
                    />
                  );
                });
              }
              return null;
            })}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)}>Cancel</Button>
            <Button onPress={handleSave}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

export default ThemeProfileSettings;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  themeCard: {
    width: 110,
    height: 110,
    margin: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  addCard: {
    backgroundColor: '#607d8b',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});
