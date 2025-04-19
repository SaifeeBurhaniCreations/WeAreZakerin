import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import Typography from '../../typography/Typography';
import Button from '../../ui/Button';

export type AddDataModalRef = {
  open: () => void;
  close: () => void;
};

const AddDataModal = forwardRef<AddDataModalRef>((_, ref) => {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['1%', '40%'], []);

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.expand(),
    close: () => sheetRef.current?.close(),
  }));

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.content}>
        <Typography variant="h3">Add New Data</Typography>
        {/* Replace with your input/form fields */}
        <View style={{ marginTop: 16 }}>
          <Button onPress={() => sheetRef.current?.close()}>Save</Button>
        </View>
      </View>
    </BottomSheet>
  );
});

export default AddDataModal;

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#fff',
  },
  handle: {
    backgroundColor: '#ccc',
    width: 40,
  },
  content: {
    padding: 20,
    gap: 12,
  },
});
