"use client";

import { createContext, useEffect, useState } from "react";

interface AuthContext {
  userName: string;
  setUser: (name: string) => void;
  userId: string;
  setUserId: (name: string) => void;
}

const UserContext = createContext<AuthContext>({
  userName: "",
  setUser: () => {},
  userId: "",
  setUserId: () => {},
});

function getStoredUserName() {
  const userName = localStorage.getItem("username");
  return userName ? userName : "";
}

function getStoredUserId() {
  const userId = localStorage.getItem("userId");
  return userId ? userId : "";
}

export function UserProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userName, setUser] = useState(getStoredUserName());
  const [userId, setUserId] = useState(getStoredUserId());

  // NOTE: save the username to the brower cache
  useEffect(() => {
    localStorage.setItem("username", userName);
  }, [userName]);

  // NOTE: save the userId to the brower cache
  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  return (
    <UserContext.Provider value={{ userName, setUser, userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
