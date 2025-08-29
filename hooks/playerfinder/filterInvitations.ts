import { useMemo } from 'react';
import {GroupedInviteInfo} from '@/helpers/find-players/groupInviteeByRequestId';

export const useFilteredAndSortedInvites = (
  filterStatus: string,
  groupedInvites: Record<string, GroupedInviteInfo>,
  isAscendingSort: boolean
) => {
  const filteredAndSortedInvites = useMemo(() => {
    let filtered: Record<string, GroupedInviteInfo>;

    if (filterStatus === 'FULFILLED') {
      filtered = Object.fromEntries(
        Object.entries(groupedInvites).filter(
          ([, invite]) => invite.pending === 0
        )
      );
    } else if (filterStatus === 'UNFULFILLED') {
      filtered = Object.fromEntries(
        Object.entries(groupedInvites).filter(
          ([, invite]) => invite.pending > 0
        )
      );
    } else {
      filtered = groupedInvites;
    }

    // Sort based on dateTimeMs
    const sorted = Object.entries(filtered).sort(([, a], [, b]) => {
      return isAscendingSort
        ? a.dateTimeMs - b.dateTimeMs
        : b.dateTimeMs - a.dateTimeMs;
    });

    return Object.fromEntries(sorted);
  }, [filterStatus, groupedInvites, isAscendingSort]);

  return filteredAndSortedInvites;
};
