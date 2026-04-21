import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../theme/useTheme";
import { useUniversitiesStore } from "../stores/universitiesStore";
import { ExplorarScreen } from "../screens/explorar/ExplorarScreen";
import { UniversityDetailScreen } from "../screens/explorar/UniversityDetailScreen";
import { ExamsListScreen } from "../screens/explorar/ExamsListScreen";
import { BooksListScreen } from "../screens/explorar/BooksListScreen";
import { FollowingScreen } from "../screens/explorar/FollowingScreen";
import { useMain } from "./mainContext";

const Stack = createNativeStackNavigator();

function UniversityListRoute() {
  const navigation = useNavigation();
  const h = useMain();
  return (
    <ExplorarScreen
      refreshing={h.refreshing}
      onRefresh={h.onRefresh}
      onOpenLocation={h.onOpenLocation}
      onOpenDiscover={h.onOpenDiscover}
      onSelectUni={(u) => { h.onSelectUni(u); navigation.navigate("UniversityDetail"); }}
    />
  );
}

function UniversityDetailRoute() {
  const navigation = useNavigation();
  const h = useMain();
  const selUni = useUniversitiesStore(s => s.selUni);
  const setSU = useUniversitiesStore(s => s.setSelUni);
  if (!selUni) return null;
  return (
    <UniversityDetailScreen
      selUni={selUni}
      onBack={() => { setSU(null); navigation.goBack(); }}
      onToggleFollow={h.onToggleFollow}
      onShowExams={() => navigation.navigate("ExamsList")}
    />
  );
}

function ExamsListRoute() {
  const navigation = useNavigation();
  const h = useMain();
  const selUni = useUniversitiesStore(s => s.selUni);
  return (
    <ExamsListScreen
      selUni={selUni}
      onBack={() => navigation.goBack()}
      onSelectExam={h.onOpenExam}
    />
  );
}

function BooksListRoute() {
  const navigation = useNavigation();
  return <BooksListScreen onBack={() => navigation.goBack()} />;
}

function FollowingRoute() {
  const navigation = useNavigation();
  const h = useMain();
  return (
    <FollowingScreen
      onBack={() => navigation.goBack()}
      onExplore={() => navigation.navigate("UniversityList")}
      onSelectUni={(u) => { h.onSelectUni(u); navigation.navigate("UniversityDetail"); }}
    />
  );
}

export function ExplorarStack() {
  const { T } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: T.bg } }}>
      <Stack.Screen name="UniversityList" component={UniversityListRoute} />
      <Stack.Screen name="UniversityDetail" component={UniversityDetailRoute} />
      <Stack.Screen name="ExamsList" component={ExamsListRoute} />
      <Stack.Screen name="BooksList" component={BooksListRoute} />
      <Stack.Screen name="Following" component={FollowingRoute} />
    </Stack.Navigator>
  );
}
