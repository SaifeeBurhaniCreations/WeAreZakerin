import { useEffect, useState } from 'react'
import { StyleSheet, Text, ScrollView } from 'react-native'
import { toHijri, toGregorian } from 'hijri-converter'
import { HStack } from '@/components/ui/hstack'
import { Button } from '@/components/ui/button'
import { VStack } from '@/components/ui/vstack'
import { Box } from '@/components/ui/box'

const hijriToGregorian = (hYear: number, hMonth: number, hDay: number): Date => {
  const { gy, gm, gd } = toGregorian(hYear, hMonth, hDay)
  return new Date(gy, gm - 1, gd)
}

const gregorianToHijri = (gDate: Date) => {
  const { hy, hm, hd } = toHijri(gDate.getFullYear(), gDate.getMonth() + 1, gDate.getDate())
  return { year: hy, month: hm, day: hd }
}

const generateHijriCalendarYear = (hijriYear: number) => {
  const months = []

  for (let month = 1; month <= 12; month++) {
    const days = []

    for (let day = 1; day <= 30; day++) {
      const gregDate = hijriToGregorian(hijriYear, month, day)
      const hijriDate = gregorianToHijri(gregDate)

      if (hijriDate.month !== month) break

      days.push({
        hijri: { year: hijriYear, month, day },
        gregorian: gregDate,
      })
    }

    months.push({ month, year: hijriYear, days })
  }

  return months
}


const ScheduleEventScreen = () => {
  const [calendar, setCalendar] = useState<any[]>([])
  
  useEffect(() => {
    const hijriYear = 1447
    const data = generateHijriCalendarYear(hijriYear)
    setCalendar(data)
  }, [])
  
  const toArabicDigit = (num: number) =>
    num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
  
  return (
    <ScrollView>
    <Box px={4} py={2}>
      <HStack justifyContent="space-between" alignItems="center" mt={4}>
        <Button variant="outline">←</Button>
        <Text >Shawwalul Mukarram 1446</Text>
        <Button variant="outline">→</Button>
      </HStack>
  
      {/* Weekdays Row */}
      <HStack justifyContent="space-between" mt={4}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'St'].map(d => (
          <Text key={d} textAlign="center" flex={1}>{d}</Text>
        ))}
      </HStack>
  
      {/* Calendar Grid */}
      <VStack space={2} mt={2}>
        {[...Array(5)].map((_, weekIdx) => (
          <HStack key={weekIdx} justifyContent="space-between">
            {[...Array(7)].map((_, dayIdx) => (
              <Box key={dayIdx} borderWidth={1} borderColor="gray.200" flex={1} p={1} h={50}>
                <Text fontSize="xs" color="gray.500">30 Mar</Text>
                <Text textAlign="center" fontSize="md">{toArabicDigit(12)}</Text> {/* Hijri digit */}
              </Box>
            ))}
          </HStack>
        ))}
      </VStack>

    </Box>
  </ScrollView>
  
  )
}

export default ScheduleEventScreen

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  monthContainer: { marginBottom: 24 },
  monthTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  hijriText: { fontSize: 14 },
  gregorianText: { fontSize: 14, color: '#555' },
})
