import { StyleSheet, FlatList, Dimensions } from 'react-native';
import UserCard from './UserCard';
import { useMemo, useState } from 'react';
import Spinner from '../loader/Spinner';
import { View } from 'moti';

const screenWidth = Dimensions.get('window').width;
const spacing = 16; 
const cardWidth = (screenWidth - spacing * 3) / 2; 

const UserFlatList = ({ pressable, onPress } : {pressable?: boolean, onPress?: () => void,}) => {
  const [loading, setLoading] = useState(false);

  const data = useMemo(() => [
    { id: '1', image: require('@/src/assets/images/users/user-1.png'), name: "Aliasger Barood", title: "Tipper", its: "30532154", tag: "me" },
    { id: '2', image: require('@/src/assets/images/users/user-1.png'), name: "Jafarussadiq chandbhai", title: "Support", its: "30862154", tag: "" },
    { id: '3', image: require('@/src/assets/images/users/user-1.png'), name: "Mohammad banduk", title: "Support", its: "30905321", tag: "" },
  ], []);

  const handleLoadMore = () => {
    if (!loading) {
      setLoading(false);
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={2}
      renderItem={({ item, index }) => (
        <View style={[styles.cardWrapper, { width: cardWidth, marginRight: index % 2 === 0 ? spacing : 0, }]}>
          <UserCard item={item} pressable={pressable} onPress={onPress} />
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
