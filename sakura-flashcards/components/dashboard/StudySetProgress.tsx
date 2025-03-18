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
  // calculate the total flashcards in the study set
  let total = 0;
  props.progress.forEach((lesson) => {
    lesson.forEach((unit) => {
      total += unit.size;
    });
  });

  return (
    <div id={props.name} className="my-5">
      <h2 className="text-3xl font-bold">{props.name}</h2>
      {/* Study Set Progress */}
      <ProgressBar
        showLabel={true}
        progress={(countSetProgress(props.progress) / total) * 100}
      />
      {/* Lessons in Study Set */}
      {props.progress.map((lesson, i) => {
        return (
          <LessonProgress
            name={props.data[i].lessonTitle}
            progress={lesson}
            data={props.data[i].units}
          />
        );
      })}
    </div>
  );
}
