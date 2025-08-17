import { StyleSheet, FlatList } from 'react-native';
import GroupCard from './GroupCard';
import { useState } from 'react';
import Spinner from '../loader/Spinner';
import { GroupFlatListProps } from '@/src/types';

const GroupFlatList = ({ groups, pressable, onPress }: GroupFlatListProps) => {
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
      data={groups}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <GroupCard
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

export default GroupFlatList;

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
});
