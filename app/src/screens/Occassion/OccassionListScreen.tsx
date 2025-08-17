import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Typography from '@/src/components/typography/Typography'
import SearchBar from '@/src/components/ui/SearchBar'
import { getColor } from '@/src/constants/colors'
import OccassionFlatList from '@/src/components/ui/Occassion/OccassionFlatList'
import { useOccasions } from '@/src/hooks/useOccassion'
import useAppNavigation from '@/src/hooks/useAppNavigation'
import Button from '../../components/ui/Button'

const OccassionListScreen = () => {
    const { data, isLoading } = useOccasions()
    const { goTo } = useAppNavigation()

    
    return (
        <View style={styles.pageContainer}>
            <View style={[styles.Hstack, styles.justifyBetween]}>
                <Typography variant='h3'>Miqaats</Typography>
                <Button size="sm" variant='outline' onPress={() => goTo("ScheduleEvent")}>Schedule Event</Button>
            </View>

            <View style={styles.Hstack}>
                <SearchBar />
            </View>
            {
                !isLoading ? (
                    <OccassionFlatList occassions={!isLoading ? data : []} pressable onPress="OccasionDetail" />
                ) : (
                    <View style={[styles.pageContainer, styles.centered]}>
                        <ActivityIndicator size="large" color={getColor("blue", 400)} />
                        <Typography variant="h6" style={{ marginTop: 16 }}>Loading Calendar...</Typography>
                    </View>
                )
            }

        </View>
    )
}

export default OccassionListScreen

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
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
