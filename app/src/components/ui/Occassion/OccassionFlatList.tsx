import { StyleSheet, FlatList } from 'react-native';
import OccassionCard from './OccassionCard';
import { useState } from 'react';
import Spinner from '../loader/Spinner';
import { OccassionFlatListProps } from '@/src/types';

const OccassionFlatList = ({ occassions, pressable, onPress }: OccassionFlatListProps) => {
  const [loading, setLoading] = useState(false);

  const handleLoadMore = () => {
    if (!loading) {
      setLoading(false);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <FlatList
      data={occassions}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <OccassionCard
        key={item?._id}
        {...item}
        id={item?._id}
          pressable={pressable}
          onPress={onPress}
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={loading ? <Spinner /> : null}
    />
  );
};

export default OccassionFlatList;

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
});
