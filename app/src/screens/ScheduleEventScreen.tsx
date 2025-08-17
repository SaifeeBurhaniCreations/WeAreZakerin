import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
} from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getColor } from "../constants/colors";
import Typography from "../components/typography/Typography";
import BackIcon from "../components/icons/BackIcon";
import BottomSheetModal from "../components/ui/modals/BottomSheetModal";
import { format } from 'date-fns';
import { AddDataModalRef, Assignment, CreateEventData, eventProps, miqaatProps, ValidationErrors } from "../types";
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
import { useCreateOccasion, usePendingOccasions } from "../hooks/useOccassion";
import { renameKey } from "../hooks/renameKey";
import { Toast } from "../utils/Toast";
import useAppNavigation from "../hooks/useAppNavigation";
import { Occassion } from "../redux/slices/OccassionSlice";
import { KALAM_OPTIONS } from "../utils/common";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

const INITIAL_ASSIGNMENT: Assignment = { name: "", party: "" };

// Responsive constants
const getResponsiveValues = () => {
  const isSmallScreen = DEVICE_WIDTH < 360;
  const isMediumScreen = DEVICE_WIDTH >= 360 && DEVICE_WIDTH < 400;
  const isTablet = DEVICE_WIDTH >= 768;

  return {
    padding: isSmallScreen ? 12 : 16,
    headerSpacing: isSmallScreen ? 12 : 20,
    calendarHeight: isTablet ? '50%' : DEVICE_HEIGHT < 700 ? '55%' : '60%',
    dayFontSize: isSmallScreen ? 11 : 12,
    headerButtonMinWidth: isSmallScreen ? 70 : 90,
    modalMaxHeight: DEVICE_HEIGHT * 0.85,
    gridGap: isSmallScreen ? 4 : 8,
  };
};

