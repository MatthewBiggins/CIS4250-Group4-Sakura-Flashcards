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
  const [selectedStudySet, setSelectedStudySet] = useState<string>(allStudySets[0]);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  const handleStudySetChange = (setTitle: string) => {
    setSelectedStudySet(setTitle);
    setSelectedLesson(null);
    setExpandedUnits({});
  };

  const handleLessonChange = (lessonTitle: string) => {
    setSelectedLesson(prev => prev === lessonTitle ? null : lessonTitle);
    setFlippedCards({});
    setExpandedUnits({});
  };

  const handleUnitToggle = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleCardFlip = (cardId: string) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  return (
    <div className="flex flex-col">
      {/* Filters Section */}
      <div className="p-4 border-b border-violet-900 bg-globalBackground shadow-sm">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Study Sets Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Study Sets:</label>
            <div className="flex flex-wrap gap-4">
              {allStudySets.map((setTitle) => (
                <button
                  key={setTitle}
                  onClick={() => handleStudySetChange(setTitle)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedStudySet === setTitle
                      ? 'bg-violet-400 text-white'
                      : 'bg-lessonLink text-violet-400 hover:bg-lessonLink-hover'
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
                .find(studySet => studySet.name === selectedStudySet)
                ?.data.map(lesson => (
                  <button
                    key={lesson.lessonTitle}
                    onClick={() => handleLessonChange(lesson.lessonTitle)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedLesson === lesson.lessonTitle
                        ? 'bg-violet-400 text-white'
                        : 'bg-lessonLink text-violet-400 hover:bg-lessonLink-hover'
                    }`}
                  >
                    {lesson.lessonTitle}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <div className="mb-2">
          <label className="text-sm font-medium text-gray-700">Units:</label>
        </div>
        {selectedLesson ? (
          typedGenkiData
            .find(studySet => studySet.name === selectedStudySet)
            ?.data.find(lesson => lesson.lessonTitle === selectedLesson)
            ?.units.map((unit, k) => {
              const unitId = `${selectedLesson}-${k}`;
              const isExpanded = expandedUnits[unitId] ?? false;
              return (
                <div key={unitId} className="mb-6">
                  <button
                    onClick={() => handleUnitToggle(unitId)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors mb-2 ${
                      isExpanded 
                        ? 'bg-violet-400 text-white' 
                        : 'bg-lessonLink text-violet-400 hover:bg-lessonLink-hover'
                    }`}
                  >
                    {unit.title}
                  </button>
                  {isExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ml-4">
                      {unit.items.map((card, l) => {
                        const cardId = `${unitId}-${l}`;
                        const isFlipped = flippedCards[cardId];
                        return (
                          <div
                            key={cardId}
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
            })
        ) : (
          <div className="text-center text-gray-500 h-64 flex items-center justify-center">
            Select a lesson to view its content
          </div>
        )}
      </div>
    </div>
  );
}