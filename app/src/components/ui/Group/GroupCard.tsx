import { getColor } from '@/src/constants/colors';
import { GroupCardProps } from '@/src/types';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Typography from '../../typography/Typography';
import Tag from '../Tag';
import React, { memo } from 'react';
import useAppNavigation from '@/src/hooks/useAppNavigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';

const GroupCard = ({ id, name, admin, members = [], pressable, onPress }: GroupCardProps) => {

  const image = require('@/src/assets/images/group/group.png')

  const { goTo } = useAppNavigation();
  const paramData = {
    name,
    id,
    members,
    admin
  }

  const { users } = useSelector((state: RootState) => state.users);

  const getAdmin = users?.find(value => value?._id === admin)


  const handlePress = () => {
    if (onPress) {
      goTo(onPress, paramData );
    }
  };


  const CardContent = () => (
    <View key={id} style={styles.cardTitleContainer}>
      <Image source={image} style={styles.image} />
      <View style={styles.Vstack}>
        <View style={styles.Hstack}>
          <Typography variant='h4' color={getColor('green', 700)}>{name}</Typography>
          {/* {tag !== '' && <Tag size='sm'>Me</Tag>} */}
        </View>
        <Typography variant='b4' color={getColor('green', 400)}>
          {getAdmin?.fullname} • {members.length} member{members.length !== 1 && 's'}
        </Typography>
      </View>
    </View>
  );

  return pressable ? (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
      ]}
      onPress={() => handlePress()}
    >
      <CardContent />
    </Pressable>
  ) : (
    <View style={styles.card}>
      <CardContent />
    </View>
  );
};

export default memo(GroupCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: getColor('light'),
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    flexDirection: 'column',
    shadowColor: 'rgba(0, 17, 13, 0.06)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  Hstack: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  Vstack: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});
