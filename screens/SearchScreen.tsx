import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const API_KEY = "6f102c62f41998d151e5a1b48713cf13";

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [retryParams, setRetryParams] = useState<any>(null);

  const navigation = useNavigation<any>();

  const fetchSearchResults = async (q: string, pageNumber = 1) => {
    try {
      const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&format=json&nojsoncallback=1&extras=url_s&text=${q}&page=${pageNumber}&per_page=20`;

      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(url);
      const data = await response.json();

      const newPhotos = data.photos.photo;

      if (pageNumber === 1) {
        setPhotos(newPhotos);
      } else {
        setPhotos(prev => [...prev, ...newPhotos]);
      }

      setHasMore(pageNumber < data.photos.pages);
    } catch (error) {
      setRetryParams({ q, pageNumber });
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    setPage(1);
    fetchSearchResults(query.trim(), 1);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSearchResults(query.trim(), nextPage);
    }
  };

  const handleRetry = () => {
    if (retryParams) {
      fetchSearchResults(retryParams.q, retryParams.pageNumber);
      setSnackbarVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search (e.g., cat, dog)..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        style={styles.input}
        returnKeyType="search"
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : photos.length === 0 ? (
        <Text style={styles.noResults}>No results found.</Text>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" style={{ margin: 10 }} /> : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() =>
                navigation.navigate('FullScreenImage', { imageUrl: item.url_s })
              }
            >
              <Image
                source={{ uri: item.url_s }}
                style={styles.image}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Snackbar for Retry */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'RETRY',
          onPress: handleRetry,
        }}
      >
        Network error. Retry?
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  input: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  imageContainer: {
    width: '48%',
    margin: '1%',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
});
