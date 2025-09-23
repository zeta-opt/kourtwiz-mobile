import UserAvatar from '@/assets/UserAvatar';
import { useGetVideos } from '@/hooks/apis/videos/useGetVideos';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import Video, { OnLoadData, OnProgressData } from 'react-native-video';
import { useSelector } from 'react-redux';
import { useCachedVideoUri } from './useCachedVideoUri';

interface VideoItem {
  id: string;
  eventName: string;
  location: string;
  videoUrl: string;
  thumbnail?: string;
  date?: string;
  time?: string;
}

const VideosLayout = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { videos, status, error, refetchVideos } = useGetVideos(
    user?.userId || ''
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [displayedVideos, setDisplayedVideos] = useState<VideoItem[]>([]);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Video player ref
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (videos.length > 0) {
      const transformedVideos: VideoItem[] = videos.map((video) => ({
        id: video.id,
        eventName: video.eventName,
        location: video.location,
        videoUrl: video.presignedUrl,
        thumbnail: 'https://via.placeholder.com/80x80', // or generate later
        date: new Date().toLocaleDateString('en-US'),
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      }));
      setDisplayedVideos(transformedVideos);
    } else {
      setDisplayedVideos([]);
    }
  }, [videos]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = videos
        .map((video) => ({
          id: video.id,
          eventName: video.eventName,
          location: video.location,
          videoUrl: video.presignedUrl,
          thumbnail: 'https://via.placeholder.com/80x80',
          date: new Date().toLocaleDateString('en-US'),
          time: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        }))
        .filter(
          (v) =>
            v.eventName.toLowerCase().includes(query.toLowerCase()) ||
            v.location.toLowerCase().includes(query.toLowerCase())
        );
      setDisplayedVideos(filtered);
    } else {
      setDisplayedVideos(
        videos.map((video) => ({
          id: video.id,
          eventName: video.eventName,
          location: video.location,
          videoUrl: video.presignedUrl,
          thumbnail: 'https://via.placeholder.com/80x80',
          date: new Date().toLocaleDateString('en-US'),
          time: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        }))
      );
    }
  };

  const handlePlayVideo = async (video: VideoItem) => {
    setSelectedVideo(video);
    setIsVideoPlayerVisible(true);
    setVideoPaused(false);
    setVideoError(false);
    setIsLoadingVideo(true);
  };

  const handleCloseVideoPlayer = () => {
    setVideoPaused(true);
    setIsVideoPlayerVisible(false);
    setSelectedVideo(null);
    setVideoError(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchVideos();
    setSearchQuery('');
    setRefreshing(false);
  };

  const renderVideo = ({ item }: { item: VideoItem }) => (
    <View style={styles.videoCard}>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.eventName}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.date}</Text>
          <Text style={styles.metaDot}> • </Text>
          <Text style={styles.metaText}>{item.time}</Text>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.playButton}
        activeOpacity={0.8}
        onPress={() => handlePlayVideo(item)}
      >
        <Ionicons name='play' size={14} color='white' />
        <Text style={styles.playButtonText}>Play</Text>
      </TouchableOpacity>
    </View>
  );

  const { playableUri, isCaching } = useCachedVideoUri(
    selectedVideo?.videoUrl,
    {
      cacheKey: selectedVideo?.id,
      prefetch: true,
      ttl: 7 * 24 * 60 * 60 * 1000,
    }
  );

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.replace('/home');
    } else {
      router.replace('/home');
    }
  };

  const onVideoLoad = (data: OnLoadData) => {
    setIsLoadingVideo(false);
    console.log('Video loaded:', data.duration);
  };

  const onVideoError = (error: any) => {
    console.error('Video error:', error);
    setIsLoadingVideo(false);
    setVideoError(true);
  };

  const onVideoProgress = (data: OnProgressData) => {
    // You can use this to update a custom progress bar if needed
    // console.log('Progress:', data.currentTime, '/', data.playableDuration);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.mainHeader}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name='arrow-back' size={24} color='#cce5e3' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.mainTitle}>Videos</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(authenticated)/profile')}
          >
            <UserAvatar size={30} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder='Search'
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor='#666'
          placeholderTextColor='#999'
          theme={{
            colors: {
              primary: '#333', // this controls the text color and focus color
              text: '#333', // this controls the input text color
              placeholder: '#999',
            },
          }}
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Event Name</Text>
          <Ionicons
            name='chevron-down'
            size={16}
            color='#666'
            style={styles.filterIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Location</Text>
          <Ionicons
            name='chevron-down'
            size={16}
            color='#666'
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Loading State */}
      {status === 'loading' && displayedVideos.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#2C7E88' />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      )}

      {/* Error State */}
      {status === 'error' && (
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle-outline' size={64} color='#ff6b6b' />
          <Text style={styles.errorText}>Failed to load videos</Text>
          <Text style={styles.errorSubtext}>{error || 'Please try again'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetchVideos}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Videos List */}
      {status !== 'error' && (
        <FlatList
          data={displayedVideos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.videosList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2C7E88']}
              tintColor='#2C7E88'
            />
          }
          ListEmptyComponent={
            status !== 'loading' ? (
              <View style={styles.emptyContainer}>
                <Ionicons name='videocam-off-outline' size={64} color='#ccc' />
                <Text style={styles.emptyText}>No videos found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Video Player Modal (react-native-video) */}
      <Modal
        visible={isVideoPlayerVisible}
        animationType='slide'
        onRequestClose={handleCloseVideoPlayer}
        statusBarTranslucent
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.videoPlayerContainer}>
          <View style={styles.videoPlayerHeader}>
            <TouchableOpacity
              onPress={handleCloseVideoPlayer}
              style={styles.closeButton}
            >
              <Ionicons name='close' size={28} color='white' />
            </TouchableOpacity>
            <Text style={styles.videoPlayerTitle}>
              {selectedVideo?.eventName || 'Video Player'}
            </Text>
          </View>

          <View style={styles.videoViewContainer}>
            {/* Show loader overlay while caching or loading */}
            {(isCaching || isLoadingVideo) && !videoError && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size='large' color='#fff' />
                <Text style={styles.loadingOverlayText}>Loading video...</Text>
              </View>
            )}

            {/* Video Error State */}
            {videoError && (
              <View style={styles.videoErrorContainer}>
                <Ionicons
                  name='alert-circle-outline'
                  size={48}
                  color='#ff6b6b'
                />
                <Text style={styles.videoErrorText}>Failed to load video</Text>
                <TouchableOpacity
                  style={styles.videoRetryButton}
                  onPress={() => {
                    setVideoError(false);
                    setIsLoadingVideo(true);
                  }}
                >
                  <Text style={styles.videoRetryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {playableUri && !videoError && (
              <Video
                ref={videoRef}
                source={{ uri: playableUri }}
                style={styles.video}
                controls={true}
                paused={videoPaused}
                resizeMode='contain'
                onLoad={onVideoLoad}
                onError={onVideoError}
                onProgress={onVideoProgress}
                onEnd={() => setVideoPaused(true)}
                repeat={false}
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch='ignore'
                // Additional props for better control experience
                fullscreen={false}
                fullscreenAutorotate={true}
                fullscreenOrientation='all'
                progressUpdateInterval={250}
                // Enable picture in picture on iOS
                pictureInPicture={Platform.OS === 'ios'}
                // Buffering config for smoother playback
                bufferConfig={{
                  minBufferMs: 15000,
                  maxBufferMs: 50000,
                  bufferForPlaybackMs: 2500,
                  bufferForPlaybackAfterRebufferMs: 5000,
                }}
              />
            )}
          </View>

          <View style={styles.videoDetailsContainer}>
            <Text style={styles.videoDetailTitle}>
              {selectedVideo?.eventName}
            </Text>
            <View style={styles.videoMetaInfo}>
              <Text style={styles.videoMetaText}>{selectedVideo?.date}</Text>
              <Text style={styles.metaDot}> • </Text>
              <Text style={styles.videoMetaText}>{selectedVideo?.time}</Text>
            </View>
            <View style={styles.videoLocationInfo}>
              <Ionicons name='location-outline' size={16} color='#666' />
              <Text style={styles.videoLocationText}>
                {selectedVideo?.location}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VideosLayout;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mainHeader: {
    backgroundColor: '#2C7E88',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerTextContainer: { flex: 1 },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: '#fff',
  },
  subtitle: { color: 'rgba(255, 255, 255, 0.75)', fontSize: 12, marginTop: 4 },
  backButton: { marginRight: 8, marginLeft: -8 },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  searchBar: {
    backgroundColor: '#e5e5e5',
    elevation: 0,
    borderRadius: 15,
    height: 45,
  },
  searchInput: { fontSize: 14, paddingLeft: 0 },
  filterContainer: { maxHeight: 50, marginBottom: 8, minHeight: 45 },
  filterContent: { paddingHorizontal: 16, gap: 12 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C7E88',
    marginRight: 8,
    minHeight: 40,
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
    fontWeight: '500',
  },
  filterIcon: { marginLeft: 2 },
  videosList: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoInfo: { flex: 1, marginLeft: 12 },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metaText: { fontSize: 13, color: '#666' },
  metaDot: { fontSize: 13, color: '#999' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 13, color: '#666' },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C7E88',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginLeft: 8,
  },
  playButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: { fontSize: 16, color: '#666', marginTop: 12 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b6b',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2C7E88',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  closeButton: { padding: 8, marginRight: 12 },
  videoPlayerTitle: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  videoViewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingOverlayText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
  },
  videoErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  videoErrorText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  videoRetryButton: {
    backgroundColor: '#2C7E88',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  videoRetryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  videoDetailsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  videoDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  videoMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  videoMetaText: { fontSize: 14, color: '#666' },
  videoLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  videoLocationText: { fontSize: 14, color: '#666', marginLeft: 4 },
});
