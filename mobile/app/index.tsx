import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, ScrollView, StatusBar, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "./context/auth";
import HomeHeader from "@/components/home/HomeHeader";
import CalendarView from "@/components/home/CalendarView";
import StatsRow from "@/components/home/StatsRow";
import DailyPromptCard from "@/components/home/DailyPromptCard";
import BottomNavBar from "@/components/home/BottomNavBar";
import EntrySelectionOverlay from "@/components/home/EntrySelectionOverlay";

export default function Index() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/welcome");
    }
  }, [isLoggedIn, loading, router]);

  const changeMonth = (increment: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <HomeHeader currentDate={currentDate} />
        <CalendarView currentDate={currentDate} onChangeMonth={changeMonth} />
        <StatsRow />
        <DailyPromptCard />
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsSelectionMode(true)}
        activeOpacity={0.8}
      >
        <Icon name="plus" size={32} color="#FFF" />
      </TouchableOpacity>
      <BottomNavBar />

      {isSelectionMode && (
        <EntrySelectionOverlay onClose={() => setIsSelectionMode(false)} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100, // Above bottom nav (80 height + 20 padding)
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#C88A70', // Terracotta
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C88A70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  }
});
