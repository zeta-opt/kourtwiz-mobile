import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FindplayerCard = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => {}}
      activeOpacity={1}
    >
      <View style={styles.featuredCardContent}>
        {/* Left: Icon */}
        <View style={styles.featuredIconContainer}>
          <Image
            source={require('@/assets/images/FindPlayerCardImage.png')}
            style={styles.featuredImage}
          />
        </View>

        {/* Right: Column (title → subtitle → buttons) */}
        <View style={styles.featuredRightColumn}>
          <Text style={styles.featuredSubtitle}>Connect and play near you</Text>
          <Text style={styles.featuredTitle}>FIND PLAYERS{'\n'}& GAMES</Text>

          <View style={styles.featuredButtonColumn}>
            <TouchableOpacity
              style={styles.filledButton}
              onPress={()=>router.push('/(authenticated)/create-event')}
            >
              <Text
                style={styles.filledButtonText}
                
                >Create Event</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featuredButton, styles.outlinedButton]}
              onPress={() => router.push('/(authenticated)/find-player')}
            >
              <Text style={styles.outlinedButtonText}>Find Player</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featuredButton, styles.outlinedButton]}
              onPress={() => router.replace('/(authenticated)/want-to-play')}
            >
              <Text style={styles.outlinedButtonText}>I want to Play</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FindplayerCard;

const styles = StyleSheet.create({
  featuredCard: {
    backgroundColor: 'white',
    paddingRight: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  featuredCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  featuredIconContainer: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  featuredImage: {
    width: 120,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#eee',
  },

  featuredRightColumn: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 6,
  },

  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },

  featuredSubtitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
    marginTop: 6,
  },

  featuredButtonColumn: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'space-between',
  },

  featuredButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: '#E0E0E0',
  },

  disabledButtonText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 12,
  },

  outlinedButton: {
    backgroundColor: '#fff',
    borderColor: '#3F7CFF',
    borderWidth: 1,
  },
    
  filledButton: {
    backgroundColor: '#3F7CFF',
    paddingVertical:8,
    paddingBlockStart:4,
    alignItems:'center',
    borderRadius:5,
    color:'#FFFFFF',
  },

  outlinedButtonText: {
    color: '#3F7CFF',
    fontWeight: '600',
    fontSize: 12,
  },
  filledButtonText: {
  color: '#FFFFFF',
  fontWeight: '600',
  fontSize: 12,
},

});
