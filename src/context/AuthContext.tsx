import React, { createContext, useEffect, useState, useContext } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  // Remove AuthError import
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Remove FirestoreError import
import { auth, db } from "../config/firebase";
import { UserRole, AuthState } from "../types/auth.types";
import { showToast } from "../lib/toast-utils";

// Define a type for the user object
interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  authState: { user: null, loading: true, error: null },
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
});

// Add the useAuth hook here
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Modify the onAuthStateChanged handler to add error handling and logging
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log("Attempting to fetch user data for:", firebaseUser.uid);
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          // If the user document doesn't exist, create it
          if (!userDoc.exists()) {
            console.log("User document doesn't exist, creating one");
            await setDoc(doc(db, "users", firebaseUser.uid), {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "User",
              role: "participant" as UserRole,
              createdAt: new Date(),
            });

            // Fetch the user document again
            const newUserDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const userData = newUserDoc.data();

            const user: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: (userData?.role as UserRole) || "participant",
            };

            setAuthState({
              user,
              loading: false,
              error: null,
            });
          } else {
            // User document exists, proceed as normal
            const userData = userDoc.data();

            const user: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: (userData?.role as UserRole) || "participant",
            };

            setAuthState({
              user,
              loading: false,
              error: null,
            });
          }
        } catch (error: unknown) {
          console.error("Error fetching user data:", error);
          // Still set the user with basic info from Firebase Auth
          const user: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: "participant", // Default role
          };

          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          setAuthState({
            user,
            loading: false,
            error: errorMessage,
          });
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
      showToast.success("Successfully logged in!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to log in";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      showToast.error(errorMessage);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(firebaseUser, { displayName });

      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        displayName,
        role,
        createdAt: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to register";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      await signOut(auth);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to logout";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "participant" as UserRole,
          createdAt: new Date(),
        });
      }

      showToast.success("Successfully signed in with Google!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      showToast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ authState, register, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
