import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { getColor } from "../constants/colors";
import Typography from "../components/typography/Typography";
import BackIcon from "../components/icons/BackIcon";
import BottomSheetModal from "../components/ui/modals/BottomSheetModal";
import { AddDataModalRef, eventProps, miqaatProps } from "../types";
import CircleIcon from "../components/icons/CircleIcon";
import { initialIslamicEvents } from "../constants/event";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Switch from "../components/ui/Switch";
import { normalizeEvents } from "../utils/eventUtils";
import Overlay from "../components/ui/Overlay";
import { daysOfWeek, getGregorianDateFromIslamic, getIslamicDate, getIslamicMonthLengths, islamicMonths, months, toArabicNumerals } from "../utils/calanderUtils";
import dayjs from "dayjs";
import TimePicker from "../components/ui/TimePicker";


const Calendar = () => {
  const modalRef = useRef<AddDataModalRef>(null);
  const AssignPartyRef = useRef<AddDataModalRef>(null);
  const createEventModalRef = useRef<AddDataModalRef>(null);
  const today = new Date();
  const todayIslamic = getIslamicDate(today)!;

  const [currentIslamicYear, setCurrentIslamicYear] = useState(todayIslamic.year);
  const [currentIslamicMonthIndex, setCurrentIslamicMonthIndex] = useState(todayIslamic.monthIndex);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentIslamicYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentIslamicMonthIndex);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedDateString, setSelectedDateString] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
  const [createEventData, setCreateEventData] = useState<{
    month: number;
    date: number;
    miqaat: miqaatProps;
  }>({
    month: 0,
    date: 0,
    miqaat: {
      title: "",
      description: "",
      phase: "night",
      priority: 2,
      year: null,
    },
  });

  const [islamicEvents, setIslamicEvents] = useState<eventProps[]>(() =>
    normalizeEvents(initialIslamicEvents)
  );
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventSwitchValue, setEventSwitchValue] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string>("");

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);


  const monthLengths = getIslamicMonthLengths(currentIslamicYear);
  const totalDays = monthLengths[currentIslamicMonthIndex];
  const startDate = getGregorianDateFromIslamic(currentIslamicYear, currentIslamicMonthIndex, 1);
  const startDay = startDate.getDay();

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + totalDays - 1);

  useEffect(() => {
    setCreateEventData((prevData) => ({
      ...prevData,
      month: selectedMonthIndex,
      date: selectedDay,
    }));
  }, [selectedDay, selectedMonthIndex]);

  const getEventsForDate = (monthIndex: number, day: number) => {
    return islamicEvents.find(event => event.month === monthIndex && event.date === day)?.miqaats || [];
  };

  const changeIslamicMonth = (offset: number) => {
    setCurrentIslamicMonthIndex((prev) => {
      const newIndex = prev + offset;
      if (newIndex < 0) {
        setCurrentIslamicYear((prevYear) => prevYear - 1);
        return 11;
      } else if (newIndex > 11) {
        setCurrentIslamicYear((prevYear) => prevYear + 1);
        return 0;
      }
      return newIndex;
    });
  };

  const goToToday = () => {
    const todayIslamic = getIslamicDate(new Date())!;
    setCurrentIslamicYear(todayIslamic.year);
    setCurrentIslamicMonthIndex(todayIslamic.monthIndex);
  };

  const createEvent = () => {
    setIslamicEvents((prevEvents) => {
      const newEvent = {
        month: createEventData.month,
        date: createEventData.date,
        miqaats: [
          {
            title: eventName,
            description: eventDescription,
            location: eventLocation,
            priority: 2,
            phase: eventSwitchValue ? "day" : "night" as "day" | "night",
            year: null,
          },
        ],
      };

      const existingIndex = prevEvents.findIndex(
        (e) => e.month === newEvent.month && e.date === newEvent.date
      );

      if (existingIndex !== -1) {
        const updatedEvents = [...prevEvents];
        updatedEvents[existingIndex].miqaats.push(newEvent.miqaats[0]);
        return updatedEvents;
      }

      const updatedEvents = [...prevEvents, newEvent];
      updatedEvents.sort((a, b) => {
        if (a.month !== b.month) return a.month - b.month;
        return a.date - b.date;
      });

      return updatedEvents;
    });

    setCreateEventData({
      month: 0,
      date: 0,
      miqaat: {
        title: "",
        description: "",
        phase: "night",
        priority: 2,
        year: null,
      },
    })
    setEventName("")
    setEventDescription("")
    setEventLocation("")
    setEventSwitchValue(false)

    createEventModalRef.current?.close();
  };

  const renderDays = () => {
    const days: JSX.Element[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`blank-${i}`} style={styles.dayCell} />);
    }

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const islamicDate = getIslamicDate(date);
      const dateString = date.toDateString();
      const isToday = dateString === today.toDateString();
      const isSelected = dateString === selectedDateString;
      const events = getEventsForDate(currentIslamicMonthIndex, islamicDate!.day);
      const highestPriority = Math.min(...events.map(event => event.priority), 4);
      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.dayCell,
            isToday && styles.today,
            isSelected && styles.selected
          ]}
          onPress={() => {
            const events = getEventsForDate(currentIslamicMonthIndex, islamicDate!.day);
            setSelectedDateString(dateString);
            setSelectedEvents(events);
            setSelectedDay(islamicDate!.day)

            if (events.length === 0) {
              createEventModalRef.current?.open();
            } else {
              modalRef.current?.open();
            }
          }}

        >
          <Typography
            variant="b2"
            style={[
              {
                color:
                  highestPriority === 1
                    ? getColor("red", 400)
                    : highestPriority === 2 || highestPriority === 3
                      ? getColor("blue", 400)
                      : getColor("dark", 700),
              },
            ]}
          >
            {toArabicNumerals(islamicDate!.day)}
          </Typography>

          <Typography variant="b5" style={{ color: getColor("dark", 700) }}>{date.getDate()} {months[date.getMonth()].slice(0, 3)}</Typography>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const handleStartTimeChange = (_: any, time?: Date) => {
    setShowStartPicker(false);
    if (time) {
      setSelectedStartTime(time);
    }
  };
  const handleEndTimeChange = (_: any, time?: Date) => {
    setShowEndPicker(false);
    if (time) {
      setSelectedEndTime(time);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerItem} onPress={() => setCurrentIslamicYear((y) => y - 1)}><Typography variant="b4" color={getColor("dark", 300)}>« Year</Typography></TouchableOpacity>

        <TouchableOpacity style={styles.headerItem} onPress={() => setCurrentIslamicYear((y) => y + 1)}><Typography variant="b4" color={getColor("dark", 300)}>» Year</Typography></TouchableOpacity>

        <TouchableOpacity style={styles.headerItem2} onPress={() => setShowDatePicker(true)}><Typography variant="b4" color={getColor("dark", 300)}>Go to Date</Typography></TouchableOpacity>

        <TouchableOpacity style={styles.headerItem2} onPress={goToToday}><Typography variant="b4" color={getColor("dark", 300)}>Today</Typography></TouchableOpacity>
      </View>
      <View style={styles.islamicMonthName}>
        <Pressable onPress={() => changeIslamicMonth(-1)}>
          <BackIcon size={16} color={getColor("dark", 700)} />
        </Pressable>
        <Typography variant="h5" style={styles.textAlignCenter}>{islamicMonths[currentIslamicMonthIndex]} {currentIslamicYear}</Typography>
        <Pressable onPress={() => changeIslamicMonth(1)} style={{ transform: [{ rotate: "180deg" }] }}>
          <BackIcon size={16} color={getColor("dark", 700)} />
        </Pressable>

      </View>

      <View style={styles.daysOfWeek}>
        {daysOfWeek.map((d, idx) => (
          <Typography variant="b4" key={idx} color={getColor("dark", 700)} style={styles.dayLabel}>{d}</Typography>
        ))}
      </View>

      <View style={styles.grid}>{renderDays()}</View>

      <BottomSheetModal title={`Events for ${selectedDateString}`} ref={modalRef} onPress={() => AssignPartyRef.current?.open()} footer="Assign Party">
        {selectedEvents.map((event, index) => (
          <View key={index} style={styles.eventCard}>
            <CircleIcon />
            <View key={index} style={[styles.VStack, { flex: 1, minWidth: 0 }]}>
              <Typography variant="b4" style={{
                color: getColor('dark', 700),
              }}>
                {event.title} - {event.description || 'No description'}
              </Typography>
              <Typography variant="b5" style={{ fontSize: 12, fontWeight: "400", lineHeight: 14 }} color={getColor('dark', 300)}>@Burhanpur</Typography>
            </View>
          </View>
        ))}
      </BottomSheetModal>

      <BottomSheetModal title={`Events for ${selectedDateString}`} ref={createEventModalRef} footer="Create Event" onPress={createEvent} disabled={
        eventName === "" || 
        eventDescription === "" || 
        eventLocation === "" || 
        selectedParty === ""
}>
  <ScrollView>
  <View style={{ gap: 16 }}>
        <Input
          placeholder='Event Name'
          value={eventName}
          onChangeText={setEventName}>
            Event Name</Input>

        <Select
          options={[
            { label: "Hakimi - Jafarussadiq", value: "hakimi" },
            { label: "Husaini - Hussain", value: "husaini" },
            { label: "Taheri - Mohammed", value: "taheri" },
          ]}
          value={selectedParty}
          onSelect={(party) => setSelectedParty(party)}
          placeholder="Assign Party"
        />

        <Input
          placeholder='Event Description'
          value={eventDescription}
          onChangeText={setEventDescription}>
            Event Description</Input>
      <View style={styles.HStack}>
        <Input
          placeholder='Event start'
          mask="time"
          value={selectedStartTime ? dayjs(selectedStartTime).format("hh:mm A") : ""}
          onFocus={() => setShowStartPicker(true)}
          onPress={() => setShowStartPicker(true)}
          showSoftInputOnFocus={false}
          />
          
        <Input
          placeholder='Event End'
          mask="time"
          value={selectedEndTime ? dayjs(selectedEndTime).format("hh:mm A") : ""}
          onFocus={() => setShowEndPicker(true)}
          onPress={() => setShowEndPicker(true)}
          showSoftInputOnFocus={false}
          />
          </View>
        <Input
          placeholder='Event Location'
          value={eventLocation}
          onChangeText={setEventLocation}>
            Event Location</Input>

        <Switch
          text={"day"}
          value={eventSwitchValue}
          onValueChange={setEventSwitchValue}
        />
        </View>
        </ScrollView>
      </BottomSheetModal>

      <BottomSheetModal title={`Assign Party for ${selectedDateString}`} ref={AssignPartyRef} footer="Assign" disabled={selectedParty === ''}>
      <Select
          options={[
            { label: "Hakimi - Jafarussadiq", value: "hakimi" },
            { label: "Husaini - Hussain", value: "husaini" },
            { label: "Taheri - Mohammed", value: "taheri" },
          ]}
          value={selectedParty}
          onSelect={(party) => setSelectedParty(party)}
          placeholder="Assign Party"
        />
      </BottomSheetModal>
      <Overlay />
      {showStartPicker && (
       <TimePicker selectedTime={selectedStartTime} handleTimeChange={handleStartTimeChange} />
      )}
      {showEndPicker && (
       <TimePicker selectedTime={selectedEndTime} handleTimeChange={handleEndTimeChange} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: getColor('light', 200),
    flex: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  textAlignCenter: {
    textAlign: 'center',
  },
  islamicMonthName: {
    backgroundColor: getColor("green", 100),
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayLabel: {
    width: '14.28%',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: getColor("dark", 300),
    borderWidth: 0.5,
  },
  today: {
    backgroundColor: getColor("blue", 100),
  },
  selected: {
    backgroundColor: getColor("green", 100),
  },

  eventCard: {
    borderWidth: 0.5,
    borderColor: getColor("dark", 300),
    padding: 8,
    borderRadius: 4,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  VStack: {
    flexDirection: "column",
    gap: 4,
  },
  HStack: {
    flexDirection: "row",
    gap: 8,
  },
  headerItem: {
    backgroundColor: getColor("yellow", 100),
    padding: 6,
    borderRadius: 8
  },
  headerItem2: {
    backgroundColor: getColor("blue", 100),
    padding: 6,
    borderRadius: 8
  },
});

export default Calendar;
