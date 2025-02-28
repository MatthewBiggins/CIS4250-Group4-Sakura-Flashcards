"use client";

import { TStudySetProgress } from "@/constants";
import { createContext, useEffect, useState } from "react";

interface AuthContext {
  userName: string;
  setUser: (name: string) => void;
  progress: TStudySetProgress[];
  setProgress: (newProgress: TStudySetProgress[]) => void;
  userId: string;
  setUserId: (name: string) => void;
}

const UserContext = createContext<AuthContext>({
  userName: "",
  setUser: () => {},
  progress: [],
  setProgress: () => {},
  userId: "",
  setUserId: () => {},
});

function getInitialUserName() {
  const userName = localStorage.getItem("username");
  return userName ? userName : "";
}

export function UserProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userName, setUser] = useState(getInitialUserName());
  const [progress, setProgress] = useState<TStudySetProgress[]>([]);
  const [userId, setUserId] = useState("");

  // NOTE: current work around for context bug (#50)
  useEffect(() => {
    localStorage.setItem("username", userName);
  }, [userName]);

  return (
    <UserContext.Provider value={{ userName, setUser, progress, setProgress, userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
