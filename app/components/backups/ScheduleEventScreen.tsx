import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getColor } from "../constants/colors";
import Typography from "../components/typography/Typography";
import BackIcon from "../components/icons/BackIcon";
import BottomSheetModal from "../components/ui/modals/BottomSheetModal";
import { format } from 'date-fns';
import { AddDataModalRef, eventProps, miqaatProps } from "../types";
import CircleIcon from "../components/icons/CircleIcon";
import { initialIslamicEvents } from "../constants/event";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { normalizeEvents } from "../utils/eventUtils";
import Overlay from "../components/ui/Overlay";
import { daysOfWeek, getGregorianDateFromIslamic, getIslamicDate, getIslamicMonthLengths, islamicMonths, months, toArabicNumerals } from "../utils/calanderUtils";
import dayjs from "dayjs";
import TimePicker from "../components/ui/TimePicker";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import CrossIcon from "../components/icons/CrossIcon";
import Button from "../components/ui/Button";
import { useCreateOccasion } from "../hooks/useOccassion";
import { renameKey } from "../hooks/renameKey";


const Calendar = () => {
  const modalRef = useRef<AddDataModalRef>(null);
  const AssignPartyRef = useRef<AddDataModalRef>(null);
  const createEventModalRef = useRef<AddDataModalRef>(null);
  const today = new Date();
  const { create, isError, isLoading, isSuccess } = useCreateOccasion();
  const todayIslamic = getIslamicDate(today)!;

  const { groups } = useSelector((state: RootState) => state.party);

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
  const { me } = useSelector((state: RootState) => state.users)
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventSwitchValue, setEventSwitchValue] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string>("");

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [date, setDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [assignments, setAssignments] = useState([
    { name: "", party: "" }
  ]);

  const kalamOptions = [
    { label: "Salam", value: "salam" },
    { label: "Noha", value: "noha" },
    { label: "Madeh", value: "madeh" },
    { label: "Nasihat", value: "nasihat" },
    { label: "Rasa", value: "rasa" },
    { label: "Na'at", value: "na'at" },
    { label: "Ilteja", value: "ilteja" },
  ];

  const handleAdd = () => {
    setAssignments([...assignments, { name: "", party: "" }]);
  };

  const handleRemove = (index: number) => {
    const updated = [...assignments];
    updated.splice(index, 1);
    setAssignments(updated);
  };

  const handleChange = (index: number, field: string, value: string) => {
    console.log(index, field, value);
    
    const updated = [...assignments];
    updated[index][field] = value;
    setAssignments(updated);
  };

  const monthLengths = getIslamicMonthLengths(currentIslamicYear);
  const totalDays = monthLengths[currentIslamicMonthIndex];
  const startDate = getGregorianDateFromIslamic(currentIslamicYear, currentIslamicMonthIndex, 1);
  const startDay = startDate.getDay();

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

  const handleConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    const formatted = format(selectedDate, 'MMM dd, yyyy');
    setDate(formatted);
};

const handleCancel = () => {
    setShowDatePicker(false);
};

  const handleStartTimeChange = (_: any, time?: Date) => {
    setShowStartPicker(false);
    if (time) {
      setSelectedStartTime(time);
    }
  };

  const handleSubmit = async () => {
    const dataModel = {
      location: eventLocation,
      name: eventName === "" ? selectedEvents[0]?.title : eventName,
      start_at: date,
      time: selectedStartTime,
      created_by: me?._id,
      events: assignments?.map(val => renameKey(val, "name", "type"))
    }
    console.log('dataModel',dataModel);
    
    // const data = await create(dataModel)
  }

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
              <View style={[styles.HStack, { justifyContent: "space-between" }]}>
        <Typography variant="h5">Assign Kalams</Typography>
        <Button variant="outline" size="sm" onPress={handleAdd}>
          Add
        </Button>
      </View>

      {assignments.map((item, index) => (
        <View key={index} style={styles.HStack}>
          <Select
            options={kalamOptions}
            style={{ flex: 0.8 }}
            value={item.name}
            onSelect={(val) => handleChange(index, "name", val)}
            placeholder="Kalam"
          />
          <Select
            style={{ flex: 1 }}
            options={groups?.map(val => ({
              label: val.name,
              value: val._id
            }))}
            value={item.party}
            onSelect={(val) => handleChange(index, "party", val)}
            placeholder="Assign Party"
          />
          {assignments.length > 1 && (
            <CrossIcon onPress={() => handleRemove(index)} />
          )}
        </View>
      ))}

              <Input
                placeholder='Event start'
                mask="time"
                value={selectedStartTime ? dayjs(selectedStartTime).format("hh:mm A") : ""}
                onFocus={() => setShowStartPicker(true)}
                onPress={() => setShowStartPicker(true)}
                showSoftInputOnFocus={false}
                >Event start</Input>
              <Input
                placeholder='Event Date'
                mask="date"
                value={date}
                onFocus={() => setShowDatePicker(true)}
                onPress={() => setShowDatePicker(true)}
                showSoftInputOnFocus={false}
                />
            <Input
              placeholder='Event Location'
              value={eventLocation}
              onChangeText={setEventLocation}>
                Event Location</Input>
          </View>
        </ScrollView>
      </BottomSheetModal>

      <BottomSheetModal title={`Assign Party for ${selectedDateString}`} onPress={handleSubmit} ref={AssignPartyRef} footer="Assign">
        <ScrollView>
          <View style={{ gap: 16 }}>

            <Input
            placeholder='Event Name'
            value={eventName}
            onChangeText={setEventName}>
              Event Name</Input>
              <View style={[styles.HStack, { justifyContent: "space-between" }]}>
        <Typography variant="h5">Assign Kalams</Typography>
        <Button variant="outline" size="sm" onPress={handleAdd}>
          Add
        </Button>
      </View>

      {assignments.map((item, index) => (
        <View key={index} style={styles.HStack}>
          <Select
            options={kalamOptions}
            style={{ flex: 0.8 }}
            value={item.name}
            onSelect={(val) => handleChange(index, "name", val)}
            placeholder="Kalam"
          />
          <Select
            style={{ flex: 1 }}
            options={groups?.map(val => ({
              label: val.name,
              value: val.name
            }))}
            value={item.party}
            onSelect={(val) => handleChange(index, "party", val)}
            placeholder="Assign Party"
          />
          {assignments.length > 1 && (
            <CrossIcon onPress={() => handleRemove(index)} />
          )}
        </View>
      ))}

              <Input
                placeholder='Event start'
                mask="time"
                value={selectedStartTime ? dayjs(selectedStartTime).format("hh:mm A") : ""}
                onFocus={() => setShowStartPicker(true)}
                onPress={() => setShowStartPicker(true)}
                showSoftInputOnFocus={false}
                >Event start</Input>
              <Input
                placeholder='Event Date'
                mask="date"
                value={date}
                onFocus={() => setShowDatePicker(true)}
                onPress={() => setShowDatePicker(true)}
                showSoftInputOnFocus={false}
                />
            <Input
              placeholder='Event Location'
              value={eventLocation}
              onChangeText={setEventLocation}>
                Event Location</Input>
          </View>
        </ScrollView>
      </BottomSheetModal>
      <Overlay />
      {showStartPicker && (
        <TimePicker selectedTime={selectedStartTime} handleTimeChange={handleStartTimeChange} />
      )}
      {showDatePicker && (
          <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              date={new Date()}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
          />
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
    alignItems: "center",
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
