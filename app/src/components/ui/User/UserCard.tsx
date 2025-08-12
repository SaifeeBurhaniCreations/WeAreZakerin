  import { getColor } from '@/src/constants/colors';
  import { UserCardProps } from '@/src/types';
  import { Image, Pressable, StyleSheet, View } from 'react-native';
  import Typography from '../../typography/Typography';
  import Tag from '../Tag';
  import React, { memo } from 'react';
import useAppNavigation from '@/src/hooks/useAppNavigation';
import { User } from '@/src/redux/slices/UserSlice';

const UserCard = ({ id, fullname, title, userid, pressable, onPress, admin, me }: User) => {
  const image = require('@/src/assets/images/users/user-1.png')
  const { goTo } = useAppNavigation();

  const handlePress = () => {
    if (onPress) {
      goTo(onPress, { id });
    }
  };
    const CardContent = () => (
      <View key={id} style={[styles.Vstack, styles.gap4]}>
        <Image source={image} style={styles.image} />
        <View style={styles.Hstack}>
          <Typography
            variant='h4'
            color={getColor('green', 700)}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.title}
          >
            {fullname}
          </Typography>
          {id === me ? <Tag size='sm'>Me</Tag> : id === admin && <Tag size='sm'>Admin</Tag>}
        </View>

          <Typography variant='b4' color={getColor('green', 400)}>
          {userid} • {title}
          </Typography>
      </View>
    );

    return pressable ? (
      <Pressable
        style={[
          styles.card
        ]}
        onPress={handlePress}
      >
        <CardContent />
      </Pressable>
    ) : (
      <View style={styles.card}>
        <CardContent />
      </View>
    );
  };

  export default memo(UserCard);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: getColor('light'),
      paddingHorizontal: 16,
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
    gap4: {
      gap: 4
    },
    image: {
      width: '100%',
      height: 120,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      resizeMode: 'cover',
    },
    title: {
      flexShrink: 1,
      flexGrow: 1,
      flexBasis: 0,
    },
  });



//   <Pressable
//   style={({ pressed }) => [
//     styles.card,
//     pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
//   ]}
//   onPress={onPress}
// >
//   <CardContent />
// </Pressable>