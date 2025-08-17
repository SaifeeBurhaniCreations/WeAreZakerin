import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
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
import Switch from "../components/ui/Switch";
import { normalizeEvents } from "../utils/eventUtils";
import Overlay from "../components/ui/Overlay";
import {
  daysOfWeek,
  getGregorianDateFromIslamic,
  getIslamicDate,
  getIslamicMonthLengths,
  islamicMonths,
  months,
  toArabicNumerals
} from "../utils/calanderUtils";
import dayjs from "dayjs";
import TimePicker from "../components/ui/TimePicker";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import CrossIcon from "../components/icons/CrossIcon";
import Button from "../components/ui/Button";
import { useCreateOccasion } from "../hooks/useOccassion";
import { renameKey } from "../hooks/renameKey";
import { Toast } from "../utils/Toast";

// Types
interface Assignment {
  name: string;
  party: string;
}

interface CreateEventData {
  month: number;
  date: number;
  miqaat: miqaatProps;
}

interface ValidationErrors {
  eventName?: string;
  eventDescription?: string;
  eventLocation?: string;
  selectedParty?: string;
  date?: string;
  selectedStartTime?: string;
  assignments?: string;
}

interface KalamOption {
  label: string;
  value: string;
}

// Constants
const KALAM_OPTIONS: KalamOption[] = [
  { label: "Salam", value: "salam" },
  { label: "Noha", value: "noha" },
  { label: "Madeh", value: "madeh" },
  { label: "Nasihat", value: "nasihat" },
  { label: "Rasa", value: "rasa" },
  { label: "Na'at", value: "na'at" },
  { label: "Ilteja", value: "ilteja" },
];

const INITIAL_ASSIGNMENT: Assignment = { name: "", party: "" };

