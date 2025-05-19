import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import React, { createContext, useContext, useEffect, useState } from "react";
import NotificationService from "../services/NotificationService";

export interface PhotoData {
  id: string;
  uri: string;
  timestamp: number;
  address?: string | null;
}

interface PhotoContextType {
  photos: PhotoData[];
  addPhoto: (uri: string, address: string | null, reminderMinutes?: number) => Promise<PhotoData>;
  saveToGallery: (photoId: string) => Promise<boolean>;
  deletePhoto: (photoId: string) => Promise<void>;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export function usePhotoContext() {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotoContext must be used within a PhotoProvider");
  }
  return context;
}

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  // Load saved photos on startup
  useEffect(() => {
    loadPhotos();
  }, []);

  // Save photos whenever the collection changes
  useEffect(() => {
    savePhotos();
  }, [photos]);

  // Load photos from AsyncStorage
  async function loadPhotos() {
    try {
      const jsonValue = await AsyncStorage.getItem("@memory_photos");
      if (jsonValue) {
        setPhotos(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error("Error loading photos:", error);
    }
  }

  // Save photos to AsyncStorage
  async function savePhotos() {
    try {
      const jsonValue = JSON.stringify(photos);
      await AsyncStorage.setItem("@memory_photos", jsonValue);
    } catch (error) {
      console.error("Error saving photos:", error);
    }
  }

  // Inside the PhotoProvider component, update the addPhoto function:

  // Add a new photo to the collection
  // In PhotoContext.tsx, update the addPhoto function:
  async function addPhoto(
    uri: string,
    address: string | null,
    reminderMinutes = 1 // Default is 1 minute
  ): Promise<PhotoData> {
    // Generate a unique ID
    const id = Date.now().toString();

    // Create internal app directory if it doesn't exist
    const photoDir = `${FileSystem.documentDirectory}photos/`;
    const dirInfo = await FileSystem.getInfoAsync(photoDir);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(photoDir, { intermediates: true });
    }

    // Copy file to app's internal storage
    const newUri = `${photoDir}${id}.jpg`;
    await FileSystem.copyAsync({
      from: uri,
      to: newUri,
    });

    // Create photo data object
    const newPhoto: PhotoData = {
      id,
      uri: newUri,
      timestamp: Date.now(),
      address,
    };

    // Update state
    setPhotos((prev) => [newPhoto, ...prev]);
    await NotificationService.notifyNewPhoto(newPhoto);

    // Return the new photo data
    return newPhoto;
  }

  // Save photo to device gallery
  async function saveToGallery(photoId: string) {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        return false;
      }

      // Find the photo
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) {
        return false;
      }

      // Save to device gallery
      await MediaLibrary.createAssetAsync(photo.uri);
      return true;
    } catch (error) {
      console.error("Error saving to gallery:", error);
      return false;
    }
  }

  // Delete a photo
  async function deletePhoto(photoId: string) {
    try {
      // Find the photo to delete
      const photo = photos.find((p) => p.id === photoId);
      if (photo) {
        // Delete the file
        await FileSystem.deleteAsync(photo.uri, { idempotent: true });
      }

      // Update collection
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
    // Get all scheduled notifications and cancel any related to this photo
    const scheduledNotifications =
      await NotificationService.getAllScheduledNotifications();

    for (const notification of scheduledNotifications) {
      const data = notification.content.data;
      if (data && data.photoId === photoId) {
        await NotificationService.cancelNotification(notification.identifier);
      }
    }
  }

  return (
    <PhotoContext.Provider
      value={{
        photos,
        addPhoto,
        saveToGallery,
        deletePhoto,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
}

// Add this line to export the PhotoProvider as the default export
export default PhotoProvider;
