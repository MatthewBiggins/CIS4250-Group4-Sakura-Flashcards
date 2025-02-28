import { IUnitData, TLessonProgress } from "@/constants";
import UnitProgress from "./UnitProgress";

interface ProgressProps {
  name: string;
  progress: TLessonProgress;
  data: Array<IUnitData>;
}

export default function LessonProgress(props: ProgressProps) {
  return (
    <div>
      <h3>{props.name}</h3>
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
  );
}
