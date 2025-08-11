import { Text, View, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React from 'react';

const repeatOptions = [
  { label: 'None', value: 'NONE' },
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Custom', value: 'custom' },
];

function RepeatPicker({ repeat, handleRepeatChange }) {
  const [iosModalVisible, setIosModalVisible] = React.useState(false);

  if (Platform.OS === 'ios') {
    return (
      <>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 6,
            padding: 10,
          }}
          onPress={() => setIosModalVisible(true)}
        >
          <Text>
            {repeatOptions.find(opt => opt.value === repeat)?.label || 'Select'}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={iosModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIosModalVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              padding: 20,
            }}
            activeOpacity={1}
            onPressOut={() => setIosModalVisible(false)}
          >
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                padding: 10,
              }}
            >
              <FlatList
                data={repeatOptions}
                keyExtractor={item => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ padding: 12 }}
                    onPress={() => {
                      handleRepeatChange(item.value);
                      setIosModalVisible(false);
                    }}
                  >
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  // Android uses default Picker
  return (
    <Picker
      selectedValue={repeat}
      onValueChange={handleRepeatChange}
      itemStyle={{ color: '#000' }}
    >
      {repeatOptions.map(opt => (
        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
      ))}
    </Picker>
  );
}

export default RepeatPicker;