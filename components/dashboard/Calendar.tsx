import React, { useState } from "react";
import { View, Button, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

// import DateTimePicker, { Event } from "@react-native-community/datetimepicker";
import { auth, db } from "@/config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { router } from "expo-router";
import ActionPrimaryButton from "../form-components/ActionPrimaryButton";
import { Paragraph } from "react-native-paper";
import { Theme } from "@/constants/theme";

// Define the shape of marked dates
interface MarkedDates {
  [date: string]: {
    selected: boolean;
    marked: boolean;
  } | undefined;
}

type DateObject = {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
};

const CalendarComponent: React.FC = () => {
    const [selectedDays, setSelectedDays] = useState<MarkedDates>({});
    const [time, setTime] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState<boolean>(false);

    const toggleDay = (day: string) => {
            setSelectedDays((prev) => ({
            ...prev,
            [day]: !prev[day] ? { selected: true, marked: true } : undefined,
        }));
    };

    const saveSchedule = async () => {
        if (Object.keys(selectedDays).length === 0) {
            Alert.alert("Select at least one day!");
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Not logged in");

            await setDoc(doc(db, "schedules", user.uid), {
                days: Object.keys(selectedDays),
                time: time.toISOString(),
            });

            Alert.alert("Schedule saved!");
            router.push("/dashboard/home"); // added slash to fix router path
        } catch (error: any) {
            Alert.alert("Error", error.message || "Something went wrong.");
        }
    };

//   const handleTimeChange = (event: Event, selectedDate?: Date) => {
//     setShowPicker(false);
//     if (selectedDate) {
//       setTime(selectedDate);
//     }
//   };

    const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            setTime(selectedDate);
        }
    };
  

    return (
        <View style={{ flex: 1, paddingVertical: 20 }}>
            {/* <Text>Select Days:</Text> */}
            <Calendar
                onDayPress={(day: DateObject) => toggleDay(day.dateString)}
                markedDates={selectedDays}
            />
            <Button title="Pick Reminder Time" onPress={() => setShowPicker(true)} />
            {showPicker && (
                <DateTimePicker
                value={time}
                mode="time"
                onChange={handleTimeChange}
                />
            )}
            {/* <Text>Selected Time: {time.toLocaleTimeString()}</Text> */}
            <View style={{marginVertical: 20}}>
                <Paragraph style={{color: Theme.secondary}}>Selected Time: {time.toLocaleTimeString()}</Paragraph>
            </View>
            {/* <Button title="Save Schedule" onPress={saveSchedule} /> */}
            <ActionPrimaryButton buttonTitle="Save Schedule" onSubmit={saveSchedule}/>
        </View>
    );
};

export default CalendarComponent;