import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Surface, Text } from 'react-native-paper';

interface PlayerCountDropdownProps {
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
}

const PlayerCountDropdown: React.FC<PlayerCountDropdownProps> = ({
  playerCount,
  onPlayerCountChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const playerOptions = [
    { value: 1, label: '1 Player' },
    { value: 2, label: '2 Players' },
    { value: 3, label: '3 Players' },
    { value: 4, label: '4 Players' },
  ];

  const selectedOption = playerOptions.find(
    (option) => option.value === playerCount
  );

  const handleSelect = (count: number) => {
    onPlayerCountChange(count);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text variant='titleMedium' style={styles.title}>
        Additional Players
      </Text>

      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsOpen(!isOpen)}
          activeOpacity={0.7}
        >
          <Icon source='account-multiple' size={20} color='#666' />
          <Text style={styles.selectedText}>
            {selectedOption?.label || 'Select players'}
          </Text>
          <Icon
            source={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color='#666'
          />
        </TouchableOpacity>

        {isOpen && (
          <Surface style={styles.dropdownList} elevation={2}>
            {playerOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownItem,
                  option.value === playerCount && styles.selectedItem,
                  index < playerOptions.length - 1 && styles.dropdownItemBorder,
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <Icon
                  source='account-multiple'
                  size={20}
                  color={option.value === playerCount ? '#1976d2' : '#666'}
                />
                <Text
                  style={[
                    styles.dropdownItemText,
                    option.value === playerCount && styles.selectedItemText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Surface>
        )}
      </View>
    </View>
  );
};

export default PlayerCountDropdown;

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    marginBottom: 12,
    color: '#333',
    fontWeight: '500',
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    gap: 12,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    color: '#1976d2',
    fontWeight: '500',
  },
});
