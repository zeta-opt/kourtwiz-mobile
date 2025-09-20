import { getToken } from '@/shared/helpers/storeToken';
import Constants from 'expo-constants';
import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface EventNameSearchProps {
  value: string;
  onChange: (text: string) => void;
  onSelect: (event: any) => void;
  error?: boolean;
  requesterId?: string;
}

function debounce<F extends (...args: any[]) => void>(func: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const EventNameSearch: React.FC<EventNameSearchProps> = ({
  value,
  onChange,
  onSelect,
  error,
  requesterId,
}) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchEventSuggestions = async (query: string, requesterId: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const BASE_URL = Constants.expoConfig?.extra?.apiUrl || '';
    const token = await getToken();

    if (!token) {
      console.warn('⚠️ No token found, skipping search');
      setIsSearching(false);
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/player-tracker/tracker/search?eventName=${encodeURIComponent(
          query
        )}&requesterId=${requesterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) {
        console.error(`❌ API error: ${res.status} ${res.statusText}`);
        setSearchResults([]);
        return;
      }

      const data = await res.json();
      setSearchResults(data || []);
      console.log('✅ Fetched events:', data);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useRef(
    debounce(
      (text: string, requesterId: string) =>
        fetchEventSuggestions(text, requesterId),
      500
    )
  ).current;

  return (
    <View style={{ zIndex: 1000 }}>
      <TextInput
        style={[styles.input, error && { borderColor: 'red', borderWidth: 1 }]}
        placeholder='Enter Event Name'
        value={value}
        onChangeText={(text) => {
          onChange(text);
          debouncedSearch(text, requesterId || '');
        }}
      />

      {isSearching && (
        <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          Searching...
        </Text>
      )}

      {searchResults.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 150 }}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  onSelect(item);
                  setSearchResults([]);
                }}
                style={styles.dropdownItem}
              >
                <Text>{item.eventName}</Text>
                {item.allCourts?.Name && (
                  <Text style={styles.subText}>{item.allCourts.Name}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 4,
    position: 'absolute',
    top: 35,
    width: '100%',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
});

export default EventNameSearch;
