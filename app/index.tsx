import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";

const App = () => {
  // const isLoggedIn = false; // Replace with actual auth state
  const user = useAuth();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/dashboard/home" />;
}
export default App;