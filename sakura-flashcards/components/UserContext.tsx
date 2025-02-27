"use client";

import { createContext, useState } from "react";

type unit = Map<number, boolean>;

type lesson = Array<unit>;

type set = Array<lesson>;

interface AuthContext {
  userName: string;
  setUser: (name: string) => void;
  progress: set[];
  setProgress: (newProgress: set[]) => void;
}

const UserContext = createContext<AuthContext>({
  userName: "",
  setUser: () => {},
  progress: [],
  setProgress: () => {},
});

export function UserProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userName, setUser] = useState("");
  const [progress, setProgress] = useState<set[]>([]);

  return (
    <UserContext.Provider value={{ userName, setUser, progress, setProgress }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
