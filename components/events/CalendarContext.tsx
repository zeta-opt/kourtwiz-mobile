// context/CalendarContext.tsx
import React, { createContext, useContext, useState } from 'react';

export type CalendarEvent = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  courts: string[];
  gender: 'Male' | 'Female' | 'Any';
  skillLevel: number;
  maxPlayers: number;
  participants: string[];
  recurrence: string | null;
};

interface CalendarContextType {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedRole: 'admin' | 'player';
  setSelectedRole: React.Dispatch<React.SetStateAction<'admin' | 'player'>>;
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRole, setSelectedRole] = useState<'admin' | 'player'>('admin');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <CalendarContext.Provider
      value={{
        events,
        setEvents,
        selectedDate,
        setSelectedDate,
        selectedRole,
        setSelectedRole,
        selectedEvent,
        setSelectedEvent,
        openModal,
        setOpenModal,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (!context) throw new Error('useCalendarContext must be used within a CalendarProvider');
  return context;
};
