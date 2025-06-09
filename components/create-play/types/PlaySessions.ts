export type PlaySession = {
    id: string;
    courtName?: string;
    courtId: string;
    playTypeName: string;
    startTime: string;
    durationMinutes: number;
    priceForPlay: number;
    skillLevel: string;
    maxPlayers: number;
    registeredPlayers?: any[];
    eventRepeatType?: string;
    repeatEndDate?: string;
    repeatInterval?: number;
    repeatOnDays?: string[];
    coachId?: string;
  };
  
  export type Court = {
    id: string;
    name: string;
  };
  
  export type Coach = {
    id: string;
    name: string;
    email?: string;
  };
  
  export type InvitedPlayer = {
    userId: string;
    userEmail: string;
    inviteExpiry: number[];
    status: string;
  };