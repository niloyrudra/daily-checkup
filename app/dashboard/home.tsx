import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { auth, db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserData } from "@/types";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";

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
    <ScrollView className="flex-1 bg-gray-900 px-4 pt-12">
      {/* Welcome Section */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", duration: 500 }}
        className="mb-6"
      >
        <Text className="text-white text-3xl font-bold">Welcome,</Text>
        <Text className="text-gray-400 text-xl">{userData?.email || "User"}</Text>
      </MotiView>

      {/* User Info Card */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 500 }}
        className="bg-gray-800 p-5 rounded-2xl shadow-lg mb-6"
      >
        <View className="flex-row items-center">
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            className="w-16 h-16 rounded-full border-2 border-blue-500"
          />
          <View className="ml-4">
            <Text className="text-white text-lg font-semibold">{userData?.email}</Text>
            <Text className="text-gray-400">Status: {userData?.emailVerified ? "Verified ✅" : "Unverified ❌"}</Text>
          </View>
        </View>
      </MotiView>

      {/* Friend Verification Status */}
      <Text className="text-gray-400 text-lg mb-3">Friend Verification</Text>
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: "spring", duration: 500 }}
        className="bg-gray-800 p-5 rounded-2xl shadow-lg"
      >
        {userData?.friendEmails ? (
          Object.entries(userData.friendEmails).map(([email, verified], index) => (
            <View key={index} className="flex-row items-center justify-between mb-2">
              <Text className="text-white">{email}</Text>
              {verified ? (
                <FontAwesome5 name="check-circle" size={20} color="green" />
              ) : (
                <MaterialIcons name="pending-actions" size={20} color="orange" />
              )}
            </View>
          ))
        ) : (
          <Text className="text-gray-400">No friends verified yet.</Text>
        )}
      </MotiView>

      {/* Actions */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", duration: 500 }}
        className="mt-6"
      >
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-xl items-center mb-3"
          onPress={() => router.push("/(auth)/add-friends")}
        >
          <Text className="text-white text-lg font-semibold">Verify More Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-600 py-3 rounded-xl items-center"
          onPress={async () => {
            await auth.signOut();
            router.replace("/(auth)/signup");
          }}
        >
          <Text className="text-white text-lg font-semibold">Logout</Text>
        </TouchableOpacity>
      </MotiView>
    </ScrollView>
  );
};

export default DashboardScreen;