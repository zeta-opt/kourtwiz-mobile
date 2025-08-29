export type GroupedInviteInfo = {
  date: string;
  dateTimeMs: number;
  skillRating: number;
  requestId: string;
  placeToPlay: string;
  pending: number;
  accepted: number;
  Requests: any[];
  playersNeeded: number;
  eventName: string;
};

export function groupInviteeByRequestId(
  invites: any[] | null | undefined
): Record<string, GroupedInviteInfo> {
  if (!Array.isArray(invites)) {
    return {};
  }

  return invites.reduce(
    (acc: Record<string, GroupedInviteInfo>, invite: any) => {
      const { requestId, skillRating, placeToPlay, playTime, status } = invite;

      if (!acc[requestId]) {
        let dateStr = '';
        let dateTimeInMilliseconds = 0; // Initialize for the new key

        if (Array.isArray(playTime) && playTime.length >= 5) {
          const dateObject = new Date(
            playTime[0],
            playTime[1] - 1, // Month is 0-based
            playTime[2],
            playTime[3],
            playTime[4]
          );
          dateStr = dateObject.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
          dateTimeInMilliseconds = dateObject.getTime(); // Get timestamp in milliseconds
        }

        acc[requestId] = {
          date: dateStr,
          dateTimeMs: dateTimeInMilliseconds, // Assign the new key
          skillRating,
          requestId: requestId,
          placeToPlay,
          pending: 0,
          accepted: 0,
          Requests: [],
          playersNeeded: invite.playersNeeded,
          eventName: invite.eventName,
        };
      }

      // Count statuses
      if (status === 'PENDING') {
        acc[requestId].pending += 1;
      } else if (status === 'ACCEPTED') {
        acc[requestId].accepted += 1;
      }

      acc[requestId].Requests.push(invite);

      return acc;
    },
    {}
  );
}
