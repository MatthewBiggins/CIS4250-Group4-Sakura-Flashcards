"use client";

import { createContext, useState } from "react";

type unit = Map<number, boolean>;

type lesson = Array<unit>;

type genkiSet = Array<lesson>;

interface AuthContext {
  userName: string;
  setUser: (name: string) => void;
  progress: genkiSet[];
  setProgress: (newProgress: genkiSet[]) => void;
  userId: string;
  setUserId: (id: string) => void;
}

const UserContext = createContext<AuthContext>({
  userName: "",
  setUser: () => {},
  progress: [],
  setProgress: () => {},
  userId: "",
  setUserId: () => {},
});

export function UserProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userName, setUser] = useState("");
  const [progress, setProgress] = useState<genkiSet[]>([]);
  const [userId, setUserId] = useState("");

  return (
    <UserContext.Provider value={{ userName, setUser, progress, setProgress, userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
