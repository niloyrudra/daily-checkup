import React, { useState } from "react";
import { View, Alert, TouchableOpacity, Text } from "react-native";
import { Calendar } from "react-native-calendars";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { auth, db } from "@/config/firebase";
import { doc, setDoc } from "firebase/firestore";
// import { router } from "expo-router";
import ActionPrimaryButton from "../form-components/ActionPrimaryButton";
import { Paragraph } from "react-native-paper";
import { Theme } from "@/constants/theme";
import SIZES from "@/constants/size";

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
    const [loading, setLoading] = useState<boolean>(false)

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

        setLoading(true)

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Not logged in");

            await setDoc(doc(db, "users", user.uid), {
                schedules: [
                    {
                        days: Object.keys(selectedDays),
                        time: time.toISOString(),
                    }
                ]
            });
            // await setDoc(doc(db, "schedules", user.uid), {
            //     days: Object.keys(selectedDays),
            //     time: time.toISOString(),
            // });

            Alert.alert("Schedule saved!");
            // router.push("/dashboard/home"); // added slash to fix router path
        } catch (error: any) {
            Alert.alert("Error", error.message || "Something went wrong.");
        }
        finally {
            setLoading(false)
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
            <Calendar
                onDayPress={(day: DateObject) => toggleDay(day.dateString)}
                markedDates={selectedDays}
                style={{
                    // backgroundColor: "red",
                    borderWidth: 1,
                    borderColor: "#aaa",
                    borderRadius: 25,
                    margnBottom: 20
                    // borderTopLeftRadius: 20,
                    // borderTopRightRadius: 20,
                }}
                // theme={{
                //     backgroundColor: '#ffffff',
                //     calendarBackground: '#ffffff',
                //     textSectionTitleColor: '#b6c1cd',
                //     selectedDayBackgroundColor: '#00adf5',
                //     selectedDayTextColor: '#ffffff',
                //     todayTextColor: '#00adf5',
                //     dayTextColor: '#2d4150',
                //     textDisabledColor: '#dd99ee'
                // }}
            />

            {/* <Button
                title="Pick Reminder Time"
                onPress={() => setShowPicker(true)}
            /> */}

            <TouchableOpacity
                style={{
                    backgroundColor: Theme.primary, // "#1E88E5",
                    paddingVertical: 12,
                    marginTop: 20,
                    borderRadius: 30
                    // borderBottomLeftRadius: 20,
                    // borderBottomRightRadius: 20,
                }}
                onPress={() => setShowPicker(true)}
            >
                <Text style={{fontSize: SIZES.title, color: "#FFFFFF", textAlign:"center", fontWeight: "400"}}>Pick Reminder Time</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                value={time}
                mode="time"
                onChange={handleTimeChange}
                />
            )}
            {/* <Text>Selected Time: {time.toLocaleTimeString()}</Text> */}
            <View style={{marginVertical: 30}}>
                <Paragraph style={{color: Theme.text, fontSize: SIZES.title}}>Selected Time: {time.toLocaleTimeString()}</Paragraph>
            </View>
            {/* <Button title="Save Schedule" onPress={saveSchedule} /> */}
            <ActionPrimaryButton
                buttonTitle="Save Schedule"
                onSubmit={saveSchedule}
                isLoading={loading}
            />
        </View>
    );
};

export default CalendarComponent;