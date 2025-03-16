import { TUnitProgress } from "@/constants";

interface ProgressProps {
  name: string;
  progress: TUnitProgress;
  totalFlashcards: number;
}

export function countUnitProgress(data: TUnitProgress) {
  let progress = 0;

  // Count how many flashcards are marked as completed
  data.forEach((cardCompleted) => {
    if (cardCompleted) {
      progress++;
    }
  });

  return progress;
}

export default function UnitProgress(props: ProgressProps) {
  return (
    <div
      id={props.name}
      className="rounded-lg bg-black border border-violet-900 p-4 lg:p-6 justify-center text-center w-48"
    >
      <p className="text-2xl font-bold">
        {(
          (countUnitProgress(props.progress) / props.totalFlashcards) *
          100
        ).toFixed(0)}
        %
      </p>
      <p className="text-pretty">{props.name}</p>
    </div>
  );
}
