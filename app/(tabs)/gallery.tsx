import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { usePhotoContext } from "../context/PhotoContext";
import { useTabBarVisibilityContext } from "../context/TabBarVisibilityContext";

const { width } = Dimensions.get("window");

const Gallery = () => {
  const router = useRouter();
  const { photos, saveToGallery, deletePhoto } = usePhotoContext();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { hideTabBar, showTabBar } = useTabBarVisibilityContext();

  // Add this effect to hide/show tab bar when viewing a photo
  useEffect(() => {
    if (selectedPhoto) {
      hideTabBar();
    } else {
      showTabBar();
    }
  }, [selectedPhoto]);

  // Values for swipe animation
  const translateX = useSharedValue(0);

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Save to device gallery
  const handleSaveToDevice = async (photoId: string) => {
    setLoading(true);
    try {
      const success = await saveToGallery(photoId);
      if (success) {
        Alert.alert("Success", "Photo saved to device gallery");
      } else {
        Alert.alert("Error", "Failed to save photo to device gallery");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to save photo");
    } finally {
      setLoading(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = (photoId: string) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSelectedPhoto(null);
          await deletePhoto(photoId);
        },
      },
    ]);
  };

  // Handle selecting a photo
  const handleSelectPhoto = (photoId: string) => {
    const index = photos.findIndex((p) => p.id === photoId);
    if (index !== -1) {
      setSelectedIndex(index);
      setSelectedPhoto(photoId);
      translateX.value = 0; // Reset translation when selecting a new photo
    }
  };

  // Navigate to the next photo
  const nextPhoto = () => {
    if (selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setSelectedPhoto(photos[selectedIndex + 1].id);
    }
  };

  // Navigate to the previous photo
  const prevPhoto = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setSelectedPhoto(photos[selectedIndex - 1].id);
    }
  };

  // Updated gesture handler using modern Gesture API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store initial value on start
    })
    .onUpdate((event) => {
      // Update translation as user swipes
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      {
        // Simple threshold-based navigation
        if (event.translationX > 50) {
          // Swipe right - previous photo
          if (selectedIndex > 0) {
            runOnJS(prevPhoto)();
          }
        } else if (event.translationX < -50) {
          // Swipe left - next photo
          if (selectedIndex < photos.length - 1) {
            runOnJS(nextPhoto)();
          }
        }
      }
    });

  // Animated style for swipe
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Render empty state
  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No photos yet</Text>
        <Text style={styles.emptySubText}>
          Take some photos to see them here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Your Photos</Text>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.photoCard}
            onPress={() => handleSelectPhoto(item.id)}
          >
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            {item.address && (
              <View style={styles.addressTag}>
                <Ionicons name="location" size={12} color="white" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Photo Detail Modal with Swipe */}
      {selectedPhoto && (
        <Modal
          visible={!!selectedPhoto}
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
          statusBarTranslucent={true}
        >
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black" }}>
            <View style={styles.navigationHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPhoto(null)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.photoCounter}>
                {selectedIndex + 1} / {photos.length}
              </Text>
            </View>

            <GestureDetector gesture={panGesture}>
              <View style={{ flex: 1 }}>
                {photos
                  .filter((p) => p.id === selectedPhoto)
                  .map((photo) => (
                    <View key={photo.id} style={styles.photoDetail}>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.fullImage}
                        resizeMode="contain"
                      />

                      <View style={styles.infoContainer}>
                        <Text style={styles.dateText}>
                          {formatDate(photo.timestamp)}
                        </Text>

                        {photo.address && (
                          <Text style={styles.detailAddressText}>
                            <Ionicons
                              name="location-outline"
                              size={16}
                              color="#999"
                            />{" "}
                            {photo.address}
                          </Text>
                        )}

                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.saveButton]}
                            onPress={() => handleSaveToDevice(photo.id)}
                            disabled={loading}
                          >
                            {loading ? (
                              <ActivityIndicator color="white" size="small" />
                            ) : (
                              <>
                                <Ionicons
                                  name="download-outline"
                                  size={20}
                                  color="white"
                                />
                                <Text style={styles.actionButtonText}>
                                  Save to Device
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeletePhoto(photo.id)}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color="white"
                            />
                            <Text style={styles.actionButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            </GestureDetector>

            {/* Navigation buttons */}
            <View style={styles.navHints}>
              {selectedIndex > 0 && (
                <TouchableOpacity style={styles.navButton} onPress={prevPhoto}>
                  <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
              )}

              <View style={styles.navSpacer} />

              {selectedIndex < photos.length - 1 && (
                <TouchableOpacity style={styles.navButton} onPress={nextPhoto}>
                  <Ionicons name="chevron-forward" size={28} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </GestureHandlerRootView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  gridContent: {
    padding: 8,
  },
  photoCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    aspectRatio: 1,
  },
  addressTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    color: "white",
    fontSize: 10,
    marginLeft: 4,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    color: "#666",
  },
  emptySubText: {
    fontSize: 16,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  navigationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  photoCounter: {
    color: "white",
    fontSize: 16,
  },
  swipeContainer: {
    flex: 1,
    width: width,
  },
  photoDetail: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "60%",
    marginTop: 80,
  },
  infoContainer: {
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 8,
  },
  detailAddressText: {
    fontSize: 16,
    color: "#bbb",
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    justifyContent: "center",
    width: "45%",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
  },
  navHints: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    pointerEvents: "box-none",
  },
  navButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navSpacer: {
    flex: 1,
  },
});

export default Gallery;
