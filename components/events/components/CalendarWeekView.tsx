// components/CalendarWeekView.tsx
import React from 'react';
import WeekView from 'react-native-week-view';
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
        console.log("grid click")
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

  return (
    <WeekView
      events={events.map(evt => ({
        id: evt.id,
        description: evt.title,
        startDate: evt.startDate,
        endDate: evt.endDate,
        
        color: evt.gender === 'Male' ? '#2196F3' : evt.gender === 'Female' ? '#E91E63' : '#9E9E9E'
      }))}
      selectedDate={new Date()}
      numberOfDays={7}
      onGridClick={handleGridClick}
      onEventPress={handleEventPress}
    />
  );
};

export default CalendarWeekView;
