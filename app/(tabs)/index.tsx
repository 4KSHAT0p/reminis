import { Text, View } from "react-native";
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import { Button } from "react-native-paper";


export default function Index() {
  //set up a listener
  getAuth().onAuthStateChanged((user)=>{
    if(!user) router.replace("/login")
  });
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Home</Text>
      <Button mode="contained" onPress={() => auth.signOut()}>
        Sign Out
      </Button>
    </View>
  );
}
