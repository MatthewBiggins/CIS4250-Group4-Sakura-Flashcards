"use client";

import { useRouter } from "next/navigation";
import { useContext, useState, MouseEvent } from "react";
import UserContext from "@/components/context/UserContext";
import { genkiData } from "@/data";
// import Sidebar from "@/components/glossary/SideBar";

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
    <div className="flex flex-col">
      {/* Filters Section */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Study Sets Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Study Sets:</label>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAllStudySetsChange}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  allStudySetsChecked
                    ? 'bg-violet-400 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Study Sets
              </button>
              {allStudySets.map((setTitle) => (
                <button
                  key={setTitle}
                  onClick={() => handleStudySetChange(setTitle)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    checkedStudySets[setTitle]
                      ? 'bg-violet-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {setTitle}
                </button>
              ))}
            </div>
          </div>

          {/* Lessons Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Lessons:</label>
            <div className="flex flex-wrap gap-4">
              {typedGenkiData
                .filter(studySet => checkedStudySets[studySet.name])
                .flatMap(studySet =>
                  studySet.data.map(lesson => (
                    <button
                      key={lesson.lessonTitle}
                      onClick={() => handleLessonChange(lesson.lessonTitle)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        checkedLesson === lesson.lessonTitle
                          ? 'bg-violet-400 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lesson.lessonTitle}
                    </button>
                  ))
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (keep existing content rendering) */}
      <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
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
                              className="text-base font-medium mb-2 flex items-center cursor-pointer hover:text-violet-400 transition-colors"
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
                                      className="border rounded-lg shadow-sm cursor-pointer h-32 flex items-center justify-center text-center p-2 hover:border-violet-400 transition-colors"
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
    </div>
  );
}