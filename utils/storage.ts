import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'cached_photos';

export const saveCachedPhotos = async (photos: any[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch (e) {
    console.error('Error saving cached photos:', e);
  }
};

export const getCachedPhotos = async (): Promise<any[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading cached photos:', e);
    return [];
  }
};
