"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import UserContext from "@/components/UserContext";
import { genkiData } from "@/data";
import StudySetProgress from "@/components/dashboard/StudySetProgress";
import { TStudySetProgress } from "@/constants";

// TODO: remove test data
function generateTestData() {
  let testProgress: TStudySetProgress[] = genkiData.map((studySet) => {
    return studySet.data.map((lesson) => {
      return lesson.units.map((unit) => {
        const data = new Map();

        unit.items.forEach((_, i) => {
          data.set(i, i % 3 == 0);
        });

        return data;
      });
    });
  });

  return testProgress;
}
const testProgress = generateTestData();

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
