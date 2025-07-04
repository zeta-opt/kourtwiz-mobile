import React from 'react';
import { Calendar } from 'react-native-big-calendar';
import { useCalendarContext } from '../CalendarContext';

const CalendarWeekView = () => {
  const {
    events,
    setSelectedDate,
    setSelectedEvent,
    setOpenModal,
    selectedRole,
  } = useCalendarContext();

  const handleGridClick = (datetime: Date) => {
    if (selectedRole === 'admin') {
      setSelectedEvent(null);
      setSelectedDate(datetime);
      setOpenModal(true);
    }
  };

  const handleEventPress = (event: any) => {
    if (selectedRole === 'admin') {
      setSelectedEvent(event);
      setOpenModal(true);
    }
  };

  const transformedEvents = events.map((evt) => ({
    title: evt.title,
    start: new Date(evt.startDate),
    end: new Date(evt.endDate),
    color:
      evt.gender === 'Male'
        ? '#2196F3'
        : evt.gender === 'Female'
        ? '#E91E63'
        : '#9E9E9E',
  }));

  return (
    <Calendar
      events={transformedEvents}
      mode='week'
      height={600}
      onPressCell={handleGridClick}
      onPressEvent={handleEventPress}
    />
  );
};

export default CalendarWeekView;
