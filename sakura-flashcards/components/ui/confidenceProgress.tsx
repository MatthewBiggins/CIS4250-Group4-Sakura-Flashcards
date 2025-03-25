import ProgressBarBase from "@/components/ui/progressBarBase";

interface ProgressProps {
  correct: number;
  incorrect: number;
  attempts: number;
}

export default function ConfidenceProgress(props: ProgressProps) {
  const confidence = (props.correct / props.attempts) * 100;

  return (
    <ProgressBarBase
      showLabel={false}
      progress={confidence}
      progressType=" Confidence Ratio"
      tooltipText={[
        `Total Attempts: ${props.attempts}`,
        `✓ ${props.correct}`,
        `✗ ${props.incorrect}`,
      ]}
      style={{
        background: "bg-red-500 dark:bg-red-900",
        progress: "bg-green-500 dark:bg-green-900",
      }}
    />
  );
}
