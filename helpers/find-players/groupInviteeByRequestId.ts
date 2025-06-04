type GroupedInviteInfo = {
  date: string;
  skillRating: number;
  requestId: string;
  placeToPlay: string;
  pending: number;
  accepted: number;
  Requests: any[];
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
        const dateStr =
          Array.isArray(playTime) && playTime.length >= 5
            ? new Date(
                playTime[0],
                playTime[1] - 1, // Month is 0-based
                playTime[2],
                playTime[3],
                playTime[4]
              ).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })
            : '';

        acc[requestId] = {
          date: dateStr,
          skillRating,
          requestId: requestId,
          placeToPlay,
          pending: 0,
          accepted: 0,
          Requests: [],
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
