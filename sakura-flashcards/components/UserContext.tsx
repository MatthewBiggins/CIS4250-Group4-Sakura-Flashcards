"use client";

import { createContext, useState } from "react";

interface AuthContext {
  userName: string;
  setUser: (name: string) => void;
}

const UserContext = createContext<AuthContext>({
  userName: "",
  setUser: () => {},
});

export function UserProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userName, setUser] = useState("");

  return (
    <UserContext.Provider value={{ userName, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
