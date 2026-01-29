import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach Portal</Text>
      <Text style={styles.subtitle}>Welcome to the Hybrid Base Coach Portal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F5FAFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8D9299",
  },
});
