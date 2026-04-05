import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { User, UserRole } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in, now fetch profile from Firestore
        const unsubscribeProfile = onSnapshot(doc(db, "users", firebaseUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: data.role as UserRole,
              photoURL: firebaseUser.photoURL || undefined
            });
          } else {
            // User exists in Auth but not in Firestore (maybe still setting up)
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: 'Doctor', // Default or null
              photoURL: firebaseUser.photoURL || undefined
            });
          }
          setLoading(false);
        }, (err) => {
          console.error("Profile fetch error:", err);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, loading };
}
