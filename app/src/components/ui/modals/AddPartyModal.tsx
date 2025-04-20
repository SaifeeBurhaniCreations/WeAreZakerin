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
import Input from '../Input';
import Button from '../Button';
import Select from '../Select';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const AddPartyModal = forwardRef<AddDataModalRef, AddDataModalProps>(({ title }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>("");

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

            <Input placeholder='Party Name' />

            <Select
              options={[
                { label: "Add Admin", value: "add_admin" },
                { label: "Aliasger", value: "h_member" },
                { label: "Jafarussadiq", value: "h_admin" },
                { label: "Hussain", value: "m_member", disabled: true },
              ]}
              value={selectedValue}
              onSelect={(val) => setSelectedValue(val)}
              placeholder="Choose Admin"
            />

            {selectedValue === "add_admin" && (
              <View style={{ gap: 16 }}>
                <Input placeholder="Full Name" />
                <Input placeholder="ITS number" />
                <Input placeholder="Phone Number" />
                <Input placeholder="Address" />
              </View>
            )}

          </ScrollView>
            <View style={{ marginTop: 8, marginHorizontal: 16 }}>
              <Button onPress={() => setIsVisible(false)} full>
                Save
              </Button>
            </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

export default AddPartyModal;

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
