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
  // calculate the total flashcards in the lesson
  let total = 0;
  props.progress.forEach((unit) => {
    total += unit.size;
  });

  return (
    <div id={props.name} className="rounded-lg bg-zinc-900 my-4 p-4">
      <h3 className="text-2xl font-bold">{props.name}</h3>
      <ProgressBar
        showLabel={true}
        progress={(countLessonProgress(props.progress) / total) * 100}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 place-items-start gap-4 w-fit">
        {props.progress.map((unit, i) => {
          return (
            <UnitProgress
              name={props.data[i].title}
              progress={unit}
              totalFlashcards={props.data[i].items.length}
            />
          );
        })}
      </div>
    </div>
  );
}
