"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import UserContext from "@/components/UserContext";
import WelcomeMessage from "./WelcomeMessage";

export default function Dashboard() {
  const UserData = useContext(UserContext);
  const router = useRouter();

  if (UserData.userName == "") {
    router.push("/");
    return <div></div>;
  }

  return (
    <div>
      <WelcomeMessage />
    </div>
  );
}
