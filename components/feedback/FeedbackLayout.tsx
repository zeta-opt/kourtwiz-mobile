import UserAvatar from '@/assets/UserAvatar';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { useFeedback } from '@/hooks/apis/feedback/useFeedback';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, RadioButton, Text, TextInput } from 'react-native-paper';

interface FeedbackPayload {
  userId: string;
  userName: string;
  clubId?: string;
  title: string;
  message: string;
  category: 'BUG' | 'FEATURE' | 'SUGGESTION';
  visibility: 'PUBLIC' | 'PRIVATE';
}

const FeedbackLayout = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const clubId = user?.userClubRole?.[0]?.clubId ?? '';
  const userId = user?.userId ?? '';
  const userName = user?.username ?? '';
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'BUG' | 'FEATURE' | 'SUGGESTION'>(
    'BUG'
  );
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  // Use the feedback hook
  const { submitFeedback, status, error } = useFeedback();

  const handleSubmit = async () => {
    const feedbackData: FeedbackPayload = {
      userId: userId,
      userName: userName,
      clubId: clubId || undefined,
      title: feedbackTitle || 'User Feedback',
      message: description,
      category: category,
      visibility: visibility,
    };

    try {
      await submitFeedback(feedbackData);
      // Show success message
      Alert.alert('Success', 'Your feedback has been submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(authenticated)/home');
            }
          },
        },
      ]);
    } catch (err) {
      // Show error message
      Alert.alert(
        'Error',
        error || 'Failed to submit feedback. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            router.replace('/(authenticated)/home');
          }}
          style={styles.backButton}
        >
          <MaterialIcons name='arrow-back-ios' size={24} color='#333' />
        </TouchableOpacity>
        <Text variant='headlineMedium' style={styles.headerTitle}>
          Feedback
        </Text>
        <UserAvatar size={40} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.welcomeCard}>
          <MaterialIcons name='feedback' size={40} color='#4B9CA6' />
          <Text variant='titleLarge' style={styles.sectionTitle}>
            We value your feedback!
          </Text>
          <Text style={styles.welcomeText}>
            Help us improve your experience
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text variant='labelLarge' style={styles.inputLabel}>
            Title *
          </Text>
          <TextInput
            mode='outlined'
            placeholder='Brief summary of your feedback'
            value={feedbackTitle}
            onChangeText={setFeedbackTitle}
            style={styles.titleInput}
            outlineColor='#E0E0E0'
            activeOutlineColor='#4B9CA6'
            outlineStyle={styles.inputOutline}
            textColor='#000'
            placeholderTextColor={'#9F9F9F'}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputSection}>
          <Text variant='labelLarge' style={styles.inputLabel}>
            Category *
          </Text>
          <View style={styles.categoryContainer}>
            {[
              { value: 'BUG', label: 'Bug', icon: 'bug-report' },
              { value: 'FEATURE', label: 'Feature', icon: 'lightbulb' },
              {
                value: 'SUGGESTION',
                label: 'Suggestion',
                icon: 'comment',
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.categoryCard,
                  category === item.value && styles.selectedCategoryCard,
                ]}
                onPress={() =>
                  setCategory(item.value as 'BUG' | 'FEATURE' | 'SUGGESTION')
                }
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={24}
                  color={category === item.value ? '#4B9CA6' : '#666'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === item.value && styles.selectedCategoryText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputSection}>
          <Text variant='labelLarge' style={styles.inputLabel}>
            Description *
          </Text>
          <TextInput
            mode='outlined'
            multiline
            numberOfLines={4}
            placeholder='Describe your experience in detail...'
            value={description}
            onChangeText={setDescription}
            style={styles.textInput}
            outlineColor='#E0E0E0'
            activeOutlineColor='#4B9CA6'
            outlineStyle={styles.inputOutline}
            contentStyle={styles.textInputContent}
            textColor='#000'
            placeholderTextColor={'#9F9F9F'}
          />
        </View>

        {/* Visibility Selection */}
        <View style={styles.inputSection}>
          <Text variant='labelLarge' style={styles.inputLabel}>
            Visibility *
          </Text>
          <View style={styles.visibilityContainer}>
            {[
              {
                value: 'PUBLIC',
                label: 'Public',
                icon: 'visibility',
                description: 'Visible to all users',
              },
              {
                value: 'PRIVATE',
                label: 'Private',
                icon: 'visibility-off',
                description: 'Only visible to admins',
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.visibilityCard,
                  visibility === item.value && styles.selectedVisibilityCard,
                ]}
                onPress={() =>
                  setVisibility(item.value as 'PUBLIC' | 'PRIVATE')
                }
                activeOpacity={0.7}
              >
                <View style={styles.visibilityCardContent}>
                  <MaterialIcons
                    name={item.icon as any}
                    size={20}
                    color={visibility === item.value ? '#4B9CA6' : '#666'}
                  />
                  <View style={styles.visibilityTextContainer}>
                    <Text
                      style={[
                        styles.visibilityText,
                        visibility === item.value &&
                          styles.selectedVisibilityText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.visibilityDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>
                <RadioButton value={item.value} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Button
          mode='contained'
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            (!feedbackTitle.trim() ||
              !description.trim() ||
              status === 'loading') &&
              styles.submitButtonDisabled, // apply disabled style
          ]}
          contentStyle={styles.submitButtonContent}
          disabled={
            !feedbackTitle.trim() || !description.trim() || status === 'loading'
          }
          buttonColor='#4B9CA6'
          textColor='#fff'
          loading={status === 'loading'}
          icon={status !== 'loading' ? 'send' : undefined}
        >
          {status === 'loading' ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FA',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    marginBottom: 8,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  titleInput: {
    backgroundColor: 'white',
  },
  inputOutline: {
    borderRadius: 12,
  },
  textInput: {
    backgroundColor: 'white',
  },
  textInputContent: {
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedCategoryCard: {
    borderColor: '#4B9CA6',
    backgroundColor: '#E8F4F5',
  },
  categoryText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#4B9CA6',
  },
  visibilityContainer: {
    gap: 12,
  },
  visibilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedVisibilityCard: {
    borderColor: '#4B9CA6',
    backgroundColor: '#E8F4F5',
  },
  visibilityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  visibilityTextContainer: {
    marginLeft: 12,
  },
  visibilityText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  selectedVisibilityText: {
    color: '#4B9CA6',
  },
  visibilityDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  submitButton: {
    borderRadius: 28,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#4B9CA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#9F9F9F',
    shadowOpacity: 0,
  },
});

export default FeedbackLayout;
