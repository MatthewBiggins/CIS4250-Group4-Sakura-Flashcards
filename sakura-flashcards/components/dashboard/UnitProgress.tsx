import { TUnitProgress } from "@/constants";
import ConfidenceProgress from "@/components/ui/confidenceProgress";

interface ProgressProps {
  name: string;
  progress: TUnitProgress;
  totalFlashcards: number;
}

export function countUnitProgress(data: TUnitProgress) {
  let progress = 0;

  // Count all flashcards with correct answers
  data.forEach(({ correct }) => {
    progress += correct >= 1 ? 1 : 0;
  });

  return progress;
}

function countUnitAttempts(data: TUnitProgress) {
  let attempts = 0;
  let correct = 0;

  // Sum all correct and incorrect answers across flashcards
  data.forEach((card) => {
    correct += card.correct;
    attempts += card.correct;
    attempts += card.incorrect;
  });

  return { attempts, correct };
}

export default function UnitProgress(props: ProgressProps) {
  const totalCompleted = countUnitProgress(props.progress);
  const totalAttempts = countUnitAttempts(props.progress);

  return (
    <div
      id={props.name}
      className="rounded-lg bg-lessonLink-hover border border-violet-900 p-4 lg:p-6 justify-center text-center w-48"
    >
      <div className="mb-2">
        <p className="text-2xl font-bold">
          {((totalCompleted / props.totalFlashcards) * 100).toFixed(0)}%
        </p>
        <p className="text-sm text-neutral-400">
          {totalCompleted}/{props.totalFlashcards} cards
        </p>
      </div>
      {/* If unit was attempted then show the correctness score */}
      {totalAttempts.attempts > 0 && (
        <ConfidenceProgress
          correct={totalAttempts.correct}
          attempts={totalAttempts.attempts}
        />
      )}
      <p className="text-pretty mt-2">{props.name}</p>
    </div>
  );
}
