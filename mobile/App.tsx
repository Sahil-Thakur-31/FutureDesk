import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AuthScreen } from "./src/components/AuthScreen";
import { DashboardScreen } from "./src/components/DashboardScreen";
import { EntityScreen } from "./src/components/EntityScreen";
import { useBootstrap } from "./src/hooks/useBootstrap";
import { useMobileStore } from "./src/store/mobileStore";

const Tabs = createBottomTabNavigator();

function AppTabs() {
  useBootstrap();
  const user = useMobileStore((state) => state.user);
  const notifications = useMobileStore((state) => state.notifications);
  const exams = useMobileStore((state) => state.exams);
  const applications = useMobileStore((state) => state.applications);
  const certificates = useMobileStore((state) => state.certificates);
  const tasks = useMobileStore((state) => state.tasks);
  const logout = useMobileStore((state) => state.logout);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notificationsMode, setNotificationsMode] = useState<"latest" | "all">("latest");
  const [profileVisible, setProfileVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const closeAll = () => {
    setCalendarVisible(false);
    setNotificationsVisible(false);
    setProfileVisible(false);
    setSettingsVisible(false);
    setNotificationsMode("latest");
  };

  const scheduleItems = useMemo(() => {
    const items: Array<{ id: string; title: string; subtitle?: string; date: string; type: string }> = [];

    exams.forEach((exam) => {
      if (exam.examDate) {
        items.push({
          id: exam.id,
          title: exam.examName,
          subtitle: exam.organization,
          date: exam.examDate,
          type: "Exam"
        });
      }
      if (exam.applicationDeadline) {
        items.push({
          id: `${exam.id}-deadline`,
          title: `${exam.examName} deadline`,
          subtitle: exam.organization,
          date: exam.applicationDeadline,
          type: "Exam"
        });
      }
    });

    applications.forEach((application) => {
      const date = application.nextActionDate ?? application.applicationDate;
      if (date) {
        items.push({
          id: application.id,
          title: `${application.company} - ${application.role}`,
          subtitle: application.nextAction ?? application.currentStage,
          date,
          type: "Job"
        });
      }
    });

    certificates.forEach((certificate) => {
      const date = certificate.expiryDate ?? certificate.issueDate;
      if (date) {
        items.push({
          id: certificate.id,
          title: certificate.title,
          subtitle: certificate.issuer ?? certificate.category,
          date,
          type: "Certificate"
        });
      }
    });

    tasks.forEach((task) => {
      const date = task.deadline ?? task.startDate;
      if (date) {
        items.push({
          id: task.id,
          title: task.title,
          subtitle: task.focusArea ?? task.description,
          date,
          type: "Task"
        });
      }
    });

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [applications, certificates, exams, tasks]);

  const latestNotifications = useMemo(() => {
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
    );
    return notificationsMode === "all" ? sorted : sorted.slice(0, 10);
  }, [notifications, notificationsMode]);

  const initials = (user?.displayName ?? user?.email ?? "U").charAt(0).toUpperCase();

  return (
    <>
      <Tabs.Navigator
        screenOptions={({ route }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: "home-outline",
            Exams: "school-outline",
            Jobs: "briefcase-outline",
            Docs: "document-text-outline",
            Vault: "shield-checkmark-outline",
            Tasks: "checkmark-done-outline"
          };
          const iconName = iconMap[route.name] ?? "ellipse-outline";

          return {
            headerStyle: { backgroundColor: "#f6efe4" },
            tabBarStyle: { backgroundColor: "#fffaf4" },
            tabBarActiveTintColor: "#162128",
            tabBarInactiveTintColor: "#94a3b8",
            tabBarIcon: ({ color, size }) => <Ionicons name={iconName} size={size} color={color} />,
            headerRight: () => (
              <View style={styles.headerActions}>
                <Pressable
                  style={styles.headerIcon}
                  onPress={() => {
                    closeAll();
                    setCalendarVisible(true);
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color="#162128" />
                </Pressable>
                <Pressable
                  style={styles.headerIcon}
                  onPress={() => {
                    closeAll();
                    setNotificationsVisible(true);
                  }}
                >
                  <Ionicons name="notifications-outline" size={18} color="#162128" />
                </Pressable>
                <Pressable
                  style={styles.avatar}
                  onPress={() => {
                    closeAll();
                    setProfileVisible(true);
                  }}
                >
                  <Text style={styles.avatarText}>{initials}</Text>
                </Pressable>
              </View>
            )
          };
        }}
      >
        <Tabs.Screen name="Dashboard" component={DashboardScreen} />
        <Tabs.Screen name="Exams">{() => <EntityScreen section="exams" />}</Tabs.Screen>
        <Tabs.Screen name="Jobs">{() => <EntityScreen section="applications" />}</Tabs.Screen>
        <Tabs.Screen name="Docs">{() => <EntityScreen section="certificates" />}</Tabs.Screen>
        <Tabs.Screen name="Vault">{() => <EntityScreen section="idVault" />}</Tabs.Screen>
        <Tabs.Screen name="Tasks">{() => <EntityScreen section="tasks" />}</Tabs.Screen>
      </Tabs.Navigator>

      <Modal animationType="fade" transparent visible={calendarVisible} onRequestClose={closeAll}>
        <Pressable style={styles.modalOverlay} onPress={closeAll}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule</Text>
              <Pressable style={styles.modalClose} onPress={closeAll}>
                <Ionicons name="close" size={18} color="#162128" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              {scheduleItems.length === 0 ? (
                <Text style={styles.modalEmpty}>No upcoming items.</Text>
              ) : (
                scheduleItems.map((item) => (
                  <View key={item.id} style={styles.scheduleItem}>
                    <View style={styles.scheduleCopy}>
                      <Text style={styles.scheduleTitle}>{item.title}</Text>
                      <Text style={styles.scheduleSubtitle}>{item.subtitle ?? item.type}</Text>
                    </View>
                    <Text style={styles.scheduleDate}>{formatDate(item.date)}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Text style={styles.modalHint}>Sync as {user?.email ?? "your account"}</Text>
              <Pressable
                style={styles.modalPrimary}
                onPress={() => Alert.alert("Google Calendar", "Google Calendar sync will be added in the settings flow.")}
              >
                <Text style={styles.modalPrimaryText}>Sync to Google Calendar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType="fade" transparent visible={notificationsVisible} onRequestClose={closeAll}>
        <Pressable style={styles.modalOverlay} onPress={closeAll}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {notificationsMode === "all" ? "Notifications" : "Latest alerts"}
              </Text>
              <Pressable style={styles.modalClose} onPress={closeAll}>
                <Ionicons name="close" size={18} color="#162128" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              {latestNotifications.length === 0 ? (
                <Text style={styles.modalEmpty}>No notifications yet.</Text>
              ) : (
                latestNotifications.map((item) => (
                  <View key={item.id} style={styles.notificationItem}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationMeta}>{formatDate(item.scheduledFor)}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              {notificationsMode === "all" ? (
                <Pressable style={styles.modalSecondary} onPress={() => setNotificationsMode("latest")}>
                  <Text style={styles.modalSecondaryText}>Back to latest</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.modalSecondary} onPress={() => setNotificationsMode("all")}>
                  <Text style={styles.modalSecondaryText}>View all</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType="fade" transparent visible={profileVisible} onRequestClose={closeAll}>
        <Pressable style={styles.modalOverlay} onPress={closeAll}>
          <Pressable style={styles.profileCard} onPress={() => {}}>
            <View style={styles.profileHeader}>
              <Text style={styles.modalTitle}>Profile</Text>
              <Pressable style={styles.modalClose} onPress={closeAll}>
                <Ionicons name="close" size={18} color="#162128" />
              </Pressable>
            </View>
            <View style={styles.profileBody}>
              <View style={styles.profileAvatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.profileEmail}>{user?.email ?? "Unknown user"}</Text>
            </View>
            <View style={styles.profileActions}>
              <Pressable
                style={styles.modalSecondary}
                onPress={() => Alert.alert("Profile", "Profile details are shown here.")}
              >
                <Text style={styles.modalSecondaryText}>View profile</Text>
              </Pressable>
              <Pressable
                style={styles.modalSecondary}
                onPress={() => {
                  closeAll();
                  setSettingsVisible(true);
                }}
              >
                <Text style={styles.modalSecondaryText}>Settings</Text>
              </Pressable>
              <Pressable
                style={styles.modalPrimary}
                onPress={() => {
                  closeAll();
                  void logout();
                }}
              >
                <Text style={styles.modalPrimaryText}>Logout</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType="fade" transparent visible={settingsVisible} onRequestClose={closeAll}>
        <Pressable style={styles.modalOverlay} onPress={closeAll}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <Pressable style={styles.modalClose} onPress={closeAll}>
                <Ionicons name="close" size={18} color="#162128" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.settingsCard}>
                <Text style={styles.settingsLabel}>Calendar</Text>
                <Text style={styles.settingsTitle}>Google Calendar</Text>
                <Text style={styles.settingsMeta}>{user?.email ?? "Not connected"}</Text>
                <Pressable
                  style={styles.modalSecondary}
                  onPress={() =>
                    Alert.alert("Google Calendar", "Google Calendar sync will be added in the settings flow.")
                  }
                >
                  <Text style={styles.modalSecondaryText}>Connect calendar</Text>
                </Pressable>
              </View>
              <View style={styles.settingsCard}>
                <Text style={styles.settingsLabel}>Notifications</Text>
                <Text style={styles.settingsTitle}>In-app alerts</Text>
                <Text style={styles.settingsMeta}>{notifications.length} notifications loaded</Text>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default function App() {
  const token = useMobileStore((state) => state.token);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        {token ? <AppTabs /> : <AuthScreen />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10, marginRight: 12 },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#162128"
  },
  avatarText: { color: "#ffffff", fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.24)", justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: "#fffaf4", borderRadius: 22, overflow: "hidden", maxHeight: "80%" },
  profileCard: { backgroundColor: "#fffaf4", borderRadius: 22, overflow: "hidden" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0"
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0"
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#162128" },
  modalClose: {
    width: 30,
    height: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  modalBody: { padding: 16, gap: 12 },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 10
  },
  modalHint: { color: "#64748b", fontSize: 12 },
  modalPrimary: {
    borderRadius: 16,
    backgroundColor: "#162128",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center"
  },
  modalPrimaryText: { color: "#ffffff", fontWeight: "700" },
  modalSecondary: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d6d3d1",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center"
  },
  modalSecondaryText: { color: "#162128", fontWeight: "600" },
  modalEmpty: { textAlign: "center", color: "#64748b", paddingVertical: 24 },
  scheduleItem: { flexDirection: "row", justifyContent: "space-between", gap: 12, backgroundColor: "#ffffff", borderRadius: 16, padding: 12 },
  scheduleCopy: { flex: 1 },
  scheduleTitle: { fontSize: 14, fontWeight: "600", color: "#162128" },
  scheduleSubtitle: { marginTop: 4, color: "#64748b", fontSize: 12 },
  scheduleDate: { color: "#475569", fontSize: 12, alignSelf: "center" },
  notificationItem: { backgroundColor: "#ffffff", borderRadius: 16, padding: 12, gap: 6 },
  notificationTitle: { fontSize: 14, fontWeight: "600", color: "#162128" },
  notificationMessage: { color: "#475569", fontSize: 12 },
  notificationMeta: { color: "#94a3b8", fontSize: 11 },
  profileBody: { padding: 20, alignItems: "center", gap: 8 },
  profileAvatar: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: "#162128" },
  profileEmail: { color: "#475569", fontSize: 13 },
  profileActions: { padding: 16, gap: 10 },
  settingsCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 14, gap: 6 },
  settingsLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8" },
  settingsTitle: { fontSize: 15, fontWeight: "600", color: "#162128" },
  settingsMeta: { color: "#64748b", fontSize: 12 }
});
