export type Invite = {
    playTime: [number, number, number, number?, number?]
    placeToPlay: string;
    [key: string]: any;
  };
  
  export const filterInvitations = (
    invites: Invite[],
    selectedDate: Date | null,
    selectedTime: Date | null,
    selectedLocation: string | null
  ): Invite[] => {
    return invites.filter((invite) => {
      let matches = true;
  
      if (selectedDate) {
        const inviteDate = new Date(invite.playTime[0], invite.playTime[1] - 1, invite.playTime[2]);
        matches &&= inviteDate.toDateString() === selectedDate.toDateString();
      }
  
      if (selectedTime) {
        const inviteTime = new Date(
          invite.playTime[0],
          invite.playTime[1] - 1,
          invite.playTime[2],
          invite.playTime[3],
          invite.playTime[4]
        );
  
        matches &&=
          inviteTime.getHours() === selectedTime.getHours() &&
          inviteTime.getMinutes() === selectedTime.getMinutes();
      }
  
      if (selectedLocation) {
        matches &&= invite.placeToPlay === selectedLocation;
      }
  
      return matches;
    });
  };
  
  export const clearAllFilters = (setters: {
    setSelectedDate: (d: Date | null) => void;
    setSelectedTime: (t: Date | null) => void;
    setSelectedLocation: (l: string | null) => void;
  }) => {
    const { setSelectedDate, setSelectedTime, setSelectedLocation } = setters;
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedLocation(null);
  };
  