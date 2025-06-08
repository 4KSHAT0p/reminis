import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PhotoData, usePhotoContext } from "../context/PhotoContext";
import { useTabBarVisibilityContext } from "../context/TabBarVisibilityContext";
import axios from "axios";

// Add the GIF array at the top of the component
const GIFS = [
  require('../../assets/savers/gif11.gif'),
  require('../../assets/savers/gif2.gif'),
  require('../../assets/savers/gif3.gif'),
  require('../../assets/savers/gif4.gif'),
  require('../../assets/savers/gif5.gif'),
];

export default function Index() {
  const router = useRouter();
  const { addPhoto, saveToGallery, photos } = usePhotoContext();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoData | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveToDeviceLoading, setSaveToDeviceLoading] = useState(false);
  const [currentGif, setCurrentGif] = useState(GIFS[0]);
  const cameraRef = useRef<any>(null);
  const { hideTabBar, showTabBar } = useTabBarVisibilityContext();

  const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";

  // Function to get random GIF
  const getRandomGif = () => {
    const randomIndex = Math.floor(Math.random() * GIFS.length);
    return GIFS[randomIndex];
  };

  // Update GIF only when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setCurrentGif(getRandomGif());
    }, [])
  );

  // Add this effect to hide/show tab bar when camera is opened/closed
  useEffect(() => {
    if (cameraVisible) {
      hideTabBar();
    } else {
      showTabBar();
    }
  }, [cameraVisible]);

  // Fetch address, weather, and coordinates when location changes
  useEffect(() => {
    async function fetchData() {
      if (location) {
        setLocLoading(true);

        const { latitude, longitude } = location.coords;

        // Set coordinates early
        setCoordinates({ latitude, longitude });

        const [addressResult, weatherResult] = await Promise.allSettled([
          // Address request
          (async () => {
            try {
              const res = await Location.reverseGeocodeAsync({ latitude, longitude });
              if (res.length > 0) {
                const item = res[0];
                return [item.name, item.street, item.city, item.region, item.postalCode, item.country]
                  .filter(Boolean)
                  .join(", ");
              }
              return "Address not found";
            } catch {
              return null;
            }
          })(),

          // Weather request
          (async () => {
            try {
              const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
                params: {
                  lat: latitude,
                  lon: longitude,
                  appid: API_KEY,
                  units: 'metric'
                }
              });
              const description = response.data.weather[0].description;
              const capitalized = description.charAt(0).toUpperCase() + description.slice(1);
              return `${capitalized} • ${Math.round(response.data.main.temp)}°C`;
            } catch {
              return "Weather unavailable";
            }
          })()
        ]);

        setAddress(addressResult.status === "fulfilled" ? addressResult.value : null);
        setWeather(weatherResult.status === "fulfilled" ? weatherResult.value : "Weather unavailable");
        setLocLoading(false);
      } else {
        setAddress(null);
        setWeather(null);
        setCoordinates(null);
      }
    }

    fetchData();
  }, [location]);

  // Handle opening camera and requesting location
  const openCamera = async () => {
    setCameraVisible(true);
    setLocLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation(null);
        setAddress("Location permission denied");
      } else {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    } catch {
      setLocation(null);
      setAddress("Error getting location");
      setWeather("Error fetching weather");
    }
    setLocLoading(false);
  };

  // Save photo to device gallery
  const handleSaveToDevice = async () => {
    if (capturedPhoto) {
      setSaveToDeviceLoading(true);
      try {
        const success = await saveToGallery(capturedPhoto.id);
        if (success) {
          Alert.alert("Success", "Photo saved to device gallery");
        } else {
          Alert.alert("Error", "Failed to save photo to device gallery");
        }
      } catch (e) {
        Alert.alert("Error", "Failed to save photo");
      } finally {
        setSaveToDeviceLoading(false);
      }
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // Take a picture handler
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setSaving(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          skipProcessing: true,
        });

        await addPhoto(photo.uri, coordinates, address, weather);
        setCameraVisible(false);
        setSaving(false);
        router.push("/gallery");
      } catch (e) {
        Alert.alert("Error", "Failed to take photo");
        setSaving(false);
      }
    }
  };

  return (
    <>
      {/* Main Home Screen Content */}
      {!cameraVisible && !capturedPhoto && (
        <ScrollView style={styles.homeScrollView} contentContainerStyle={styles.homeScrollContent}>
          {/* Header with Random GIF */}
          <View style={styles.headerContainer}>
            <Image
              source={currentGif}
              style={styles.gifContainer}
              resizeMode="cover"
            />

            <View style={styles.titleContainer}>
              <Text style={styles.appTitle}>ReMiniS</Text>
              <Text style={styles.appFullForm}>Reliable Minimalist Souvenirs</Text>
              {photos && (
                <Text style={styles.photoCount}>{photos.length} captured</Text>
              )}
            </View>
          </View>

          {/* Simple Content Section */}
          <View style={styles.contentSection}>
            <Text style={styles.welcomeText}>
              Every photo you capture is automatically enriched with GPS location, weather data, and precise timestamps to create lasting digital souvenirs.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Floating Action Button */}
      {!cameraVisible && !capturedPhoto && (
        <TouchableOpacity
          style={styles.fab}
          onPress={openCamera}
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={32} color="white" />
        </TouchableOpacity>
      )}

      {/* Photo Detail View */}
      {capturedPhoto && (
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCapturedPhoto(null)}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.photoDetail}>
            <Image
              source={{ uri: capturedPhoto.uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />

            <View style={styles.infoContainer}>
              <Text style={styles.dateText}>
                {formatDate(capturedPhoto.timestamp)}
              </Text>

              {capturedPhoto.address && (
                <Text style={styles.detailAddressText}>
                  <Ionicons name="location-outline" size={16} color="#666" />{" "}
                  {capturedPhoto.address}
                </Text>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveToDevice}
                  disabled={saveToDeviceLoading}
                >
                  {saveToDeviceLoading ? (
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
                  style={[styles.actionButton, styles.viewButton]}
                  onPress={() => router.push("/gallery")}
                >
                  <Ionicons name="images-outline" size={20} color="white" />
                  <Text style={styles.actionButtonText}>View Gallery</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.newPhotoButton}
                onPress={() => {
                  setCapturedPhoto(null);
                  openCamera();
                }}
              >
                <Text style={styles.newPhotoText}>Take Another Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Camera Modal */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
        transparent={false}
        statusBarTranslucent={true}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing={facing}
              ref={cameraRef}
            />
            <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
              <View style={styles.locationOverlay}>
                {locLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : address ? (
                  <Text style={styles.locationLabel}>{address}</Text>
                ) : (
                  <Text style={styles.locationLabel}>
                    Address unavailable
                  </Text>
                )}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={toggleCameraFacing}
                >
                  <Ionicons name="camera-reverse" size={28} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={takePicture}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="white" size="large" />
                  ) : (
                    <Ionicons name="camera-outline" size={48} color="white" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setCameraVisible(false)}
                >
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Existing styles
  fab: {
    position: "absolute",
    bottom: 32,
    right: 32,
    backgroundColor: "#007AFF",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    backgroundColor: "black",
  },
  buttonContainer: {
    position: "absolute",
    flexDirection: "row",
    left: 0,
    right: 0,
    bottom: 32,
    justifyContent: "space-evenly",
    alignItems: "flex-end",
    zIndex: 2,
  },
  button: {
    alignItems: "center",
    marginHorizontal: 12,
    minWidth: 60,
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerImageContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    marginTop: 25,
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  locationOverlay: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginHorizontal: 32,
    alignSelf: "center",
    zIndex: 2,
  },
  locationLabel: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  photoDetail: {
    flex: 1,
  },
  fullImage: {
    width: "100%",
    height: "60%",
    backgroundColor: "black",
  },
  infoContainer: {
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  detailAddressText: {
    fontSize: 16,
    color: "#444",
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
  viewButton: {
    backgroundColor: "#34C759",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
  },
  newPhotoButton: {
    marginTop: 24,
    alignItems: "center",
  },
  newPhotoText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // New Home Screen Styles
  homeScrollView: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  homeScrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    backgroundColor: "white",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    paddingBottom: 30,
    overflow: 'hidden',
  },
  // GIF container style
  gifContainer: {
    width: Dimensions.get('window').width,
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  appFullForm: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  appSlogan: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  photoCount: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
  contentSection: {
    padding: 24,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  getStartedButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
});
