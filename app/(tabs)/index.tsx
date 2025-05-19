import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
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

export default function App() {
  const router = useRouter();
  const { addPhoto, saveToGallery } = usePhotoContext();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoData | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveToDeviceLoading, setSaveToDeviceLoading] = useState(false);
  const cameraRef = useRef<any>(null);
  const { hideTabBar, showTabBar } = useTabBarVisibilityContext();
  const { width } = Dimensions.get("window");

  // Add this effect to hide/show tab bar when camera is opened/closed
  useEffect(() => {
    if (cameraVisible) {
      hideTabBar();
    } else {
      showTabBar();
    }
  }, [cameraVisible]);

  // Fetch address when location changes
  useEffect(() => {
    async function fetchAddress() {
      if (location) {
        try {
          const res = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (res.length > 0) {
            const item = res[0];
            const addr = [
              item.name,
              item.street,
              item.city,
              item.region,
              item.postalCode,
              item.country,
            ]
              .filter(Boolean)
              .join(", ");
            setAddress(addr);
          } else {
            setAddress("Address not found");
          }
        } catch {
          setAddress("Error fetching address");
        }
      } else {
        setAddress(null);
      }
    }
    fetchAddress();
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
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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

        // Automatically save to app gallery
        await addPhoto(photo.uri, address);

        // Close camera and go to gallery
        setCameraVisible(false);
        setSaving(false);

        // Navigate to gallery page immediately
        router.push("/gallery");
      } catch (e) {
        Alert.alert("Error", "Failed to take photo");
        setSaving(false);
      }
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {/* Home Screen Content */}
        {!cameraVisible && !capturedPhoto && (
          <ScrollView
            style={styles.homeScrollView}
            contentContainerStyle={styles.homeScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header/Logo Section */}
            {/*Replace the current Image component with this*/}
            <View style={styles.headerImageContainer}>
              <Image
                source={require("../../assets/images/hs2.png")}
                style={styles.headerImage}
                resizeMode="contain"
              />
            </View>
            {/* Content Section */}
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.bold}>Re</Text>
                liable <Text style={styles.bold}>Mini</Text>
                malist <Text style={styles.bold}>S</Text>ouvenirs
              </Text>

              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="camera-outline" size={32} color="#007AFF" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Capture Souvenirs</Text>
                  <Text style={styles.featureDescription}>
                    Take high-quality pictures with the in-app camera.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="location-outline" size={32} color="#FF9500" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Location Tagging</Text>
                  <Text style={styles.featureDescription}>
                    Automatically tag memories with time and location — making it easy to reminisce.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="save-outline" size={32} color="#34C759" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Easy Saving</Text>
                  <Text style={styles.featureDescription}>
                    With just one tap, save your photos to the device's gallery
                    to share with friends and family.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="images-outline" size={32} color="#5856D6" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Browse Gallery</Text>
                  <Text style={styles.featureDescription}>
                    View all your captured photos in a dedicated
                    gallery with details of every image.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={openCamera}
              >
                <Text style={styles.getStartedButtonText}>
                  Take Your First Photo
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
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
              {/* CameraView must NOT have children */}
              <CameraView
                style={StyleSheet.absoluteFill}
                facing={facing}
                ref={cameraRef}
              />
              {/* Overlay absolutely in a separate View */}
              <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
                {/* Location at Top */}
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
                {/* Bottom Buttons */}
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
      </View>
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
  // Add to your StyleSheet
  headerImageContainer: {
    width: "100%",
    height: 200, // Adjust this height as needed
    justifyContent: "center",
    marginTop:25,
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
    backgroundColor: "#f9f9f9",
  },
  homeScrollContent: {
    paddingBottom: 100, // Extra padding for FAB
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: "white",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  appSlogan: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    maxWidth: "80%",
  },
  contentSection: {
    padding: 24,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  getStartedButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom:25,
    lineHeight: 30,
  },
  bold: {
    fontWeight: 'bold',
    color: '#000000', // Optional: use your brand color
  },
});
