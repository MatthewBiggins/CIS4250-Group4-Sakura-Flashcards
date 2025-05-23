import { useState } from 'react';
import { FaCaretDown, FaCaretRight } from 'react-icons/fa'; 
import { ILessonData, TStudySetProgress } from "@/constants";
import LessonProgress, {
  countLessonProgress,
} from "@/components/dashboard/LessonProgress";
import ProgressBar from "@/components/ui/progressBar";

interface ProgressProps {
  name: string;
  progress: TStudySetProgress;
  data: Array<ILessonData>;
}

function countSetProgress(data: TStudySetProgress) {
  let progress = 0;

  // For each lesson in the study set - get the progress
  data.forEach((lesson) => {
    progress += countLessonProgress(lesson);
  });

  return progress;
}

export default function StudySetProgress(props: ProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // calculate the total flashcards in the study set
  let total = 0;
  props.progress.forEach((lesson) => {
    lesson.forEach((unit) => {
      total += unit.size;
    });
  });

  return (
    <div id={props.name} className="my-5">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-lessonLink p-2 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <FaCaretDown className="text-xl" />
        ) : (
          <FaCaretRight className="text-xl" />
        )}
        <h2 className="text-3xl font-bold">{props.name}</h2>
      </div>
      
      {isExpanded && (
        <>
          <ProgressBar
            showLabel={true}
            progress={(countSetProgress(props.progress) / total) * 100}
          />
          {/* Lessons in Study Set */}
          {props.progress.map((lesson, i) => (
            <LessonProgress
              key={props.data[i].lessonTitle}
              name={props.data[i].lessonTitle}
              progress={lesson}
              data={props.data[i].units}
            />
          ))}
        </>
      )}
    </div>
  );
}
