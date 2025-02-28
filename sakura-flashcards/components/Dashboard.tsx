"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import UserContext from "@/components/UserContext";
import { genkiData } from "@/data";
import StudySetProgress from "./dashboard/StudySetProgress";
import { TStudySetProgress, TUnitProgress } from "@/constants";

const testUnit: TUnitProgress = new Map();
testUnit.set(0, true);
testUnit.set(1, false);
const testProgress: TStudySetProgress[] = [[[testUnit]], [[testUnit]]];

export default function Dashboard() {
  const UserData = useContext(UserContext);
  const router = useRouter();

  if (UserData.userName == "") {
    router.push("/");
    return <div>Redirecting...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold">{UserData.userName}</h1>
      {genkiData.map((studySet, i) => {
        return (
          <StudySetProgress
            name={studySet.name}
            progress={testProgress[i]}
            data={studySet.data}
          />
        );
      })}
    </div>
  );
}
