import { getColor } from '@/src/constants/colors';
import { GroupCardProps } from '@/src/types';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Typography from '../../typography/Typography';
import Tag from '../Tag';
import React, { memo } from 'react';

const GroupCard = ({ id, image, name, tag, admin, member, pressable, onPress }: GroupCardProps) => {
  const CardContent = () => (
    <View style={styles.cardTitleContainer}>
      <Image source={image} style={styles.image} />
      <View style={styles.Vstack}>
        <View style={styles.Hstack}>
          <Typography variant='h4' color={getColor('green', 700)}>{name}</Typography>
          {tag !== '' && <Tag size='sm'>Me</Tag>}
        </View>
        <Typography variant='b4' color={getColor('green', 400)}>
          {admin} • {member.length} member{member.length !== 1 && 's'}
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
      onPress={onPress}
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
