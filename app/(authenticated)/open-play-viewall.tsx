import OpenPlayCard from "@/components/home-page/openPlayCard"
import TopBarWithChips from '@/components/home-page/topBarWithChips';
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View, } from "react-native";
const OpenPlay = ()=>{
    return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
      <TopBarWithChips active="open" />
      <View style = {styles.con}>
      <OpenPlayCard cardStyle={styles.card}/>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    paddingTop: 12,
    // backgroundColor: '#FFFFFF',
    padding:8,
  },
  card: {
  backgroundColor: "#FFF",
  borderRadius: 15,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#D0D7DD',
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
},
con :{
    padding: 12,
}

  
});
export default OpenPlay;