import { StyleSheet, FlatList, Dimensions } from 'react-native';
import UserCard from './UserCard';
import { useMemo, useState } from 'react';
import Spinner from '../loader/Spinner';
import { View } from 'moti';
import { UserFlatListProps } from '@/src/types';

const screenWidth = Dimensions.get('window').width;
const spacing = 16; 
const cardWidth = (screenWidth - spacing * 3) / 2; 

const UserFlatList = ({users, pressable, onPress, admin, me } : UserFlatListProps) => {
  const [loading, setLoading] = useState(false);


  const handleLoadMore = () => {
    if (!loading) {
      setLoading(false);
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item._id}
      numColumns={2}
      renderItem={({ item, index }) => (
        <View style={[styles.cardWrapper, { width: cardWidth, marginRight: index % 2 === 0 ? spacing : 0, }]}>
          <UserCard {...item} id={item?._id} me={me} admin={admin} pressable={pressable} onPress={onPress} />
        </View>
      )}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={loading ? <Spinner /> : null}
    />
  );
};

export default UserFlatList;

const styles = StyleSheet.create({
  list: {
    paddingVertical: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
  },
});
