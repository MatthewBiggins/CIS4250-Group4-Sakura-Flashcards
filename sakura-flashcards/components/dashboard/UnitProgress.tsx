import { IUnitData, TUnitProgress } from "@/constants";

interface ProgressProps {
  name: string;
  progress: TUnitProgress;
  totalFlashcards: number;
}

export default function UnitProgress(props: ProgressProps) {
  var progress = 0;

  // Count how many flashcards are completed
  props.progress.forEach((cardCompleted) => {
    if (cardCompleted) {
      progress++;
    }
  });

  return (
    <div>
      <p>{((progress / props.totalFlashcards) * 100).toFixed(0)}%</p>
      <p>{props.name}</p>
    </div>
  );
}
