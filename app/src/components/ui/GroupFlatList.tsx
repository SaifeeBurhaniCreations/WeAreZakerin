import { StyleSheet, FlatList, View } from 'react-native';
import GroupCard from './GroupCard'; 
import { useMemo } from 'react';

const GroupFlatList = () => {
  const data = useMemo(() => [
    { id: '1', image: require('@/src/assets/images/group/group.png'), name: "Hakimi Party", member: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], admin : "Jafarussadiq", tag: "me" },
    { id: '2', image: require('@/src/assets/images/group/group.png'), name: "Hussani Party", member: [1, 2, 3, 4, 5, 6], admin : "Hussain", tag: "" },
    { id: '3', image: require('@/src/assets/images/group/group.png'), name: "Mohammadi Party", member: [1], admin : "Aliasger", tag: "" },
  ], []);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <GroupCard item={item} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default GroupFlatList;

const styles = StyleSheet.create({
  list: {
    gap: 16,
  },
});
