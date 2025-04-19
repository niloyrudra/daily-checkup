import STYLES from "@/constants/styles";
import { Theme } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (<View style={STYLES.contentCentered}><ActivityIndicator color={Theme.primary} /></View>); // or a <Loading /> component | null
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/dashboard/home" />;
};

export default App;