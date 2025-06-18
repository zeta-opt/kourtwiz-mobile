import React from "react";
import { ScrollView, StyleSheet} from "react-native";
import { Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetWaitlist  } from "@/hooks/apis/bookings/useGetWaitlist";
import WaitlistCard from "@/components/waitlist/WaitlistCard";
import LoaderScreen from "@/shared/components/Loader/LoaderScreen";

const WaitlistPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.userId ?? "";

  const { data: waitlistData, status, refetch } = useGetWaitlist(userId);

  if (status === "loading") return <LoaderScreen />;
  if (status === "error") return <Text>Error loading waitlist.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>
        My Waitlist
      </Text>

      {waitlistData && waitlistData.length > 0 ? (
          waitlistData.map((item, index) => (
            <WaitlistCard 
            key={index} {...item} 
            refetch={refetch}
            />
          ))
        ) : (
          <Text style={styles.noData}>No waitlist entries found.</Text>
        )}
    </ScrollView>
  );
};

export default WaitlistPage;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    marginBottom: 16,
    fontWeight: "bold",
  },
  noData: {
    marginTop: 20,
    fontStyle: "italic",
  },
});