const Calendar: React.FC = () => {
// Refs
  const modalRef = useRef<AddDataModalRef>(null);
  const AssignPartyRef = useRef<AddDataModalRef>(null);
  const createEventModalRef = useRef<AddDataModalRef>(null);

  // Hooks
  const { create, isError, isLoading, isSuccess } = useCreateOccasion();
  const { groups } = useSelector((state: RootState) => state.party);
  const { me } = useSelector((state: RootState) => state.users);

  // State initialization with proper types
  const today = useMemo(() => new Date(), []);
  const todayIslamic = useMemo(() => getIslamicDate(today)!, [today]);

  const [currentIslamicYear, setCurrentIslamicYear] = useState<number>(todayIslamic.year);
  const [currentIslamicMonthIndex, setCurrentIslamicMonthIndex] = useState<number>(todayIslamic.monthIndex);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(currentIslamicYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(currentIslamicMonthIndex);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedDateString, setSelectedDateString] = useState<string>("");
  const [selectedEvents, setSelectedEvents] = useState<miqaatProps[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state
  const [createEventData, setCreateEventData] = useState<CreateEventData>({
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

  const [eventName, setEventName] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventSwitchValue, setEventSwitchValue] = useState<boolean>(false);
  const [selectedParty, setSelectedParty] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([{ ...INITIAL_ASSIGNMENT }]);

  // Validation functions
  const validateEventForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!eventName.trim()) {
      errors.eventName = "Event name is required";
    } else if (eventName.trim().length < 3) {
      errors.eventName = "Event name must be at least 3 characters";
    }

    if (!eventDescription.trim()) {
      errors.eventDescription = "Event description is required";
    } else if (eventDescription.trim().length < 10) {
      errors.eventDescription = "Event description must be at least 10 characters";
    }

    if (!eventLocation.trim()) {
      errors.eventLocation = "Event location is required";
    }

    if (!date) {
      errors.date = "Event date is required";
    }

    if (!selectedStartTime) {
      errors.selectedStartTime = "Event start time is required";
    }

    // Validate assignments
    const hasEmptyAssignments = assignments.some(assignment =>
      !assignment.name.trim() || !assignment.party.trim()
    );

    if (hasEmptyAssignments) {
      errors.assignments = "All assignment fields must be filled";
    }

    // Check for duplicate assignments
    const assignmentKeys = assignments.map(a => `${a.name}-${a.party}`);
    const uniqueAssignments = new Set(assignmentKeys);
    if (assignmentKeys.length !== uniqueAssignments.size) {
      errors.assignments = "Duplicate assignments are not allowed";
    }

    return errors;
  }, [eventName, eventDescription, eventLocation, date, selectedStartTime, assignments]);

  const validateAssignPartyForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {};

    const eventNameToUse = eventName || selectedEvents[0]?.title;
    if (!eventNameToUse?.trim()) {
      errors.eventName = "Event name is required";
    }

    if (!eventLocation.trim()) {
      errors.eventLocation = "Event location is required";
    }

    if (!date) {
      errors.date = "Event date is required";
    }

    if (!selectedStartTime) {
      errors.selectedStartTime = "Event start time is required";
    }

    const hasEmptyAssignments = assignments.some(assignment =>
      !assignment.name.trim() || !assignment.party.trim()
    );

    if (hasEmptyAssignments) {
      errors.assignments = "All assignment fields must be filled";
    }

    return errors;
  }, [eventName, selectedEvents, eventLocation, date, selectedStartTime, assignments]);

  // Clear validation errors when fields change
  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, eventName: undefined }));
  }, [eventName]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, eventDescription: undefined }));
  }, [eventDescription]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, eventLocation: undefined }));
  }, [eventLocation]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, date: undefined }));
  }, [date]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, selectedStartTime: undefined }));
  }, [selectedStartTime]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, assignments: undefined }));
  }, [assignments]);

  // Computed values with memoization
  const monthLengths = useMemo(() => getIslamicMonthLengths(currentIslamicYear), [currentIslamicYear]);
  const totalDays = useMemo(() => monthLengths[currentIslamicMonthIndex], [monthLengths, currentIslamicMonthIndex]);
  const startDate = useMemo(() => getGregorianDateFromIslamic(currentIslamicYear, currentIslamicMonthIndex, 1), [currentIslamicYear, currentIslamicMonthIndex]);
  const startDay = useMemo(() => startDate.getDay(), [startDate]);

  const groupOptions = useMemo(() =>
    groups?.map(group => ({
      label: group.name,
      value: group._id
    })) || [],
    [groups]
  );

  // Event handlers
  const handleAddAssignment = useCallback(() => {
    if (assignments.length >= 10) {
      Toast.show({
        title: 'Limit Reached',
        description: 'Maximum 10 assignments allowed per event',
        variant: 'warning',
      });
      return;
    }
    setAssignments(prev => [...prev, { ...INITIAL_ASSIGNMENT }]);
  }, [assignments.length]);

  const handleRemoveAssignment = useCallback((index: number) => {
    if (assignments.length <= 1) {
      Toast.show({
        title: 'Assignment is required',
        description: 'At least one assignment is required',
        variant: 'error',
      });
      return;
    }
    setAssignments(prev => prev.filter((_, i) => i !== index));
  }, [assignments.length]);

  const handleAssignmentChange = useCallback((index: number, field: keyof Assignment, value: string) => {
    setAssignments(prev =>
      prev.map((assignment, i) =>
        i === index ? { ...assignment, [field]: value } : assignment
      )
    );
  }, []);

  const resetForm = useCallback(() => {
    setEventName("");
    setEventDescription("");
    setEventLocation("");
    setEventSwitchValue(false);
    setSelectedParty("");
    setDate("");
    setSelectedStartTime(null);
    setAssignments([{ ...INITIAL_ASSIGNMENT }]);
    setValidationErrors({});
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
    });
  }, []);

  // Update createEventData when dependencies change
  useEffect(() => {
    setCreateEventData(prevData => ({
      ...prevData,
      month: selectedMonthIndex,
      date: selectedDay,
    }));
  }, [selectedDay, selectedMonthIndex]);

  const getEventsForDate = useCallback((monthIndex: number, day: number): miqaatProps[] => {
    return islamicEvents.find(event => event.month === monthIndex && event.date === day)?.miqaats || [];
  }, [islamicEvents]);

  const changeIslamicMonth = useCallback((offset: number) => {
    setCurrentIslamicMonthIndex(prev => {
      const newIndex = prev + offset;
      if (newIndex < 0) {
        setCurrentIslamicYear(prevYear => prevYear - 1);
        return 11;
      } else if (newIndex > 11) {
        setCurrentIslamicYear(prevYear => prevYear + 1);
        return 0;
      }
      return newIndex;
    });
  }, []);

  const goToToday = useCallback(() => {
    const todayIslamic = getIslamicDate(new Date())!;
    setCurrentIslamicYear(todayIslamic.year);
    setCurrentIslamicMonthIndex(todayIslamic.monthIndex);
  }, []);

  const createEvent = useCallback(async () => {
    const errors = validateEventForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];

      Toast.show({
        title: 'Validation Error',
        description: firstError,
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newEvent: eventProps = {
        month: createEventData.month,
        date: createEventData.date,
        miqaats: [
          {
            title: eventName.trim(),
            description: eventDescription.trim(),
            location: eventLocation.trim(),
            priority: 2,
            phase: eventSwitchValue ? "day" : "night",
            year: null,
          },
        ],
      };

      setIslamicEvents(prevEvents => {
        const existingIndex = prevEvents.findIndex(
          event => event.month === newEvent.month && event.date === newEvent.date
        );

        let updatedEvents: eventProps[];

        if (existingIndex !== -1) {
          updatedEvents = [...prevEvents];
          updatedEvents[existingIndex].miqaats.push(newEvent.miqaats[0]);
        } else {
          updatedEvents = [...prevEvents, newEvent];
        }

        return updatedEvents.sort((a, b) => {
          if (a.month !== b.month) return a.month - b.month;
          return a.date - b.date;
        });
      });

      resetForm();
      createEventModalRef.current?.close();
      Toast.show({
        title: 'Event Created',
        description: 'Event created successfully!',
        variant: 'success',
      });
    } catch (error) {
      Toast.show({
        title: 'Try Again Later',
        description: 'Failed to create event. Please try again.',
        variant: 'error',
      });
      console.error("Event creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateEventForm, createEventData, eventName, eventDescription, eventLocation, eventSwitchValue, resetForm]);

  const handleSubmit = useCallback(async () => {
    const errors = validateAssignPartyForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      Toast.show({
        title: 'Validation Error',
        description: firstError,
        variant: 'error',
      });
      return;
    }

    if (!me?._id) {
      Toast.show({
        title: 'Authorization',
        description: 'User not authenticated',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dataModel = {
        location: eventLocation.trim(),
        name: (eventName || selectedEvents[0]?.title || "").trim(),
        start_at: date,
        time: selectedStartTime,
        created_by: me._id,
        events: assignments.map(assignment => renameKey(assignment, "name", "type"))
      };

      console.log('Submitting data:', dataModel);

      await create(dataModel);
      
      if (isSuccess) {
        Toast.show({
          title: 'Assigned',
          description: 'Party assigned successfully!',
          variant: 'success',
        });
        resetForm();
        AssignPartyRef.current?.close();
      } else {
        throw new Error("Failed to assign party");
      }
      resetForm();
      AssignPartyRef.current?.close();

    } catch (error) {
      Toast.show({
        title: 'Error',
        description: 'Failed to assign party. Please try again.',
        variant: 'error',
      });
      console.error("Party assignment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAssignPartyForm, eventLocation, eventName, selectedEvents, date, selectedStartTime, me, assignments, create, resetForm]);

  const handleDateConfirm = useCallback((selectedDate: Date) => {
    setShowDatePicker(false);
    const formatted = format(selectedDate, 'MMM dd, yyyy');
    setDate(formatted);
  }, []);

  const handleDateCancel = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const handleStartTimeChange = useCallback((_: any, time?: Date) => {
    setShowStartPicker(false);
    if (time) {
      setSelectedStartTime(time);
    }
  }, []);

  const handleDayPress = useCallback((dateString: string, islamicDay: number) => {
    const events = getEventsForDate(currentIslamicMonthIndex, islamicDay);
    setSelectedDateString(dateString);
    setSelectedEvents(events);
    setSelectedDay(islamicDay);

    if (events.length === 0) {
      createEventModalRef.current?.open();
    } else {
      modalRef.current?.open();
    }
  }, [getEventsForDate, currentIslamicMonthIndex]);

  // Memoized day rendering for better performance
  const renderDays = useMemo(() => {
    const days: JSX.Element[] = [];

    // Add blank cells for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`blank-${i}`} style={styles.dayCell} />);
    }

    // Add actual days
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const islamicDate = getIslamicDate(date);
      const dateString = date.toDateString();
      const isToday = dateString === today.toDateString();
      const isSelected = dateString === selectedDateString;
      const events = getEventsForDate(currentIslamicMonthIndex, islamicDate!.day);
      const highestPriority = events.length > 0 ? Math.min(...events.map(event => event.priority), 4) : 4;

      days.push(
        <TouchableOpacity
          key={`day-${i}`}
          style={[
            styles.dayCell,
            isToday && styles.today,
            isSelected && styles.selected
          ]}
          onPress={() => handleDayPress(dateString, islamicDate!.day)}
          accessibilityLabel={`${islamicDate!.day} ${islamicMonths[currentIslamicMonthIndex]} ${currentIslamicYear}, ${date.getDate()} ${months[date.getMonth()]}`}
          accessibilityHint={events.length > 0 ? `${events.length} events` : "No events, tap to create"}
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
          <Typography variant="b5" style={{ color: getColor("dark", 700) }}>
            {date.getDate()} {months[date.getMonth()].slice(0, 3)}
          </Typography>
        </TouchableOpacity>
      );
    }

    return days;
  }, [startDay, totalDays, startDate, today, selectedDateString, getEventsForDate, currentIslamicMonthIndex, handleDayPress, currentIslamicYear]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.pageContainer, styles.centered]}>
        <ActivityIndicator size="large" color={getColor("blue", 400)} />
        <Typography variant="h6" style={{ marginTop: 16 }}>Loading Calendar...</Typography>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity 
          style={styles.headerItem} 
          onPress={() => setCurrentIslamicYear(y => y - 1)}
          accessibilityLabel="Previous year"
        >
          <Typography variant="b4" color={getColor("dark", 300)}>« Year</Typography>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerItem} 
          onPress={() => setCurrentIslamicYear(y => y + 1)}
          accessibilityLabel="Next year"
        >
          <Typography variant="b4" color={getColor("dark", 300)}>» Year</Typography>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.headerItem2}
          onPress={() => setShowDatePicker(true)}
          accessibilityLabel="Go to specific date"
        >
          <Typography variant="b4" color={getColor("dark", 700)}>Go to Date</Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerItem2}
          onPress={goToToday}
          accessibilityLabel="Go to today"
        >
          <Typography variant="b4" color={getColor("dark", 700)}>Today</Typography>
        </TouchableOpacity>
      </View>

      {/* Islamic Month Navigation */}
      <View style={styles.islamicMonthName}>
        <Pressable
          onPress={() => changeIslamicMonth(-1)}
          accessibilityLabel="Previous month"
        >
          <BackIcon size={16} color={getColor("dark", 700)} />
        </Pressable>
        <Typography variant="h5" style={styles.textAlignCenter}>
          {islamicMonths[currentIslamicMonthIndex]} {currentIslamicYear}
        </Typography>
        <Pressable
          onPress={() => changeIslamicMonth(1)}
          style={{ transform: [{ rotate: "180deg" }] }}
          accessibilityLabel="Next month"
        >
          <BackIcon size={16} color={getColor("dark", 700)} />
        </Pressable>
      </View>

      {/* Days of Week */}
      <View style={styles.daysOfWeek}>
        {daysOfWeek.map((day, idx) => (
          <Typography
            variant="b4"
            key={idx}
            color={getColor("dark", 700)}
            style={styles.dayLabel}
          >
            {day}
          </Typography>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>{renderDays}</View>

      {/* Event Details Modal */}
      <BottomSheetModal
        title={`Events for ${selectedDateString}`}
        ref={modalRef}
        onPress={() => createEventModalRef.current?.open()}
        footer="Assign Party"
      >
        {selectedEvents.map((event, index) => (
          <View key={`event-${index}`} style={styles.eventCard}>
            <CircleIcon />
            <View style={[styles.VStack, { flex: 1, minWidth: 0 }]}>
              <Typography variant="b4" style={{ color: getColor('dark', 700) }}>
                {event.title} - {event.description || 'No description'}
              </Typography>
            </View>
          </View>
        ))}
      </BottomSheetModal>

      {/* Create Event Modal */}
      <BottomSheetModal
        title={`Create Event for ${selectedDateString}`}
        ref={createEventModalRef}
        footer={isSubmitting ? "Creating..." : "Create Event"}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ gap: 16 }}>
            <Input
              placeholder='Event Name'
              value={eventName}
              onChangeText={setEventName}
              error={validationErrors.eventName}
            >
              Event Name *
            </Input>

            <Input
              placeholder='Event Description'
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              error={validationErrors.eventDescription}
            >
              Event Description *
            </Input>

            <View style={[styles.HStack, { justifyContent: "space-between" }]}>
              <Typography variant="h5">Assign Kalams *</Typography>
              <Button
                variant="outline"
                size="sm"
                onPress={handleAddAssignment}
                disabled={assignments.length >= 10}
              >
                Add
              </Button>
            </View>

            {validationErrors.assignments && (
              <Typography variant="b5" color={getColor("red", 400)}>
                {validationErrors.assignments}
              </Typography>
            )}

            {assignments.map((item, index) => (
              <View key={`assignment-${index}`} style={styles.HStack}>
                <Select
                  options={KALAM_OPTIONS}
                  style={{ flex: 0.8 }}
                  value={item.name}
                  onSelect={(val) => handleAssignmentChange(index, "name", val)}
                  placeholder="Select"
                />
                <Select
                  style={{ flex: 1 }}
                  options={groupOptions}
                  value={item.party}
                  onSelect={(val) => handleAssignmentChange(index, "party", val)}
                  placeholder="Assign Party"
                />
                {assignments.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveAssignment(index)}>
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <Input
              placeholder='Event start time'
              mask="time"
              value={selectedStartTime ? dayjs(selectedStartTime).format("hh:mm A") : ""}
              onFocus={() => setShowStartPicker(true)}
              onPress={() => setShowStartPicker(true)}
              showSoftInputOnFocus={false}
              error={validationErrors.selectedStartTime}
            >
              Event Start Time *
            </Input>

            <Input
              placeholder='Event Date'
              mask="date"
              value={date}
              onFocus={() => setShowDatePicker(true)}
              onPress={() => setShowDatePicker(true)}
              showSoftInputOnFocus={false}
              error={validationErrors.date}
            >
              Event Date *
            </Input>

            <Input
              placeholder='Event Location'
              value={eventLocation}
              onChangeText={setEventLocation}
              error={validationErrors.eventLocation}
            >
              Event Location *
            </Input>
          </View>
        </ScrollView>
      </BottomSheetModal>

      {/* Overlay */}
      <Overlay />

      {/* Time Picker */}
      {showStartPicker && (
        <TimePicker
          selectedTime={selectedStartTime}
          handleTimeChange={handleStartTimeChange}
        />
      )}

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          date={new Date()}
          onConfirm={handleDateConfirm}
          onCancel={handleDateCancel}
          minimumDate={new Date()}
          maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
        />
      )}
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  pageContainer: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: getColor("light", 50),
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: getColor("light", 100),
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  headerItem2: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: getColor("green"),
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  islamicMonthName: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  textAlignCenter: {
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.285%', // 100/7
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: getColor("light", 200),
    backgroundColor: getColor("light", 100),
    padding: 4,
  },
  today: {
    backgroundColor: getColor("blue", 100),
    borderColor: getColor("blue", 300),
    borderWidth: 2,
  },
  selected: {
    backgroundColor: getColor("blue", 200),
    borderColor: getColor("blue", 400),
    borderWidth: 2,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: getColor("dark", 400), 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
    elevation: 5, 
    padding: 12,
    marginVertical: 4,
    backgroundColor: getColor("light", 100),
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: getColor("blue", 400),
    gap: 12,
  },
  VStack: {
    flexDirection: 'column',
    gap: 4,
  },
  HStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: getColor("red", 400),
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    maxHeight: '80%',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  assignmentRow: {
    marginBottom: 12,
  },
  requiredField: {
    color: getColor("red", 400),
  },
});

export default Calendar;