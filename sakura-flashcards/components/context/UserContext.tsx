"use client";

import { createContext, useEffect, useState } from "react";
import { TStudySetProgress } from "@/constants";

interface AuthContext {
  userName: string;
  setUser: (name: string) => void;
  progress: TStudySetProgress[];
  setProgress: (newProgress: TStudySetProgress[]) => void;
  userId: string;
  setUserId: (name: string) => void;
}

function saveToLocalStorage(key: string, value: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(key, value);
  } else {
    throw new Error("localStorage is not supported");
  }
}

function getFromLocalStorage(key: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem(key);
  }
  return null;
}

const UserContext = createContext<AuthContext>({
  userName: "",
  setUser: () => {},
  progress: [],
  setProgress: () => {},
  userId: "",
  setUserId: () => {},
});

// Get the username from the brower cache
function getStoredUserName() {
  try {
    const userName = getFromLocalStorage("username");
    return userName ? userName : "";
  } catch (error) {
    console.error(error);
    return "";
  }
}

// Get the userId from the brower cache
function getStoredUserId() {
  try {
    const userId = getFromLocalStorage("userId");
    return userId ? userId : "";
  } catch (error) {
    console.error(error);
    return "";
  }
}

export function UserProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userName, setUser] = useState(getStoredUserName());
  const [progress, setProgress] = useState<TStudySetProgress[]>([]);
  const [userId, setUserId] = useState(getStoredUserId());

  // NOTE: save the username to the brower cache
  useEffect(() => {
    try {
      saveToLocalStorage("username", userName);
    } catch (error) {
      console.error(error);
    }
  }, [userName]);

  // NOTE: save the userId to the brower cache
  useEffect(() => {
    try {
      saveToLocalStorage("userId", userId);
    } catch (error) {
      console.error(error);
    }
    localStorage.setItem("userId", userId);
  }, [userId]);

  return (
    <UserContext.Provider value={{ userName, setUser, progress, setProgress, userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
