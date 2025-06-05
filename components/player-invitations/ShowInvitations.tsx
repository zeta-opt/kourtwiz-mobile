import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { RootState } from '@/store';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

const ShowInvitations = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: invites,
    status,
    refetch,
  } = useGetInvitations({ userId: user?.userId });
  console.log('invites : ', invites);
  return <Text>Showing all the invitations</Text>;
};

export default ShowInvitations;
