import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  FlatList,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import ViewShot from "react-native-view-shot";
import { usePhotoContext, PhotoData } from "../context/PhotoContext";
import { useTabBarVisibilityContext } from "../context/TabBarVisibilityContext";
import * as Sharing from 'expo-sharing';
const width = Dimensions.get("window").width;

const Gallery = () => {
  // Component state and functions remain unchanged...
  const { photos, saveToGallery, deletePhoto } = usePhotoContext();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [actionMode, setActionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { hideTabBar, showTabBar } = useTabBarVisibilityContext();
  const { photoId } = useLocalSearchParams<{ photoId?: string }>();
  const navigation = useNavigation();

  // For swipe detection
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Reference for screenshot capture
  const viewShotRef = useRef<ViewShot>(null);

  // Reset selection when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setActionMode(false);
      setSelectedIds([]);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (selectedPhoto) {
      hideTabBar();
    } else {
      showTabBar();
    }
  }, [selectedPhoto]);

  useEffect(() => {
    if (photoId) {
      handleSelectPhoto(photoId);
    }
  }, [photoId]);

  // NAVIGATION
  const goToPhoto = (idx: number) => {
    if (idx >= 0 && idx < photos.length) {
      setSelectedIndex(idx);
      setSelectedPhoto(photos[idx].id);
    }
  };

  const nextPhoto = () => goToPhoto(selectedIndex + 1);
  const prevPhoto = () => goToPhoto(selectedIndex - 1);

  // SIMPLE SWIPE HANDLERS
  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    touchEndX.current = e.nativeEvent.pageX;
    handleSwipe();
  };

  const handleSwipe = () => {
    // Minimum distance for swipe
    const minSwipeDistance = 50;
    const swipeDistance = touchEndX.current - touchStartX.current;

    if (swipeDistance > minSwipeDistance) {
      // Swiped right → go to previous photo
      prevPhoto();
    } else if (swipeDistance < -minSwipeDistance) {
      // Swiped left → go to next photo
      nextPhoto();
    }
  };

  // Updated share function to capture screenshot
  const handleSharePhoto = async () => {
    try {
      if (!viewShotRef.current || !viewShotRef.current.capture) {
        Alert.alert("Error", "Unable to capture screenshot");
        return;
      }

      // Capture the screenshot
      const uri = await viewShotRef.current.capture();

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      // Share the screenshot
      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share your memory'
      });

    } catch (error) {
      console.error('Error sharing screenshot:', error);
      Alert.alert("Error", "Unable to share screenshot");
    }
  };

  const handleSaveToDevice = async (photoId: string) => {
    setLoading(true);
    try {
      const success = await saveToGallery(photoId);
      if (success) {
        Alert.alert("✅ Success", "Photo saved to device gallery");
      } else {
        Alert.alert("❌ Error", "Failed to save photo to device gallery");
      }
    } catch (e) {
      Alert.alert("❌ Error", "Failed to save photo");
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component logic...
  const handleThumbnailPress = (id: string) => {
    if (actionMode) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(x => x !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      handleSelectPhoto(id);
    }
  };

  const handleThumbnailLongPress = (id: string) => {
    if (!actionMode) {
      setActionMode(true);
      setSelectedIds([id]);
    }
  };

  const exitActionMode = () => {
    setActionMode(false);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    Alert.alert(
      "🗑️ Delete Photos",
      `Are you sure you want to delete ${selectedIds.length} photo${selectedIds.length > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            for (let id of selectedIds) {
              await deletePhoto(id);
            }
            exitActionMode();
          },
        },
      ]
    );
  };

  const handleSelectPhoto = (photoId: string) => {
    const index = photos.findIndex((p) => p.id === photoId);
    if (index !== -1) {
      setSelectedIndex(index);
      setSelectedPhoto(photoId);
    }
  };

  // Calculate dynamic columns and item width
  const getColumnsAndWidth = () => {
    const totalPhotos = photos.length;
    let numColumns = 3;

    if (totalPhotos === 1) {
      numColumns = 1;
    } else if (totalPhotos === 2) {
      numColumns = 2;
    }

    const itemWidth = (width - 48) / numColumns;
    const marginRight = 8;

    return { numColumns, itemWidth, marginRight };
  };

  const { numColumns, itemWidth } = getColumnsAndWidth();

  const renderPhotoItem = ({ item, index }: { item: PhotoData; index: number }) => {
    const isSelected = selectedIds.includes(item.id);
    const isLastInRow = (index + 1) % numColumns === 0;

    return (
      <Pressable
        onPress={() => handleThumbnailPress(item.id)}
        onLongPress={() => handleThumbnailLongPress(item.id)}
        style={[
          styles.photoCard,
          {
            width: itemWidth,
            height: itemWidth * 0.8,
            marginRight: isLastInRow ? 0 : 8,
            marginBottom: 12,
            borderWidth: isSelected ? 3 : 0,
            borderColor: isSelected ? "#667eea" : "transparent",
            opacity: actionMode && !isSelected ? 0.5 : 1,
          }
        ]}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.cardOverlay} />
        {item.address && (
          <View style={styles.addressTag}>
            <Ionicons name="location" size={12} color="white" />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        )}
        {actionMode && isSelected && (
          <View style={styles.selectedTick}>
            <Ionicons name="checkmark-circle" size={24} color="#667eea" />
          </View>
        )}
      </Pressable>
    );
  };

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="camera" size={60} color="white" />
          </View>
          <Text style={styles.emptyText}>No Memories Yet</Text>
          <Text style={styles.emptySubText}>
            Start capturing your moments to see them here
          </Text>
        </View>
      </View>
    );
  }

  // Get the current photo being displayed
  const currentPhoto = photos.find(p => p.id === selectedPhoto);

  // Format date in more compact way
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        {actionMode ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacity onPress={exitActionMode} style={{ padding: 6, marginRight: 10 }}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>{selectedIds.length} selected</Text>
            <TouchableOpacity
              onPress={handleBulkDelete}
              style={{ padding: 6, marginLeft: 10 }}
              disabled={selectedIds.length === 0}
            >
              <Ionicons name="trash" size={28} color={selectedIds.length > 0 ? "white" : "#cfd2ff"} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Your Memories</Text>
            <Text style={styles.subtitle}>
              {photos.length} photos • Hold to select
            </Text>
          </>
        )}
      </View>

      <View style={styles.scrollContent}>
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          key={numColumns} // Force re-render when columns change
          scrollEnabled
          showsVerticalScrollIndicator={false}
          extraData={{ actionMode, selectedIds, numColumns }}
        />
      </View>

      {selectedPhoto && currentPhoto && (
        <Modal
          visible={!!selectedPhoto}
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
          statusBarTranslucent={true}
        >
          <ViewShot
            ref={viewShotRef}
            options={{
              fileName: "memory_screenshot",
              format: "jpg",
              quality: 0.9,
              result: 'tmpfile'
            }}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPhoto(null)}
              >
                <Ionicons name="close-circle" size={32} color="white" />
              </TouchableOpacity>
              <View style={styles.counterContainer}>
                <Text style={styles.photoCounter}>
                  {selectedIndex + 1} of {photos.length}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleSharePhoto}
              >
                <Ionicons name="share" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* DIRECT SWIPE ON IMAGE */}
            <View
              style={styles.imageContainer}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                source={{ uri: currentPhoto.uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>

            {/* SIMPLIFIED FIXED LAYOUT for info panel and button */}
            <View style={styles.infoPanel}>
              {/* Fixed info content - no scrolling */}
              <View style={styles.infoPanelContent}>
                <Text style={styles.modalDate}>
                  {formatDate(currentPhoto.timestamp)}
                </Text>

                {currentPhoto.address && (
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={18} color="#667eea" />
                    <Text style={styles.infoText} numberOfLines={1}>{currentPhoto.address}</Text>
                  </View>
                )}

                {currentPhoto.weather && (
                  <View style={styles.infoRow}>
                    <Ionicons name="partly-sunny" size={18} color="#667eea" />
                    <Text style={styles.infoText} numberOfLines={1}>{currentPhoto.weather}</Text>
                  </View>
                )}
              </View>

              {/* Save button */}
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSaveToDevice(currentPhoto.id)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="download" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Save to Device</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ViewShot>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa"
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  scrollContent: {
    padding: 16,
    flex: 1,
  },
  photoCard: {
    borderRadius: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  addressTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    color: "white",
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
    flex: 1,
  },
  selectedTick: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#667eea',
  },
  emptyContent: {
    alignItems: "center",
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  counterContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoCounter: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: "60%",
    width: "100%",
    position: "relative",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  infoPanel: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    justifyContent: 'space-between', // This positions content at top and button at bottom
    padding: 0,
  },
  infoPanelContent: {
    padding: 16,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: "white",
    marginLeft: 10,
    flex: 1,
  },
  actionButtonContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: "center",
    backgroundColor: "#667eea",
    width: "80%",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  spacer: {
    flex: 1,
  },
});

export default Gallery;