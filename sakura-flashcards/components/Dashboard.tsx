"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import UserContext from "@/components/UserContext";
import { genkiData } from "@/data";
import StudySetProgress from "@/components/dashboard/StudySetProgress";
import { TStudySetProgress } from "@/constants";

// TODO: remove test data
function generateTestData() {
  const testProgress: TStudySetProgress[] = genkiData.map((studySet) => {
    return studySet.data.map((lesson) => {
      return lesson.units.map((unit) => {
        const data = new Map<number, { correct: number; incorrect: number }>();

        unit.items.forEach((_, i) => {
          data.set(i, {
            correct: Math.floor(Math.random() * 5),  // Random correct answers 0-4
            incorrect: Math.floor(Math.random() * 3) // Random incorrect answers 0-2
          });
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
        // Safely access progress with fallback
        const studySetProgress = UserData.progress[i] || [];
        
        return (
          <StudySetProgress
            key={studySet.name}
            name={studySet.name}
            progress={studySetProgress}
            data={studySet.data}
          />
        );
      })}
    </div>
  );
}
