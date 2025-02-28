import { ILessonData, TStudySetProgress } from "@/constants";
import LessonProgress from "./LessonProgress";

interface ProgressProps {
  name: string;
  progress: TStudySetProgress;
  data: Array<ILessonData>;
}

export default function StudySetProgress(props: ProgressProps) {
  return (
    <div>
      <h2>{props.name}</h2>
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
