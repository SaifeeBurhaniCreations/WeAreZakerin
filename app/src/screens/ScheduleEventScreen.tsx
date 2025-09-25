import React, { useRef, useMemo, useCallback, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
} from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getColor } from "../constants/colors";
import Typography from "../components/typography/Typography";
import Button from "../components/ui/Button";
import Overlay from "../components/ui/Overlay";
import TimePicker from "../components/ui/TimePicker";
import { useCreateOccasion, usePendingOccasions } from "../hooks/useOccassion";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { format } from 'date-fns';
import { Toast } from "../utils/Toast";
import { AddDataModalRef, miqaatProps } from "../types";
import { normalizeEvents } from "../utils/eventUtils";
import { initialIslamicEvents } from "../constants/event";
import { useCalendarState } from "../hooks/useCalendarState";
import { useEventForm } from "../hooks/useEventForm";
import MonthNavigation from "../components/ui/ScheduleEvent/MonthNavigation";
import CalendarGrid from "../components/ui/ScheduleEvent/CalendarGrid";
import EventDetailsModal from "../components/ui/ScheduleEvent/EventDetailsModal";
import CreateEventModal from "../components/ui/ScheduleEvent/CreateEventModal";
import CalendarHeader from "../components/ui/ScheduleEvent/CalendarHeader";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

