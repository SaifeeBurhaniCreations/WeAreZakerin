import { StyleSheet, View } from 'react-native'
import { getColor } from '../constants/colors'
import GroupFlatList from '../components/ui/GroupFlatList'
import SearchBar from '../components/ui/SearchBar'
import Typography from '../components/typography/Typography'
import Button from '../components/ui/Button'
import AddPartyModal from '../components/ui/modals/AddPartyModal'
import { useRef } from 'react'
import { AddDataModalRef } from '../types'

const HomeScreen = () => {
  const modalRef = useRef<AddDataModalRef>(null);
  
  return (
    <View style={styles.pageContainer}>
        <View style={[styles.Hstack, styles.justifyBetween]}>
          <Typography variant='h3'>Parties</Typography>
          <Button size="sm" variant='outline' onPress={() => modalRef.current?.open()}>Add Party</Button>
    </View>

        <View style={styles.Hstack}>
          <SearchBar />
        </View>
      <GroupFlatList />
      <AddPartyModal title={"Add new party"} ref={modalRef} />
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: getColor('light', 200),
    flex: 1,
    padding: 16,
    gap: 16,
  },
  Hstack: {
    flexDirection: "row",
    gap: 8,
  },
  justifyBetween: {
    justifyContent: "space-between"
  }
})
