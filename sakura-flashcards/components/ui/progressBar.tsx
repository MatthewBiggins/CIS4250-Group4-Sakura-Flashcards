import ProgressBarBase from "@/components/ui/progressBarBase";

interface ProgressProps {
  showLabel: boolean;
  progress: number;
}

export default function ProgressBar(props: ProgressProps) {
  return (
    <ProgressBarBase
      showLabel={props.showLabel}
      progress={props.progress}
      progressType="% Complete"
      style={{
        background: "bg-gray-200 dark:bg-gray-700",
        progress: "bg-violet-900",
      }}
    />
  );
}
