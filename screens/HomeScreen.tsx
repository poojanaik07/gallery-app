import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { getCachedPhotos, saveCachedPhotos } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';

const API_KEY = "6f102c62f41998d151e5a1b48713cf13";
const PHOTOS_PER_PAGE = 20;

const getApiUrl = (page: number) =>
  `https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=${PHOTOS_PER_PAGE}&page=${page}&api_key=${API_KEY}&format=json&nojsoncallback=1&extras=url_s`;

export default function HomeScreen() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const navigation = useNavigation<any>();

  const fetchPhotos = async (pageNumber: number) => {
    try {
      const response = await fetch(getApiUrl(pageNumber));
      const data = await response.json();

      const newPhotos = data.photos.photo;
      const totalPages = data.photos.pages;

      if (pageNumber === 1) {
        await saveCachedPhotos(newPhotos);
        setPhotos(newPhotos);
      } else {
        setPhotos((prev) => [...prev, ...newPhotos]);
      }

      setHasMore(pageNumber < totalPages);
    } catch (error) {
      if (pageNumber === 1) {
        console.warn("Failed to fetch. Loading cached images.");
        const cached = await getCachedPhotos();
        if (cached.length > 0) setPhotos(cached);
        else Alert.alert("Error", "No internet and no cached data available.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePhotos = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPhotos(nextPage);
    }
  };

  useEffect(() => {
    fetchPhotos(1);
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <FlatList
      data={photos}
      keyExtractor={(item) => item.id}
      numColumns={2}
      onEndReached={loadMorePhotos}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
        ) : null
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ width: '48%', margin: '1%' }}
          onPress={() =>
            navigation.navigate('FullScreenImage', { imageUrl: item.url_s })
          }
        >
          <Image
            source={{ uri: item.url_s }}
            style={{ width: '100%', height: 150, borderRadius: 8 }}
          />
        </TouchableOpacity>
      )}
    />
  );
}
