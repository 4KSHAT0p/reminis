import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Camera,
  MapView,
  PointAnnotation,
} from '@maplibre/maplibre-react-native';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { usePhotoContext, PhotoData } from '../app/context/PhotoContext';
import { Ionicons } from '@expo/vector-icons';

function groupPhotosByLocation(photos: PhotoData[]) {
  const groups: { [key: string]: PhotoData[] } = {};
  for (const photo of photos) {
    if (photo.coordinates) {
      const key = `${photo.coordinates.latitude.toFixed(5)},${photo.coordinates.longitude.toFixed(5)}`;
      groups[key] = groups[key] || [];
      groups[key].push(photo);
    }
  }
  return groups;
}

function getOffsetPosition(base: [number, number], index: number, total: number) {
  if (total === 1) return base;
  const angle = (2 * Math.PI * index) / total;
  const offset = 0.00015;
  return [
    base[0] + Math.cos(angle) * offset,
    base[1] + Math.sin(angle) * offset,
  ];
}

export default function MarkerViewExample() {
  const { photos } = usePhotoContext();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const annotationRefs = useRef<Record<string, any>>({});
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const photosWithLocation = useMemo(
    () =>
      photos.filter(
        (photo) =>
          photo.coordinates &&
          photo.coordinates.latitude &&
          photo.coordinates.longitude
      ),
    [photos]
  );

  const grouped = useMemo(() => groupPhotosByLocation(photosWithLocation), [photosWithLocation]);

  const defaultCenter: [number, number] = useMemo(() => {
    const first = photosWithLocation[0];
    return first
      ? [first.coordinates!.longitude, first.coordinates!.latitude]
      : [-73.99155, 40.73581];
  }, [photosWithLocation]);

  useEffect(() => {
    setLoadedImages(new Set());
  }, [photos]);

  const refreshAnnotations = () => {
    Object.values(annotationRefs.current).forEach((ref) => {
      if (ref?.refresh) ref.refresh();
    });
  };

  useEffect(() => {
    const timer = setTimeout(refreshAnnotations, 500);
    return () => clearTimeout(timer);
  }, [photosWithLocation.length]);

  useEffect(() => {
    if (loadedImages.size > 0) {
      const timer = setTimeout(refreshAnnotations, 100);
      return () => clearTimeout(timer);
    }
  }, [loadedImages]);

  const handleImageLoad = (photoId: string) => {
    setLoadedImages((prev) => new Set(prev).add(photoId));
    const ref = annotationRefs.current[photoId];
    if (ref?.refresh) {
      setTimeout(() => ref.refresh(), 50);
    }
  };

  return (
    <View style={styles.matchParent}>
      <MapView
        style={styles.matchParent}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      >
        <Camera
          zoomLevel={photosWithLocation.length > 0 ? 14 : 10}
          centerCoordinate={defaultCenter}
        />

        {Object.entries(grouped).map(([key, group]) => {
          const [lat, lon] = key.split(',').map(Number);
          return group.map((photo, idx) => {
            const [offsetLon, offsetLat] = getOffsetPosition([lon, lat], idx, group.length);
            return (
              <PointAnnotation
                key={photo.id}
                id={photo.id}
                ref={(ref) => {
                  if (ref) annotationRefs.current[photo.id] = ref;
                }}
                coordinate={[offsetLon, offsetLat]}
                anchor={{ x: 0.5, y: 0.5 }}
                onSelected={() => setSelectedPhoto(photo)}
              >
                <View style={styles.photoMarker}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.markerImage}
                    resizeMode="cover"
                    onLoad={() => handleImageLoad(photo.id)}
                    onError={(err) => console.warn('Image load error:', err)}
                  />
                </View>
              </PointAnnotation>
            );
          });
        })}
      </MapView>

      {/* Photo Detail Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />

              {selectedPhoto.address && (
                <Text style={styles.infoText}>
                  <Ionicons name="location-outline" size={16} color="#666" />{' '}
                  {selectedPhoto.address}
                </Text>
              )}

              {selectedPhoto.weather && (
                <Text style={styles.infoText}>
                  <Ionicons name="cloud-outline" size={16} color="#666" />{' '}
                  {selectedPhoto.weather}
                </Text>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPhoto(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  matchParent: {
    flex: 1,
  },
  photoMarker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    elevation: 5,
  },
  fullImage: {
    width: '100%',
    height: 300,
    marginBottom: 10,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    width: '100%',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