const getResponsiveValues = () => {
  const isSmallScreen = DEVICE_WIDTH < 360;
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
  const responsive = useMemo(() => getResponsiveValues(), []);

  // Refs
  const modalRef = useRef<AddDataModalRef>(null);
  const createEventModalRef = useRef<AddDataModalRef>(null);

  // Custom hooks
  const calendarState = useCalendarState();
  const eventForm = useEventForm();

  // Redux selectors
  const { create, isLoading: isCreatingOccasion } = useCreateOccasion();
  const { me } = useSelector((state: RootState) => state.users);
  const { 
    data: pendingOccassions, 
    isLoading: isLoadingOccassion, 
    error: occasionError,
    refetch: refetchOccasions 
  } = usePendingOccasions('pending');

  // Local state
  const [selectedEvents, setSelectedEvents] = useState<miqaatProps[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [islamicEvents, setIslamicEvents] = useState(() => {
    try {
      return normalizeEvents(initialIslamicEvents);
    } catch (error) {
      console.error('Error normalizing events:', error);
      return [];
    }
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Event handlers
  const getEventsForDate = useCallback((monthIndex: number, day: number): miqaatProps[] => {
    try {
      if (!islamicEvents || !Array.isArray(islamicEvents)) return [];
      return islamicEvents.find(event => event.month === monthIndex && event.date === day)?.miqaats || [];
    } catch (error) {
      console.error('Error getting events for date:', error);
      return [];
    }
  }, [islamicEvents]);

  const handleDayPress = useCallback((dateString: string, islamicDay: number) => {
    try {
      if (!dateString || typeof islamicDay !== 'number' || islamicDay < 1 || islamicDay > 31) {
        throw new Error('Invalid date parameters');
      }

      const events = getEventsForDate(calendarState.currentIslamicMonthIndex, islamicDay);
      
      calendarState.setSelectedDateString(dateString);
      eventForm.setDate(dateString);
      setSelectedEvents(events || []);
      calendarState.setSelectedDay(islamicDay);
      
      if (!events || events.length === 0) {
        createEventModalRef.current?.open();
        eventForm.setIsInstant(false);
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
  }, [getEventsForDate, calendarState, eventForm]);

  const handleDateConfirm = useCallback((selectedDate: Date) => {
    try {
      setShowDatePicker(false);
      if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
        const formatted = format(selectedDate, 'MMM dd, yyyy');
        eventForm.setDate(formatted);
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
  }, [eventForm]);

  const handleStartTimeChange = useCallback((_: any, time?: Date) => {
    try {
      setShowStartPicker(false);
      if (time && time instanceof Date && !isNaN(time.getTime())) {
        eventForm.setSelectedStartTime(time);
      }
    } catch (error) {
      console.error('Error setting start time:', error);
      Toast.show({
        title: 'Time Error',
        description: 'Failed to set time',
        variant: 'error',
      });
    }
  }, [eventForm]);

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

  const handleSubmit = useCallback(async () => {
    if (eventForm.isSubmitting) return;

    const errors = eventForm.validateEventForm();

    if (Object.keys(errors).length > 0) {
      eventForm.setValidationErrors(errors);
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

    eventForm.setIsSubmitting(true);

    try {
      const dataModel = {
        location: eventForm.eventLocation.trim(),
        name: (eventForm.eventName || selectedEvents[0]?.title || "").trim(),
        description: (eventForm.eventDescription || selectedEvents[0]?.description || "").trim(),
        start_at: eventForm.date,
        time: eventForm.selectedStartTime,
        created_by: me._id,
        events: eventForm.assignments,
        hijri_date: {
          year: calendarState.currentIslamicYear,
          month: calendarState.currentIslamicMonthIndex,
          day: calendarState.selectedDay
        }
      };

      const result = await create(dataModel);

      if (result?.success) {
        Toast.show({
          title: 'Success',
          description: 'Event created successfully!',
          variant: 'success',
        });
        eventForm.resetForm();
        createEventModalRef.current?.close();
      } else {
        throw new Error(result?.error || 'Failed to create event');
      }

    } catch (error) {
      console.error("Event creation error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        title: 'Creation Error',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      eventForm.setIsSubmitting(false);
    }
  }, [eventForm, selectedEvents, me, calendarState, create]);

  // Effects
  useEffect(() => {
    if (occasionError) {
      setNetworkError('Failed to load occasions. Please check your connection.');
      console.error('Occasion error:', occasionError);
    } else {
      setNetworkError(null);
    }
  }, [occasionError]);

  // Error boundary
  if (calendarState.hasError) {
    return (
      <View style={[styles.pageContainer, styles.centered]}>
        <Typography variant="h6" color={getColor("red", 400)}>
          {calendarState.errorMessage || 'Something went wrong'}
        </Typography>
        <Button 
          onPress={() => calendarState.setError(false)} 
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
          <View style={styles.errorBanner}>
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

        {/* Calendar Header */}
        <CalendarHeader
          onGoToDate={() => setShowDatePicker(true)}
          onGoToToday={calendarState.goToToday}
          responsive={responsive}
          disabled={calendarState.hasError}
        />

        {/* Month Navigation */}
        <MonthNavigation
          currentMonth={calendarState.currentIslamicMonthIndex}
          currentYear={calendarState.currentIslamicYear}
          onPreviousMonth={() => calendarState.changeIslamicMonth(-1)}
          onNextMonth={() => calendarState.changeIslamicMonth(1)}
          disabled={calendarState.hasError}
        />

        {/* Calendar Grid */}
        <CalendarGrid
          startDay={calendarState.startDay}
          totalDays={calendarState.totalDays}
          startDate={calendarState.startDate}
          today={calendarState.today}
          selectedDateString={calendarState.selectedDateString}
          currentIslamicMonthIndex={calendarState.currentIslamicMonthIndex}
          getEventsForDate={getEventsForDate}
          onDayPress={handleDayPress}
          responsive={responsive}
          disabled={calendarState.hasError}
        />

        {/* Action Buttons */}
        <View style={[styles.buttonContainer, { marginTop: 12, justifyContent: 'space-between' }]}>
          <Button 
            onPress={() => {
              createEventModalRef.current?.open(); 
              eventForm.setIsInstant(true);
            }} 
            variant="fill" 
            size="md"
          >
            Instant Miqaat
          </Button>
          <Button variant="fill" size="md">Bulk Miqaat</Button>
        </View>

        {/* Loading Indicator */}
        {isCreatingOccasion && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={getColor("blue", 400)} />
            <Typography variant="b4" style={{ marginLeft: 8 }}>
              Creating occasion...
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* Event Details Modal */}
      <EventDetailsModal
        ref={modalRef}
        title={`Events for ${calendarState.selectedDateString}`}
        events={selectedEvents}
        onAssignParty={() => {
          createEventModalRef.current?.open(); 
          eventForm.setIsInstant(false);
        }}
        isSubmitting={eventForm.isSubmitting}
        maxHeight={responsive.modalMaxHeight}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        ref={createEventModalRef}
        title={`Create Event for ${calendarState.selectedDateString}`}
        eventForm={eventForm}
        onSubmit={handleSubmit}
        responsive={responsive}
        calendarState={calendarState}
        onShowDatePicker={() => setShowDatePicker(true)}
        onShowTimePicker={() => setShowStartPicker(true)}
      />

      {/* Overlay */}
      <Overlay />

      {/* Time Picker */}
      {showStartPicker && (
        <TimePicker
          selectedTime={eventForm.selectedStartTime}
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
          onCancel={() => setShowDatePicker(false)}
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
    backgroundColor: getColor("light", 50),
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: getColor("red", 50),
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});

export default Calendar;