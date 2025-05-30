import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { router } from "expo-router";
import { Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

//login screen
import { Ionicons } from "@expo/vector-icons";
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setisSignUp] = useState(false);
  const handleAuth = async () => {
    if (!email || !password) {
      alert("Email and password cannot be empty");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const user = isSignUp
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      if (user) router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      alert(`${isSignUp ? "Sign up" : "Sign in"} failed: ` + error.message);
    }
  };
  const handleSwitchmode = () => {
    setisSignUp((prev) => !prev);
  };
  // const [email, setemail] = useState<string>("");
  // const [password, setpassword] = useState<string>("");
  // const [error, seterror] = useState<string | null>("");

  // return (
  //   <KeyboardAvoidingView
  //     behavior={Platform.OS === "ios" ? "padding" : "height"}
  //   >
  //     <View>
  //       <Text>{isSignUp ? "Create Account" : "Welcome Back"}</Text>
  //       <TextInput
  //         label="Email"
  //         autoCapitalize="none"
  //         placeholder="hello@gmail.com"
  //         keyboardType="email-address"
  //         mode="outlined"
  //         onChangeText={setemail}
  //       />
  //       <TextInput
  //         label="Password"
  //         autoCapitalize="none"
  //         keyboardType="email-address"
  //         mode="outlined"
  //         onChangeText={setpassword}
  //       />
  //       {error && <Text>{error}</Text>}
  // <Button mode="contained" onPress={handleLogin}>
  //   {isSignUp ? "Sign Up" : "Sign In"}
  // </Button>
  // <Button mode="text" onPress={handleSwitchmode}>
  //   {isSignUp
  //     ? "Already Have an account? sign in"
  //     : "Don't have an account? sign up"}
  // </Button>
  //     </View>
  //   </KeyboardAvoidingView>
  // );
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.form}>
          <Text>{isSignUp ? "Create Account" : "Welcome Back"}</Text>
          <TextInput
            placeholder="email"
            style={styles.input}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              autoCapitalize="none"
              style={[styles.input, { flex: 1 }]}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <Button mode="contained" onPress={handleAuth}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <Button mode="text" onPress={handleSwitchmode}>
            {isSignUp
              ? "Already Have an account? sign in"
              : "Don't have an account? sign up"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 16,
    marginTop: 80,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 16,
    height: 40,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  toggle: {
    marginLeft: 10,
    color: "blue",
    fontWeight: "bold",
  },
});
// const styles=StyleSheet.create({
//   container:{
//     flex:1,
//     backgroundColor:"#f5f5"
//   }
// })
