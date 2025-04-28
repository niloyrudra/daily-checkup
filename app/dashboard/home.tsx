import React, { useEffect, useState } from "react";
import { ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserData } from "@/types";
import { Avatar, Button, Card, Text, Title, Paragraph, Divider } from "react-native-paper";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import CalendarComponent from "@/components/dashboard/Calendar";
import SafeAreaLayout from "@/components/layout/SafeAreaLayout";
import { Theme } from "@/constants/theme";

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      }
    };
    fetchUserData();
  }, []);

  return (
    <SafeAreaLayout>

      <ScrollView style={{ flex: 1 }}>
        {/* Welcome Section */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 500 }}
          style={{ marginBottom: 20 }}
        >
          <Title style={{ color: Theme.primary, fontSize: 28 }}>Welcome,</Title>
          <Paragraph style={{ color: "green", fontSize: 18 }}> {/* "#aaa" */}
            {userData?.name || userData?.email || "User"}
          </Paragraph>
        </MotiView>

        {/* User Info Card */}
        <Card style={{ backgroundColor: "#1E1E1E", marginBottom: 20 }}>
          <Card.Title
            title={userData?.name || userData?.email || "User"}
            subtitle={userData?.emailVerified ? "Email: Verified ✅" : "Email: Unverified ❌"}
            left={(props) => (
              <Avatar.Image
                {...props}
                source={{ uri: "https://i.pravatar.cc/119" }}
                size={50}
              />
            )}
            titleStyle={{ color: "white" }}
            subtitleStyle={{ color: "#aaa" }}
          />
        </Card>

        {/* Phone Number Status */}
        <Title style={{ color: Theme.primary, fontSize: 20, marginBottom: 10 }}>
          Phone Number
        </Title>
        <Card style={{ backgroundColor: "#1E1E1E", marginBottom: 20, padding: 10 }}>
          {userData?.phoneNumber ? (
                <Card.Content style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5 }}>
                  <Text style={{ color: "white" }}>{userData.phoneNumber}</Text>
                  {userData?.phoneNumberVerified ? (
                    <FontAwesome5 name="check-circle" size={20} color="green" />
                  ) : (
                    <MaterialIcons name="pending-actions" size={24} color="orange" />
                  )}
                </Card.Content>
            
          ) : (
            <Paragraph style={{ color: "#aaa" }}>No phone number is verified yet.</Paragraph>
          )}
        </Card>

        {/* Friend Verification Status */}
        <Title style={{ color: Theme.primary, fontSize: 20, marginBottom: 10 }}>
          Friend Verification
        </Title>
        <Card style={{ backgroundColor: "#1E1E1E", marginBottom: 20, padding: 10 }}>
          {userData?.contactNumbers.contact1.phoneNumber || userData?.contactNumbers.contact2.phoneNumber ? (
            Object.entries(userData.contactNumbers).map(([phoneNumber, contactName, verified=false], index) => (
              <React.Fragment key={index}>
                <Card.Content style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5 }}>
                  <Text style={{ color: "white" }}>{`Contact #${index}`}: {phoneNumber}</Text>
                  {verified ? (
                    <FontAwesome5 name="check-circle" size={20} color="green" />
                  ) : (
                    <MaterialIcons name="pending-actions" size={24} color="orange" />
                  )}
                </Card.Content>
                {index !== Object.keys(userData.contactNumbers).length - 1 && (
                  <Divider style={{ backgroundColor: "#333" }} />
                )}
              </React.Fragment>
            ))
          ) : (
            <Paragraph style={{ color: "#aaa" }}>No friends verified yet.</Paragraph>
          )}
        </Card>

        {/* Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 500 }}
        >
          <Button
            mode="contained"
            buttonColor="#1E88E5"
            style={{ marginBottom: 10 }}
            // onPress={() => router.push("/(auth)/register/add-friends")}
            onPress={() => router.push("/(auth)/register/contacts-verification")}
          >
            Verify More Friends
          </Button>
          <Button
            mode="contained"
            buttonColor="#E53935"
            onPress={async () => {
              await auth.signOut();
              router.replace("/(auth)/login");
            }}
          >
            Signout
          </Button>
        </MotiView>

        {/* Scheduler Section */}
        <MotiView style={{ marginTop: 30 }}>
          <Title style={{ color: Theme.primary, fontSize: 22, marginBottom: 10 }}>Set Your Schedule</Title>
          <CalendarComponent />
        </MotiView>
      </ScrollView>

    </SafeAreaLayout>
  );
};

export default DashboardScreen;