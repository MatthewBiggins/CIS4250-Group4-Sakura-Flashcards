import { IUnitData, TLessonProgress } from "@/constants";
import UnitProgress, {
  countUnitProgress,
} from "@/components/dashboard/UnitProgress";
import ProgressBar from "@/components/ui/progressBar";

interface ProgressProps {
  name: string;
  progress: TLessonProgress;
  data: Array<IUnitData>;
}

export function countLessonProgress(data: TLessonProgress) {
  let progress = 0;

  // for each unit in the lesson - get the progress
  data.forEach((unit) => {
    progress += countUnitProgress(unit);
  });

  return progress;
}

export default function LessonProgress(props: ProgressProps) {
  // Calculate total flashcards
  let total = props.data.reduce((acc, unit) => acc + unit.items.length, 0);

  return (
    <div id={props.name} className="rounded-lg bg-globalBackground my-4 p-4">
      <h3 className="text-2xl font-bold">{props.name}</h3>
      {/* Lesson Progress */}
      <ProgressBar
        showLabel={true}
        progress={(countLessonProgress(props.progress) / total) * 100}
      />
      {/* Units in Lesson */}
      <div className="grid grid-cols-2 lg:grid-cols-4 place-items-start gap-4 w-fit">
        {props.data.map((unit, i) => {
          // Map over data instead of progress
          const unitProgress = props.progress[i] || new Map();
          return (
            <UnitProgress
              key={unit.title}
              name={unit.title}
              progress={unitProgress}
              totalFlashcards={unit.items.length}
            />
          );
        })}
      </div>
    </div>
  );
}
