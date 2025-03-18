import { TUnitProgress } from "@/constants";

interface ProgressProps {
  name: string;
  progress: TUnitProgress;
  totalFlashcards: number;
}

export function countUnitProgress(data: TUnitProgress) {
  let progress = 0;

  // Sum all correct answers across flashcards
  data.forEach(({ correct }) => {
    progress += correct >= 1 ? 1 : 0;
  });

  return progress;
}

export default function UnitProgress(props: ProgressProps) {
  const totalCorrect = countUnitProgress(props.progress);
  const totalAttempts = Array.from(props.progress.values()).reduce(
    (acc, { correct, incorrect }) => acc + correct + incorrect,
    0
  );

  return (
    <div
      id={props.name}
      className="rounded-lg bg-black border border-violet-900 p-4 lg:p-6 justify-center text-center w-48"
    >
      <div className="mb-2">
        <p className="text-2xl font-bold">
          {((totalCorrect / props.totalFlashcards) * 100).toFixed(0)}%
        </p>
        <p className="text-sm text-neutral-400">
          {totalCorrect}/{props.totalFlashcards} cards
        </p>
      </div>
      {/* <div className="border-t border-violet-900 pt-2">
        <p className="text-sm">
          <span className="text-green-500">{totalCorrect} ✓</span> /{" "}
          <span className="text-red-500">
            {totalAttempts - totalCorrect} ✗
          </span>
        </p>
      </div> */}
      <p className="text-pretty mt-2">{props.name}</p>
    </div>
  );
}
