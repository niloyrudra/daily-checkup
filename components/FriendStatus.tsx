import { View, Text } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";

type Props = { friendEmails: { [email: string]: boolean } };

const FriendStatus: React.FC<Props> = ({ friendEmails }) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", duration: 500 }}
      className="bg-gray-800 p-5 rounded-2xl shadow-lg"
    >
      {friendEmails ? (
        Object.entries(friendEmails).map(([email, verified], index) => (
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
  );
};

export default FriendStatus;