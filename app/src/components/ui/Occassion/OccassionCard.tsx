import { getColor } from '@/src/constants/colors';
import { Image, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Typography from '../../typography/Typography';
import Tag from '../Tag';
import React, { memo, useCallback } from 'react';
import useAppNavigation from '@/src/hooks/useAppNavigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';
import { Occassion } from '@/src/redux/slices/OccassionSlice';
import { formatDate } from 'date-fns';
import dayjs from 'dayjs';

const OccassionCard = ({ id, name, pressable, onPress, created_by, createdat, location, time, start_at, status, ends_at, events, parties, attendees, description }: Occassion) => {

  const image = require('@/src/assets/images/group/group.png')
  const { goTo } = useAppNavigation();
  const paramData = {
    name,
    id,
    created_by,
    description,
    createdat,
    location,
    time,
    start_at,
    status,
    ends_at,
    events,
    parties,
    attendees
  }
  

  const handlePress = () => {
    if (onPress) {
      goTo(onPress, {data: paramData} );
    }
  };

  const getStatusColor = useCallback(() => {
    switch (status?.toLowerCase()) {
      case "pending":
        return getColor("red");      
      case "started":
        return getColor("blue");     
      case "ended":
        return getColor("green");     
      default:
        return getColor("green", 400);    
    }
  }, [status, getColor]);

  const CardContent = () => (
    <View key={id} style={styles.cardTitleContainer}>
      <View style={styles.Vstack}>
        <Typography variant='h4' color={getColor('green', 700)}>{name}</Typography>
        <Typography variant='b4' color={getColor('green', 400)}>
          {formatDate(start_at, "MMM dd yyyy")} • {dayjs(start_at).format("hh:mm A")} • <Typography variant='b4' color={getStatusColor()}>{status}</Typography>
        </Typography>
      </View>
    </View>
  );

  return pressable ? (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress()}
    >
      <CardContent />
    </TouchableOpacity>
  ) : (
    <View style={styles.card}>
      <CardContent />
    </View>
  );
};

export default memo(OccassionCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: getColor('light'),
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    flexDirection: 'column',
    shadowColor: getColor("dark", 400),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
    alignSelf: 'stretch', 
  },
  cardTitleContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center', 
  },
  Hstack: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flex: 1,
    // flexWrap: 'wrap'
  },
  Vstack: {
    flexDirection: 'column',
    justifyContent: 'center', // vertically center text stack
    alignItems: 'flex-start',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});
