"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import UserContext from "@/components/context/UserContext";
import { genkiData } from "@/data";
import StudySetProgress from "@/components/dashboard/StudySetProgress";
import { TLessonProgress, TStudySetProgress } from "@/constants";
import db from "@/firebase/configuration";
import {
  collection,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  getDocs,
} from "firebase/firestore";

// Test Data for the dashboard
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

// Used to retrieve the progress subcollections genkiSetI and genkiSetII from the firebase
// and load the data into the custom types genkiSet, lesson, and unit
const getProgressFromFirebase = async (
  querySnapshot: DocumentSnapshot<DocumentData, DocumentData>
) => {
  // get set 1
  const setIRef = collection(querySnapshot.ref, "studySetI");
  const setISnapshot = await getDocs(setIRef);

  // get set 2
  const setIIRef = collection(querySnapshot.ref, "studySetII");
  const setIISnapshot = await getDocs(setIIRef);

  let sets: TStudySetProgress[] = [];

  // get lesson I data
  let lessonsI: TLessonProgress[] = [];
  for (let doc of setISnapshot.docs) {
    let data = doc.data().units;

    // cast firebase javascript object to map
    const unitMaps: Map<number, boolean>[] = data.map(
      (unitObj: Record<string, boolean>) =>
        new Map<number, boolean>(
          Object.entries(unitObj).map(([key, value]) => [
            Number(key),
            value as boolean,
          ])
        )
    );

    lessonsI.push(unitMaps);
  }

  // get lesson II data
  let lessonsII: TLessonProgress[] = [];
  for (let doc of setIISnapshot.docs) {
    let data = doc.data().units;

    // cast firebase javascript object to map
    const unitMaps: Map<number, boolean>[] = data.map(
      (unitObj: Record<string, boolean>) =>
        new Map<number, boolean>(
          Object.entries(unitObj).map(([key, value]) => [
            Number(key),
            value as boolean,
          ])
        )
    );

    lessonsII.push(unitMaps);
  }

  sets.push(lessonsI);
  sets.push(lessonsII);

  return sets;
};

export default function Dashboard() {
  const UserData = useContext(UserContext);
  const router = useRouter();
  const [progress, setProgress] = useState<TStudySetProgress[]>([]);

  if (UserData.userName == "") {
    // if user not logged in then redirect to home page
    router.push("/");
    return <div>Redirecting...</div>;
  }

  const getProgress = async () => {
    const docRef = doc(db, "users", UserData.userId);
    const querySnapshot = await getDoc(docRef);

    // get progress data from firebase
    let progress = getProgressFromFirebase(querySnapshot);

    // set the progress data
    setProgress(await progress);
  };

  // if there is currently no progress data
  if (progress.length <= 0) {
    getProgress();
  }

  return (
    <div>
      <h1 className="text-4xl font-bold">{UserData.userName}</h1>
      {progress.length > 0 ? (
        // map genkiData with progress to show study set progress
        genkiData.map((studySet, i) => {
          // Safely access progress with fallback
          const studySetProgress = progress[i] || [];

          return (
            <StudySetProgress
              key={studySet.name}
              name={studySet.name}
              progress={studySetProgress}
              data={studySet.data}
            />
          );
        })
      ) : (
        // progress has not been loaded yet
        <div>Loading progress...</div>
      )}
    </div>
  );
}
