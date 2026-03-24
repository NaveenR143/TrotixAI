// authContext.js (or inside App.jsx)
import React from "react";
import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // your firebase config

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Show spinner while checking

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // null if signed out
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy access
export const useAuth = () => useContext(AuthContext);
