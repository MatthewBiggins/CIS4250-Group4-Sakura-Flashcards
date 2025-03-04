"use client";

import { useState } from "react";

// Define types for the props
interface StudySet {
  name: string;
  data: {
    lessonTitle: string;
  }[];
}

interface SidebarProps {
  allStudySets: string[];
  checkedStudySets: Record<string, boolean>;
  handleStudySetChange: (setTitle: string) => void;
  allStudySetsChecked: boolean;
  handleAllStudySetsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checkedLesson: string | null;
  handleLessonChange: (lessonTitle: string) => void;
  genkiData: StudySet[];
}

export default function Sidebar({
  allStudySets,
  checkedStudySets,
  handleStudySetChange,
  allStudySetsChecked,
  handleAllStudySetsChange,
  checkedLesson,
  handleLessonChange,
  genkiData,
}: SidebarProps) {
  // State for dropdown visibility with type annotation
  const [isStudySetsOpen, setIsStudySetsOpen] = useState<boolean>(true);
  const [isLessonsOpen, setIsLessonsOpen] = useState<boolean>(true);

  // Extract all lesson titles as tuples [studySetName, lessonTitle]
  const allLessons: string[][] = genkiData.flatMap((studySet) =>
    studySet.data.map((lesson) => [studySet.name, lesson.lessonTitle])
  );

  return (
    <div className="w-1/4 p-4">
      {/* Study Sets Dropdown */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <button
            className="text-lg font-semibold text-left flex-1"
            onClick={() => setIsStudySetsOpen((prev) => !prev)}
          >
            Study Sets
          </button>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={allStudySetsChecked}
              onChange={handleAllStudySetsChange}
            />
            All
          </label>
          <span
            className="ml-2 cursor-pointer"
            onClick={() => setIsStudySetsOpen((prev) => !prev)}
          >
            {isStudySetsOpen ? "▼" : "▶"}
          </span>
        </div>
        {isStudySetsOpen && (
          <ul className="mt-2">
            {allStudySets.map((setTitle, index) => (
              <li key={index} className="mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={checkedStudySets[setTitle]}
                    onChange={() => handleStudySetChange(setTitle)}
                  />
                  {setTitle}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lessons Dropdown */}
      <div>
        <div className="flex justify-between items-center">
          <button
            className="text-lg font-semibold text-left flex-1"
            onClick={() => setIsLessonsOpen((prev) => !prev)}
          >
            Lessons
          </button>
          <span
            className="ml-2 cursor-pointer"
            onClick={() => setIsLessonsOpen((prev) => !prev)}
          >
            {isLessonsOpen ? "▼" : "▶"}
          </span>
        </div>
        {isLessonsOpen && (
          <ul className="mt-2">
            {allLessons
              .filter(([studySetName]) => checkedStudySets[studySetName])
              .map(([studySetName, lessonTitle], index) => (
                <li key={index} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={checkedLesson === lessonTitle}
                      onChange={() => handleLessonChange(lessonTitle)}
                    />
                    {lessonTitle}
                  </label>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}