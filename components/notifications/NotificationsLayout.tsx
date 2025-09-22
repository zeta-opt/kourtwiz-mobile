import UserAvatar from '@/assets/UserAvatar';
import { useGetNotifications } from '@/hooks/apis/notifications/UseNotifications';
import { RootState } from '@/store';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  createdAt: number;
  read: boolean;
};

type NotificationIcon = {
  [key: string]: {
    name: string;
    library: 'MaterialCommunityIcons' | 'MaterialIcons' | 'Ionicons';
    color: string;
    backgroundColor: string;
  };
};

const notificationIcons: NotificationIcon = {
  'Friend Request Accepted': {
    name: 'account-multiple',
    library: 'MaterialCommunityIcons',
    color: '#00B4A6',
    backgroundColor: '#E8F9F7',
  },
  'KourtWiz Update!': {
    name: 'bullhorn',
    library: 'MaterialCommunityIcons',
    color: '#007AFF',
    backgroundColor: '#E6F2FF',
  },
  'Payment Confirmed': {
    name: 'currency-usd',
    library: 'MaterialCommunityIcons',
    color: '#00C853',
    backgroundColor: '#E8F5E9',
  },
  'Upcoming Game': {
    name: 'calendar',
    library: 'MaterialCommunityIcons',
    color: '#7C4DFF',
    backgroundColor: '#F3E5FF',
  },
};

export default function NotificationsLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId || '';
  const { data: notifications, status, refetch } = useGetNotifications(userId);
  const router = useRouter();

  // Refetch notifications on mount
  useEffect(() => {
    refetch();
  }, [userId]);

  // Group notifications by date
  const groupNotificationsByDate = (notifications: NotificationItem[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: NotificationItem[] } = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.createdAt * 1000);
      notificationDate.setHours(0, 0, 0, 0);

      if (notificationDate.getTime() === today.getTime()) {
        groups.Today.push(notification);
      } else if (notificationDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notification);
      } else {
        groups.Older.push(notification);
      }
    });

    // Convert to sections format for SectionList
    return Object.entries(groups)
      .filter(([_, data]) => data.length > 0)
      .map(([title, data]) => ({ title, data }));
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getIcon = (title: string) => {
    const iconConfig = notificationIcons[title] || {
      name: 'bell',
      library: 'MaterialCommunityIcons',
      color: '#666',
      backgroundColor: '#F0F0F0',
    };

    const IconComponent =
      iconConfig.library === 'MaterialIcons'
        ? MaterialIcons
        : iconConfig.library === 'Ionicons'
        ? Ionicons
        : MaterialCommunityIcons;

    return (
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconConfig.backgroundColor },
        ]}
      >
        <IconComponent
          name={iconConfig.name as any}
          size={24}
          color={iconConfig.color}
        />
      </View>
    );
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity style={styles.notificationContainer} activeOpacity={0.7}>
      {getIcon(item.title)}
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text
            style={[styles.notificationTitle, !item.read && styles.unreadTitle]}
          >
            {item.title}
          </Text>
          {item.body && (
            <Text style={styles.notificationBody} numberOfLines={2}>
              {item.body}
            </Text>
          )}
        </View>
        <Text style={styles.notificationTime}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => <Text style={styles.sectionHeader}>{title}</Text>;

  if (status === 'loading') {
    return (
      <LinearGradient
        colors={['#E0F7FA', '#FFFFFF']}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name='chevron-back' size={24} color='#333' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notification</Text>
            <UserAvatar size={30} />
          </View>
          <View style={styles.center}>
            <ActivityIndicator size='large' color='#007AFF' />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <LinearGradient
        colors={['#E0F7FA', '#FFFFFF']}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name='chevron-back' size={24} color='#333' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notification</Text>
            <UserAvatar size={30} />
          </View>
          <View style={styles.center}>
            <MaterialCommunityIcons
              name='bell-off-outline'
              size={64}
              color='#666'
            />
            <Text style={styles.empty}>No notifications</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const sections = groupNotificationsByDate(notifications);

  return (
    <LinearGradient
      colors={['#E0F7FA', '#FFFFFF']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name='chevron-back' size={24} color='#333' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
          <UserAvatar size={30} />
        </View>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  notificationContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
