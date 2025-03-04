"use client";

import { useRouter } from "next/navigation";
import { useContext, useState, MouseEvent } from "react";
import UserContext from "@/components/UserContext";
import { genkiData } from "@/data";
import Sidebar from "@/components/glossary/SideBar";

// Type definitions
interface Card {
  frontSide: string;
  backSide: string;
}

interface Unit {
  title: string;
  items: Card[];
}

interface Lesson {
  lessonTitle: string;
  units: Unit[];
}

interface StudySet {
  name: string;
  data: Lesson[];
}

interface UserData {
  userName: string;
}
const typedGenkiData: StudySet[] = genkiData;

export default function Glossary() {
  const UserData = useContext(UserContext) as UserData;
  const router = useRouter();

  if (UserData.userName === "") {
    router.push("/");
    return <div>Redirecting...</div>;
  }

  const allStudySets: string[] = typedGenkiData.map((studySet) => studySet.name);
  const [checkedStudySets, setCheckedStudySets] = useState<Record<string, boolean>>(
    Object.fromEntries(allStudySets.map((set) => [set, true]))
  );
  const [allStudySetsChecked, setAllStudySetsChecked] = useState<boolean>(true);

  const handleStudySetChange = (setTitle: string) => {
    setCheckedStudySets((prev) => {
      const newState = { ...prev, [setTitle]: !prev[setTitle] };
      setAllStudySetsChecked(
        Object.values(newState).every((checked) => checked)
      );
      return newState;
    });
  };

  const handleAllStudySetsChange = () => {
    const newChecked = !allStudySetsChecked;
    setAllStudySetsChecked(newChecked);
    setCheckedStudySets((prev) =>
      Object.fromEntries(allStudySets.map((set) => [set, newChecked]))
    );
  };

  const [checkedLesson, setCheckedLesson] = useState<string | null>(null);
  const handleLessonChange = (lessonTitle: string) => {
    setCheckedLesson((prev) => {
      const newCheckedLesson = prev === lessonTitle ? null : lessonTitle;
      if (newCheckedLesson !== prev) {
        setFlippedCards({});
        setExpandedUnits({});
      }
      return newCheckedLesson;
    });
  };

  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const handleCardFlip = (cardId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const handleUnitToggle = (unitId: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  return (
    <div className="flex">
      <div className="flex-1 p-4">
        <h1 className="text-4xl font-bold mb-4">{UserData.userName}</h1>
        {typedGenkiData
          .filter((studySet) => checkedStudySets[studySet.name])
          .map((studySet, i) => {
            const filteredLessons = studySet.data.filter(
              (lesson) => lesson.lessonTitle === checkedLesson
            );
            if (filteredLessons.length === 0) return null;
            return (
              <div key={i} className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">{studySet.name}</h2>
                {filteredLessons.map((lesson, j) => (
                  <div key={j} className="mb-4">
                    <h3 className="text-lg font-medium mb-2">{lesson.lessonTitle}</h3>
                    <div className="space-y-4">
                      {lesson.units.map((unit, k) => {
                        const unitId = `${lesson.lessonTitle}-${k}`;
                        const isExpanded = expandedUnits[unitId] ?? false;
                        return (
                          <div key={k}>
                            <h4
                              className="text-base font-medium mb-2 flex items-center cursor-pointer"
                              onClick={() => handleUnitToggle(unitId)}
                            >
                              {unit.title}
                              <span className="ml-2">
                                {isExpanded ? "▼" : "▶"}
                              </span>
                            </h4>
                            {isExpanded && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {unit.items.map((card, l) => {
                                  const cardId = `${unitId}-${l}`;
                                  const isFlipped = flippedCards[cardId];
                                  return (
                                    <div
                                      key={l}
                                      className="border rounded-lg shadow-sm cursor-pointer h-32 flex items-center justify-center text-center p-2"
                                      onClick={() => handleCardFlip(cardId)}
                                    >
                                      <div className="w-full h-full flex items-center justify-center">
                                        {isFlipped ? card.backSide : card.frontSide}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
      </div>

      <Sidebar
        allStudySets={allStudySets}
        checkedStudySets={checkedStudySets}
        handleStudySetChange={handleStudySetChange}
        allStudySetsChecked={allStudySetsChecked}
        handleAllStudySetsChange={handleAllStudySetsChange}
        checkedLesson={checkedLesson}
        handleLessonChange={handleLessonChange}
        genkiData={typedGenkiData}
      />
    </div>
  );
}