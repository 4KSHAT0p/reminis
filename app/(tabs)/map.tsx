import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MarkerView from "../../components/maplibre";
import { usePhotoContext } from "../context/PhotoContext";

export default function Map() {
  const { photos } = usePhotoContext();
  
  // Filter photos that have geo coordinates
  const photosWithLocation = photos.filter(
    photo => photo.coordinates && photo.coordinates.latitude && photo.coordinates.longitude
  );

  return (
    <View style={styles.container}>
      {photosWithLocation.length > 0 ? (
        <MarkerView />
      ) : (
        <View style={styles.noPhotosContainer}>
          <Text style={styles.noPhotosText}>
            No photos with location data found.
          </Text>
          <Text style={styles.noPhotosSubtext}>
            Take some photos with location enabled to see them on the map.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noPhotosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPhotosText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  noPhotosSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});