const Calendar: React.FC = () => {
  // Responsive values
  const responsive = useMemo(() => getResponsiveValues(), []);

  // Refs
  const modalRef = useRef<AddDataModalRef>(null);
  const AssignPartyRef = useRef<AddDataModalRef>(null);
  const createEventModalRef = useRef<AddDataModalRef>(null);

  // Hooks
  const { create, isLoading: isCreatingOccasion } = useCreateOccasion();
  const { groups } = useSelector((state: RootState) => state.party);
  const { me } = useSelector((state: RootState) => state.users);
  const { 
    data: pendingOccassions, 
    isLoading: isLoadingOccassion, 
    error: occasionError,
    refetch: refetchOccasions 
  } = usePendingOccasions('pending');

  // State initialization with proper types
  const today = useMemo(() => new Date(), []);
  const todayIslamic = useMemo(() => {
    try {
      const islamic = getIslamicDate(today);
      if (!islamic) throw new Error('Failed to get Islamic date');
      return islamic;
    } catch (error) {
      console.error('Error getting Islamic date:', error);
      return { year: 1445, monthIndex: 0, day: 1 }; // Fallback
    }
  }, [today]);

  const [currentIslamicYear, setCurrentIslamicYear] = useState<number>(todayIslamic.year);
  const [currentIslamicMonthIndex, setCurrentIslamicMonthIndex] = useState<number>(todayIslamic.monthIndex);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedDateString, setSelectedDateString] = useState<string>("");
  const [selectedEvents, setSelectedEvents] = useState<miqaatProps[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

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

  const [islamicEvents, setIslamicEvents] = useState<eventProps[]>(() => {
    try {
      return normalizeEvents(initialIslamicEvents);
    } catch (error) {
      console.error('Error normalizing events:', error);
      return [];
    }
  });

  const [eventName, setEventName] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventSwitchValue, setEventSwitchValue] = useState<boolean>(false);
  const [date, setDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([{ ...INITIAL_ASSIGNMENT }]);
  const { goTo } = useAppNavigation();

  // Error boundary for component state
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Enhanced validation functions with better error messages
  const validateEventForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {};

    try {
      if (!eventName?.trim()) {
        errors.eventName = "Event name is required";
      } else if (eventName.trim().length < 2) {
        errors.eventName = "Event name must be at least 2 characters";
      } else if (eventName.trim().length > 100) {
        errors.eventName = "Event name must be less than 100 characters";
      }

      if (!eventDescription?.trim()) {
        errors.eventDescription = "Event description is required";
      } else if (eventDescription.trim().length < 5) {
        errors.eventDescription = "Event description must be at least 5 characters";
      } else if (eventDescription.trim().length > 500) {
        errors.eventDescription = "Event description must be less than 500 characters";
      }

      if (!eventLocation?.trim()) {
        errors.eventLocation = "Event location is required";
      } else if (eventLocation.trim().length > 200) {
        errors.eventLocation = "Event location must be less than 200 characters";
      }

      if (!date) {
        errors.date = "Event date is required";
      }

      if (!selectedStartTime) {
        errors.selectedStartTime = "Event start time is required";
      } else {
        const now = new Date();
        const eventDateTime = new Date(date);
        eventDateTime.setHours(selectedStartTime.getHours(), selectedStartTime.getMinutes());
        
        if (eventDateTime < now) {
          errors.selectedStartTime = "Event time cannot be in the past";
        }
      }

      // Validate assignments
      if (!assignments || assignments.length === 0) {
        errors.assignments = "At least one assignment is required";
      } else {
        const hasEmptyAssignments = assignments.some(assignment =>
          !assignment?.name?.trim() || !assignment?.party?.trim()
        );

        if (hasEmptyAssignments) {
          errors.assignments = "All assignment fields must be filled";
        } else {
          // Check for duplicate assignments
          const assignmentKeys = assignments.map(a => `${a.name}-${a.party}`);
          const uniqueAssignments = new Set(assignmentKeys);
          if (assignmentKeys.length !== uniqueAssignments.size) {
            errors.assignments = "Duplicate assignments are not allowed";
          }
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      errors.general = "Validation failed. Please check your inputs.";
    }

    return errors;
  }, [eventName, eventDescription, eventLocation, date, selectedStartTime, assignments]);

  const validateAssignPartyForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {};

    try {
      const eventNameToUse = eventName || selectedEvents[0]?.title;
      if (!eventNameToUse?.trim()) {
        errors.eventName = "Event name is required";
      }

      if (!eventLocation?.trim()) {
        errors.eventLocation = "Event location is required";
      }

      if (!date) {
        errors.date = "Event date is required";
      }

      if (!selectedStartTime) {
        errors.selectedStartTime = "Event start time is required";
      }

      if (!assignments || assignments.length === 0) {
        errors.assignments = "At least one assignment is required";
      } else {
        const hasEmptyAssignments = assignments.some(assignment =>
          !assignment?.name?.trim() || !assignment?.party?.trim()
        );

        if (hasEmptyAssignments) {
          errors.assignments = "All assignment fields must be filled";
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      errors.general = "Validation failed. Please check your inputs.";
    }

    return errors;
  }, [eventName, selectedEvents, eventLocation, date, selectedStartTime, assignments]);

  // Clear validation errors when fields change
  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, eventName: undefined, general: undefined }));
  }, [eventName]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, eventDescription: undefined, general: undefined }));
  }, [eventDescription]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, eventLocation: undefined, general: undefined }));
  }, [eventLocation]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, date: undefined, general: undefined }));
  }, [date]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, selectedStartTime: undefined, general: undefined }));
  }, [selectedStartTime]);

  useEffect(() => {
    setValidationErrors(prev => ({ ...prev, assignments: undefined, general: undefined }));
  }, [assignments]);

  // Handle pending occasions with error handling
  useEffect(() => {
    const handlePendingOccasions = async () => {
      try {
        if (!isLoadingOccassion && pendingOccassions && Array.isArray(pendingOccassions)) {
          for (const val of pendingOccassions) {
            if (val && typeof val === 'object') {
              await createEvent(val);
            }
          }
        }
      } catch (error) {
        console.error('Error handling pending occasions:', error);
        setNetworkError('Failed to load occasions. Please refresh.');
      }
    };

    handlePendingOccasions();
  }, [pendingOccassions, isLoadingOccassion]);

  // Handle network errors
  useEffect(() => {
    if (occasionError) {
      setNetworkError('Failed to load occasions. Please check your connection.');
      console.error('Occasion error:', occasionError);
    } else {
      setNetworkError(null);
    }
  }, [occasionError]);

  // Computed values with memoization and error handling
  const monthLengths = useMemo(() => {
    try {
      return getIslamicMonthLengths(currentIslamicYear);
    } catch (error) {
      console.error('Error getting month lengths:', error);
      return Array(12).fill(29); // Fallback
    }
  }, [currentIslamicYear]);

  const totalDays = useMemo(() => {
    try {
      return monthLengths[currentIslamicMonthIndex] || 29;
    } catch (error) {
      console.error('Error getting total days:', error);
      return 29;
    }
  }, [monthLengths, currentIslamicMonthIndex]);

  const startDate = useMemo(() => {
    try {
      return getGregorianDateFromIslamic(currentIslamicYear, currentIslamicMonthIndex, 1);
    } catch (error) {
      console.error('Error getting start date:', error);
      return new Date(); // Fallback
    }
  }, [currentIslamicYear, currentIslamicMonthIndex]);

  const startDay = useMemo(() => {
    try {
      return startDate.getDay();
    } catch (error) {
      console.error('Error getting start day:', error);
      return 0;
    }
  }, [startDate]);

  const groupOptions = useMemo(() => {
    try {
      return groups?.map(group => ({
        label: group?.name || 'Unknown',
        value: group?._id || ''
      })).filter(option => option.value) || [];
    } catch (error) {
      console.error('Error creating group options:', error);
      return [];
    }
  }, [groups]);

  // Enhanced event handlers with error handling
  const handleAddAssignment = useCallback(() => {
    try {
      if (assignments.length >= 10) {
        Toast.show({
          title: 'Limit Reached',
          description: 'Maximum 10 assignments allowed per event',
          variant: 'warning',
        });
        return;
      }
      setAssignments(prev => [...prev, { ...INITIAL_ASSIGNMENT }]);
    } catch (error) {
      console.error('Error adding assignment:', error);
      Toast.show({
        title: 'Error',
        description: 'Failed to add assignment',
        variant: 'error',
      });
    }
  }, [assignments.length]);

  const handleRemoveAssignment = useCallback((index: number) => {
    try {
      if (assignments.length <= 1) {
        Toast.show({
          title: 'Assignment Required',
          description: 'At least one assignment is required',
          variant: 'warning',
        });
        return;
      }
      if (index < 0 || index >= assignments.length) {
        throw new Error('Invalid assignment index');
      }
      setAssignments(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error removing assignment:', error);
      Toast.show({
        title: 'Error',
        description: 'Failed to remove assignment',
        variant: 'error',
      });
    }
  }, [assignments.length]);

  const handleAssignmentChange = useCallback((index: number, field: keyof Assignment, value: string) => {
    try {
      if (index < 0 || index >= assignments.length) {
        throw new Error('Invalid assignment index');
      }
      if (!field || typeof value !== 'string') {
        throw new Error('Invalid assignment field or value');
      }
      
      setAssignments(prev =>
        prev.map((assignment, i) =>
          i === index ? { ...assignment, [field]: value.trim() } : assignment
        )
      );
    } catch (error) {
      console.error('Error updating assignment:', error);
      Toast.show({
        title: 'Error',
        description: 'Failed to update assignment',
        variant: 'error',
      });
    }
  }, [assignments.length]);

  const resetForm = useCallback(() => {
    try {
      setEventName("");
      setEventDescription("");
      setEventLocation("");
      setEventSwitchValue(false);
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
    } catch (error) {
      console.error('Error resetting form:', error);
    }
  }, []);

  // Update createEventData when dependencies change
  useEffect(() => {
    try {
      setCreateEventData(prevData => ({
        ...prevData,
        month: currentIslamicMonthIndex,
        date: selectedDay,
      }));
    } catch (error) {
      console.error('Error updating create event data:', error);
    }
  }, [selectedDay, currentIslamicMonthIndex]);

  const getEventsForDate = useCallback((monthIndex: number, day: number): miqaatProps[] => {
    try {
      if (!islamicEvents || !Array.isArray(islamicEvents)) return [];
      return islamicEvents.find(event => event.month === monthIndex && event.date === day)?.miqaats || [];
    } catch (error) {
      console.error('Error getting events for date:', error);
      return [];
    }
  }, [islamicEvents]);

  const changeIslamicMonth = useCallback((offset: number) => {
    try {
      setCurrentIslamicMonthIndex(prev => {
        const newIndex = prev + offset;
        if (newIndex < 0) {
          setCurrentIslamicYear(prevYear => Math.max(prevYear - 1, 1400)); // Minimum year
          return 11;
        } else if (newIndex > 11) {
          setCurrentIslamicYear(prevYear => Math.min(prevYear + 1, 1500)); // Maximum year
          return 0;
        }
        return newIndex;
      });
    } catch (error) {
      console.error('Error changing Islamic month:', error);
      Toast.show({
        title: 'Navigation Error',
        description: 'Failed to change month',
        variant: 'error',
      });
    }
  }, []);

  const goToToday = useCallback(() => {
    try {
      const todayIslamic = getIslamicDate(new Date());
      if (!todayIslamic) throw new Error('Failed to get today\'s Islamic date');
      setCurrentIslamicYear(todayIslamic.year);
      setCurrentIslamicMonthIndex(todayIslamic.monthIndex);
    } catch (error) {
      console.error('Error going to today:', error);
      Toast.show({
        title: 'Navigation Error',
        description: 'Failed to navigate to today',
        variant: 'error',
      });
    }
  }, []);

  const createEvent = useCallback(async (event: Occassion) => {
    try {
      if (!event || typeof event !== 'object') {
        throw new Error('Invalid event object');
      }

      const newEvent: eventProps = {
        month: event?.hijri_date?.month || 0,
        date: event?.hijri_date?.day || 1,
        miqaats: [
          {
            title: event?.name || 'Unknown Event',
            description: `${event?.description || 'No description'} - ${dayjs(event.time).format("hh:mm A")}`,
            location: event?.location || 'No location',
            priority: 2,
            phase: eventSwitchValue ? "day" : "night",
            year: null,
          },
        ],
      };

      setIslamicEvents(prevEvents => {
        try {
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
        } catch (error) {
          console.error('Error updating events:', error);
          return prevEvents;
        }
      });

    } catch (error) {
      console.error("Event creation error:", error);
      Toast.show({
        title: 'Event Creation Error',
        description: 'Failed to create event. Please try again.',
        variant: 'error',
      });
    }
  }, [eventSwitchValue]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return; // Prevent double submission

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
        title: 'Authorization Error',
        description: 'User not authenticated. Please log in again.',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dataModel = {
        location: eventLocation.trim(),
        name: (eventName || selectedEvents[0]?.title || "").trim(),
        description: (eventDescription || selectedEvents[0]?.description || "").trim(),
        start_at: date,
        time: selectedStartTime,
        created_by: me._id,
        events: assignments.map(assignment => renameKey(assignment, "name", "type")),
        hijri_date: {
          year: currentIslamicYear,
          month: currentIslamicMonthIndex,
          day: selectedDay
        }
      };

      const result = await create(dataModel);

      if (result?.success) {
        Toast.show({
          title: 'Success',
          description: 'Party assigned successfully!',
          variant: 'success',
        });
        resetForm();
        AssignPartyRef.current?.close();
      } else {
        throw new Error(result?.error || 'Failed to assign party');
      }

    } catch (error) {
      console.error("Party assignment error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        title: 'Assignment Error',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAssignPartyForm, eventLocation, eventName, selectedEvents, eventDescription, date, selectedStartTime, me, assignments, currentIslamicYear, currentIslamicMonthIndex, selectedDay, create, resetForm, isSubmitting]);

  const handleDateConfirm = useCallback((selectedDate: Date) => {
    try {
      setShowDatePicker(false);
      if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
        const formatted = format(selectedDate, 'MMM dd, yyyy');
        setDate(formatted);
      } else {
        throw new Error('Invalid date selected');
      }
    } catch (error) {
      console.error('Error confirming date:', error);
      Toast.show({
        title: 'Date Error',
        description: 'Failed to set date',
        variant: 'error',
      });
    }
  }, []);

  const handleDateCancel = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const handleStartTimeChange = useCallback((_: any, time?: Date) => {
    try {
      setShowStartPicker(false);
      if (time && time instanceof Date && !isNaN(time.getTime())) {
        setSelectedStartTime(time);
      }
    } catch (error) {
      console.error('Error setting start time:', error);
      Toast.show({
        title: 'Time Error',
        description: 'Failed to set time',
        variant: 'error',
      });
    }
  }, []);

  const handleDayPress = useCallback((dateString: string, islamicDay: number) => {
    try {
      if (!dateString || typeof islamicDay !== 'number' || islamicDay < 1 || islamicDay > 31) {
        throw new Error('Invalid date parameters');
      }

      const events = getEventsForDate(currentIslamicMonthIndex, islamicDay);
      
      setSelectedDateString(dateString);
      setDate(dateString);
      setSelectedEvents(events || []);
      setSelectedDay(islamicDay);
      
      if (!events || events.length === 0) {
        createEventModalRef.current?.open();
      } else {
        modalRef.current?.open();
      }
    } catch (error) {
      console.error('Error handling day press:', error);
      Toast.show({
        title: 'Calendar Error',
        description: 'Failed to select date',
        variant: 'error',
      });
    }
  }, [getEventsForDate, currentIslamicMonthIndex]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchOccasions();
      setNetworkError(null);
    } catch (error) {
      console.error('Error refreshing:', error);
      setNetworkError('Failed to refresh. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchOccasions]);

  // Memoized day rendering for better performance with error handling
  const renderDays = useMemo(() => {
    const days: JSX.Element[] = [];

    try {
      // Add blank cells for days before the start of the month
      for (let i = 0; i < startDay; i++) {
        days.push(<View key={`blank-${i}`} style={[styles.dayCell, { backgroundColor: 'transparent' }]} />);
      }

      // Add actual days
      for (let i = 0; i < totalDays; i++) {
        try {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const islamicDate = getIslamicDate(date);
          
          if (!islamicDate) continue;

          const dateString = date.toDateString();
          const isToday = dateString === today.toDateString();
          const isSelected = dateString === selectedDateString;
          const events = getEventsForDate(currentIslamicMonthIndex, islamicDate.day);
          const highestPriority = events.length > 0 ? Math.min(...events.map(event => event.priority || 4), 4) : 4;

          days.push(
            <TouchableOpacity
              key={`day-${i}`}
              style={[
                styles.dayCell,
                isToday && styles.today,
                isSelected && styles.selected,
                { minHeight: responsive.gridGap * 8 }
              ]}
              onPress={() => handleDayPress(dateString, islamicDate.day)}
              accessibilityLabel={`${islamicDate.day} ${islamicMonths[currentIslamicMonthIndex]} ${currentIslamicYear}, ${date.getDate()} ${months[date.getMonth()]}`}
              accessibilityHint={events.length > 0 ? `${events.length} events` : "No events, tap to create"}
              disabled={hasError}
            >
              <Typography
                variant="b3"
                style={[
                  {
                    color: highestPriority === 1
                      ? getColor("red", 400)
                      : highestPriority === 2 || highestPriority === 3
                        ? getColor("blue", 400)
                        : getColor("dark", 700),
                    // fontSize: responsive.dayFontSize,
                  },
                ]}
                numberOfLines={1}
              >
                {toArabicNumerals(islamicDate.day)}
              </Typography>
              <Typography 
                variant="b5" 
                style={{ 
                  color: getColor("dark", 700), 
                  fontSize: responsive.dayFontSize - 2 
                }}
                numberOfLines={1}
              >
                {date.getDate()} {months[date.getMonth()].slice(0, 3)}
              </Typography>
            </TouchableOpacity>
          );
        } catch (dayError) {
          console.error(`Error rendering day ${i}:`, dayError);
          // Continue rendering other days
        }
      }
    } catch (error) {
      console.error('Error rendering days:', error);
      setHasError(true);
      setErrorMessage('Failed to render calendar days');
    }

    return days;
  }, [startDay, totalDays, startDate, today, selectedDateString, getEventsForDate, currentIslamicMonthIndex, handleDayPress, currentIslamicYear, responsive, hasError]);

  // Error boundary
  if (hasError) {
    return (
      <View style={[styles.pageContainer, styles.centered]}>
        <Typography variant="h6" color={getColor("red", 400)}>
          {errorMessage || 'Something went wrong'}
        </Typography>
        <Button 
          onPress={() => {
            setHasError(false);
            setErrorMessage('');
          }} 
          variant="outline" 
          style={{ marginTop: 16 }}
        >
          Try Again
        </Button>
      </View>
    );
  }

  // Loading state
  if (isLoadingOccassion && !pendingOccassions) {
    return (
      <View style={[styles.pageContainer, styles.centered]}>
        <ActivityIndicator size="large" color={getColor("blue", 400)} />
        <Typography variant="h6" style={{ marginTop: 16 }}>Loading Calendar...</Typography>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={[styles.pageContainer, { padding: responsive.padding }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[getColor("blue", 400)]}
            tintColor={getColor("blue", 400)}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Network Error Banner */}
        {networkError && (
          <View>
            <Typography variant="b4" color={getColor("red", 600)}>
              {networkError}
            </Typography>
            <TouchableOpacity onPress={handleRefresh}>
              <Typography variant="b4" color={getColor("blue", 600)}>
                Retry
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View style={[styles.header, { marginBottom: responsive.headerSpacing }]}>
          <TouchableOpacity
            style={[styles.headerItem2, { minWidth: responsive.headerButtonMinWidth }]}
            onPress={() => setShowDatePicker(true)}
            accessibilityLabel="Go to specific date"
            disabled={hasError}
          >
            <Typography variant="b4" color={getColor("light", 100)} numberOfLines={1}>
              Go to Date
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerItem2, { minWidth: responsive.headerButtonMinWidth }]}
            onPress={goToToday}
            accessibilityLabel="Go to today"
            disabled={hasError}
          >
            <Typography variant="b4" color={getColor("light", 100)} numberOfLines={1}>
              Today
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Islamic Month Navigation */}
        <View style={styles.islamicMonthName}>
          <Pressable
            onPress={() => changeIslamicMonth(-1)}
            accessibilityLabel="Previous month"
            disabled={hasError}
          >
            <BackIcon size={16} color={getColor("dark", 700)} />
          </Pressable>
          <Typography 
            variant="h5" 
            style={[styles.textAlignCenter, { fontSize: DEVICE_WIDTH < 360 ? 16 : 18 }]}
            numberOfLines={1}
          >
            {islamicMonths[currentIslamicMonthIndex]} {currentIslamicYear}
          </Typography>
          <Pressable
            onPress={() => changeIslamicMonth(1)}
            style={ { transform: [{ rotate: "180deg" }] }}
            accessibilityLabel="Next month"
            disabled={hasError}
          >
            <BackIcon size={16} color={getColor("dark", 700)} />
          </Pressable>
        </View>

        <View style={[styles.calendar, { height: responsive.calendarHeight }]}>
          {/* Days of Week */}
          <View style={styles.daysOfWeek}>
            {daysOfWeek.map((day, idx) => (
              <Typography
                variant="b4"
                key={idx}
                color={getColor("dark", 700)}
                style={[styles.dayLabel, { fontSize: responsive.dayFontSize }]}
                numberOfLines={1}
              >
                {day}
              </Typography>
            ))}
          </View>
          
          {/* Calendar Grid */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View style={styles.grid}>
              {renderDays}
            </View>
          </ScrollView>
        </View>

        {/* Loading Indicator for Create Occasion */}
        {isCreatingOccasion && (
          <View>
            <ActivityIndicator size="small" color={getColor("blue", 400)} />
            <Typography variant="b4" style={{ marginLeft: 8 }}>
              Creating occasion...
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* Event Details Modal */}
      <BottomSheetModal
        title={`Events for ${selectedDateString}`}
        ref={modalRef}
        onPress={() => createEventModalRef.current?.open()}
        footer="Assign Party"
        disabled={isSubmitting}
      >
        <ScrollView 
          style={{ maxHeight: responsive.modalMaxHeight * 0.6 }}
          showsVerticalScrollIndicator={false}
        >
          {selectedEvents.map((event, index) => (
            <View key={`event-${index}`} style={styles.eventCard}>
              <CircleIcon />
              <View style={[styles.VStack, { flex: 1, minWidth: 0 }]}>
                <Typography 
                  variant="b4" 
                  style={{ color: getColor('dark', 700) }}
                  numberOfLines={2}
                >
                  {event.title} - {event.description || 'No description'}
                </Typography>
                {event.location && (
                  <Typography 
                    variant="b5" 
                    style={{ color: getColor('dark', 500) }}
                    numberOfLines={1}
                  >
                    📍 {event.location}
                  </Typography>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </BottomSheetModal>

      {/* Create Event Modal */}
      <BottomSheetModal
        title={`Create Event for ${selectedDateString}`}
        ref={createEventModalRef}
        footer={isSubmitting ? "Creating..." : "Create Event"}
        onPress={handleSubmit}
        disabled={isSubmitting || hasError}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: responsive.modalMaxHeight * 0.8 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 16, paddingBottom: 20 }}>
            {/* General Error */}
            {validationErrors.general && (
              <View>
                <Typography variant="b5" color={getColor("red", 400)}>
                  {validationErrors.general}
                </Typography>
              </View>
            )}

            <Input
              placeholder='Enter event name'
              value={eventName}
              onChangeText={setEventName}
              error={validationErrors.eventName}
              maxLength={100}
              editable={!isSubmitting}
            >
              Event Name *
            </Input>

            <Input
              placeholder='Enter event description'
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={3}
              error={validationErrors.eventDescription}
              maxLength={500}
              editable={!isSubmitting}
            >
              Event Description *
            </Input>

            <View style={[styles.HStack, { justifyContent: "space-between", alignItems: "center" }]}>
              <Typography variant="h5">Assign Kalams *</Typography>
              <Button
                variant="outline"
                size="sm"
                onPress={handleAddAssignment}
                disabled={assignments.length >= 10 || isSubmitting}
              >
                Add ({assignments.length}/10)
              </Button>
            </View>

            {validationErrors.assignments && (
              <Typography variant="b5" color={getColor("red", 400)}>
                {validationErrors.assignments}
              </Typography>
            )}

            {assignments.map((item, index) => (
              <View key={`assignment-${index}`} style={[styles.HStack, { alignItems: 'flex-start' }]}>
                <Select
                  options={KALAM_OPTIONS || []}
                  style={{ flex: 0.8 }}
                  value={item.name}
                  onSelect={(val) => handleAssignmentChange(index, "name", val)}
                  placeholder="Select Kalam"
                  disabled={isSubmitting}
                />
                <Select
                  style={{ flex: 1 }}
                  options={groupOptions}
                  value={item.party}
                  onSelect={(val) => handleAssignmentChange(index, "party", val)}
                  placeholder="Assign Party"
                  disabled={isSubmitting}
                />
                {assignments.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => handleRemoveAssignment(index)}
                    // style={styles.removeButton}
                    disabled={isSubmitting}
                  >
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <Input
              placeholder='Select start time'
              mask="time"
              value={selectedStartTime ? dayjs(selectedStartTime).format("hh:mm A") : ""}
              onFocus={() => setShowStartPicker(true)}
              onPress={() => setShowStartPicker(true)}
              showSoftInputOnFocus={false}
              error={validationErrors.selectedStartTime}
              editable={!isSubmitting}
            >
              Event Start Time *
            </Input>

            <Input
              placeholder='Enter event location'
              value={eventLocation}
              onChangeText={setEventLocation}
              error={validationErrors.eventLocation}
              maxLength={200}
              editable={!isSubmitting}
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
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  pageContainer: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: getColor("light", 50),
  },
  calendar: {
    backgroundColor: getColor("light", 100),
    paddingVertical: 12,
    overflow: 'hidden',
    borderRadius: 12,
    gap: 8,
    flexDirection: 'column',
    shadowColor: getColor("dark", 400), 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3, 
    elevation: 2,
    height: '60%'
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
    // marginBottom: 20,
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