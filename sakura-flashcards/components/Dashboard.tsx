"use client";

import { useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import UserContext from "@/components/context/UserContext";
import { genkiData } from "@/data";
import StudySetProgress from "@/components/dashboard/StudySetProgress";
import { TLessonProgress, TStudySetProgress, TCardProgress } from "@/constants";
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

// Used to retrieve the progress subcollections genkiSetI and genkiSetII from the firebase
// and load the data into the custom types genkiSet, lesson, and unit
const getProgressFromFirebase = async (
  querySnapshot: DocumentSnapshot<DocumentData, DocumentData>
) => {
  // Retrieve studySetI progress
  const setIRef = collection(querySnapshot.ref, "studySetI");
  const setISnapshot = await getDocs(setIRef);

  // Retrieve studySetII progress
  const setIIRef = collection(querySnapshot.ref, "studySetII");
  const setIISnapshot = await getDocs(setIIRef);

  let sets: TStudySetProgress[] = [];

  // Process lessons for set I
  let lessonsI: TLessonProgress[] = [];
  for (let doc of setISnapshot.docs) {
    const data = doc.data().units; // data is expected to be an array of units
    const unitMaps: Map<number, TCardProgress>[] = data.map((unitObj: any) => {
      // Now access the "cards" property in each unit
      return new Map<number, TCardProgress>(
        Object.entries(unitObj.cards).map(([key, value]) => [Number(key), value as TCardProgress])
      );
    });
    lessonsI.push(unitMaps);
  }

  // Process lessons for set II similarly
  let lessonsII: TLessonProgress[] = [];
  for (let doc of setIISnapshot.docs) {
    const data = doc.data().units;
    const unitMaps: Map<number, TCardProgress>[] = data.map((unitObj: any) => {
      return new Map<number, TCardProgress>(
        Object.entries(unitObj.cards).map(([key, value]) => [Number(key), value as TCardProgress])
      );
    });
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

  useEffect(() => {
    if (UserData.userName === "") {
      // Redirect if the user is not logged in
      router.push("/");
      return;
    }

    // Fetch progress data from Firebase
    const fetchProgress = async () => {
      const docRef = doc(db, "users", UserData.userId);
      const querySnapshot = await getDoc(docRef);

      // Get progress data with the updated structure (lesson -> units -> cards)
      const progressData = await getProgressFromFirebase(querySnapshot);
      setProgress(progressData);
    };

    fetchProgress();
  }, [UserData, router]);

  return (
    <div>
      <h1 className="text-4xl font-bold">
        Welcome back, <span className="text-violet-400">{UserData.userName}</span>!
      </h1>
      {progress.length > 0 ? (
        // Map through genkiData and display study set progress
        genkiData.map((studySet, i) => {
          // Safely access progress with a fallback
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
        // Show a loading indicator if progress is not yet loaded
        <div>Loading progress...</div>
      )}
    </div>
  );
}
