import { StyleSheet, FlatList } from 'react-native';
import UserCard from './UserCard';
import { useMemo, useState } from 'react';
import Spinner from '../loader/Spinner';
import { View } from 'moti';

const UserFlatList = ({ pressable, onPress } : {pressable?: boolean, onPress?: () => void,}) => {
  const [loading, setLoading] = useState(false);
  const data = useMemo(() => [
    { id: '1', image: require('@/src/assets/images/users/user-1.png'), name: "Hakimi Party", party: "Hakimi Party", its: "30532154", tag: "me" },
    { id: '2', image: require('@/src/assets/images/users/user-1.png'), name: "Hussani Party", party: "Taheri Party", its: "30862154", tag: "" },
    { id: '3', image: require('@/src/assets/images/users/user-1.png'), name: "Mohammadi Party", party: "Hussani Party", its: "30905321", tag: "" },
  ], []);

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
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <View style={styles.cardContainer}>
        <UserCard item={item} pressable={pressable} onPress={onPress} />
        <UserCard item={item} pressable={pressable} onPress={onPress} />
        </View>}
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
    gap: 16,
  },
  cardContainer: {
    flexDirection: "row",
    gap: 8,
  }
});
