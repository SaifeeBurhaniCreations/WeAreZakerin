import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { getColor } from '@/src/constants/colors';
import Typography from '../../typography/Typography';
import { AddDataModalProps, AddDataModalRef } from '@/src/types';
import Button from '../Button';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const BottomSheetModal = forwardRef<AddDataModalRef, AddDataModalProps>(({ title, children, footer }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsVisible(true),
    close: () => setIsVisible(false),
  }));

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={() => setIsVisible(false)}
      swipeDirection="down"
      style={styles.modal}
      onBackdropPress={() => setIsVisible(false)}
      propagateSwipe
      backdropOpacity={0.4}
      useNativeDriver={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content}>
            <Typography variant="h3">{title}</Typography>
            {children}
          </ScrollView>
  <View style={{ marginTop: 8, marginHorizontal: 16 }}>
    <Button onPress={() => setIsVisible(false)} full>{footer}</Button>
  </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

export default BottomSheetModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  keyboardAvoiding: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: getColor('light'),
    borderRadius: 24,
    paddingBottom: 24,
    paddingTop: 12,
    maxHeight: SCREEN_HEIGHT * 0.6,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: getColor('green', 100),
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 24,
    gap: 16,
  },
});
