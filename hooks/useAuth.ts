import { useState, useEffect } from "react";
import { auth, db } from "@/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { UserData } from "@/types";

export const useAuth = () => {
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        if (!auth.currentUser) return;

        const userRef = doc(db, "users", auth.currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            setUser(doc.exists() ? (doc.data() as UserData) : null);
        });

        return () => unsubscribe();
    }, []);

    return user;
};