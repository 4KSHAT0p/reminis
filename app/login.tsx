import { KeyboardAvoidingView, Platform, View,Text } from "react-native";

//login screen
export default function LoginScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View>
        <Text>
            Create Account
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
