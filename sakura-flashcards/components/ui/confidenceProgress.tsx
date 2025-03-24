import ProgressBarBase from "@/components/ui/progressBarBase";

interface ProgressProps {
  showLabel: boolean;
  correct: number;
  attempts: number;
}

export default function ConfidenceProgress(props: ProgressProps) {
  const confidence = (props.correct / props.attempts) * 100;

  return (
    <ProgressBarBase
      showLabel={props.showLabel}
      progress={confidence}
      progressType=" Confidence Ratio"
      leftLabel="✓"
      rightLabel="✗"
      style={{
        // TODO: finalize correct/incorrect colours
        background: "bg-red-500 dark:bg-red-900",
        progress: "bg-green-500 dark:bg-green-900",
      }}
    />
  );
}
