// authContext.js (or inside App.jsx)
import React from "react";
import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // your firebase config

import { fetchProfile } from "./api/profileAPI";
import { useDispatch } from "react-redux";
import { UPDATE_USER_PROFILE, RESET_INITIAL_STATE } from "./redux/constants";
import { fetchAndStoreProfile } from "./redux/profile/ProfileAction";
import { mapRoleToType } from "./utils/profileMapping";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();



  const refreshAuth = async (phone = null) => {
    try {

      // We allow phone to be null because the backend can identify the user via the access_token cookie
      const response = await fetchProfile(phone);

      if (!response || response.status === 401) {
        // 2. Clear all web storage (localStorage & sessionStorage)
        localStorage.clear();
        sessionStorage.clear();

        // 3. Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // 4. Reset Redux store to initial state
        dispatch({ type: RESET_INITIAL_STATE });

        // Redirect if on a protected path (e.g. not public paths like /, /login, /terms, /job/*, /processing, /error/*)
        const currentPath = window.location.pathname;
        const isPublicPath =
          currentPath === "/" ||
          currentPath === "/login" ||
          currentPath === "/terms" ||
          currentPath.startsWith("/job/") ||
          currentPath === "/processing" ||
          currentPath === "/manual-profile" ||
          currentPath === "/govt-jobs" ||
          currentPath.startsWith("/error");

        if (!isPublicPath) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        }
        return null;
      }

      if (response && !response.error && response.data) {
        const userData = response.data;
        const verifiedType = mapRoleToType(userData.user_type);

        // Update Redux state following AuthComponent.js pattern
        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: {
            userid: userData.user_id || userData.id,
            mobile: userData.mobile || userData.phone,
            displayname: userData.full_name || userData.name || 'User',
            fullname: userData.full_name || userData.name || 'User',
            role: verifiedType
          }
        });

        if (userData.mobile) {
          dispatch(fetchAndStoreProfile(userData.mobile));
        }

        const backendUser = {
          ...userData,
          displayName: userData.full_name || userData.displayName || userData.name,
          email: userData.email,
          uid: userData.user_id || userData.id || userData.uid,
          isBackendUser: true
        };
        setUser(backendUser);

        return backendUser;
      }
    } catch (err) {
      console.error("Failed to refresh backend auth:", err);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // If Firebase user is present, always fetch/refresh backend profile to ensure Redux is in sync
        const bUser = await refreshAuth(currentUser.phoneNumber || null);
        if (bUser) {
          setUser(bUser);
        } else {
          // If backend refresh fails, clear Firebase user as well to stay consistent
          await auth.signOut();
          setUser(null);
        }
        setLoading(false);
      } else {
        // If no Firebase user, attempt to refresh from backend session (if applicable)
        // or ensure the user is completely logged out
        const bUser = await refreshAuth();
        if (!bUser) {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy access
export const useAuth = () => useContext(AuthContext);
