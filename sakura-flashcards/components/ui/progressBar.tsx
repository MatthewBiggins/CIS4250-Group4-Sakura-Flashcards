interface ProgressProps {
  showLabel: boolean;
  progress: number;
}

export default function ProgressBar(props: ProgressProps) {
  return (
    <div className="m-2">
      {props.showLabel && (
        <p className="font-bold">{props.progress.toFixed(0)}% Complete</p>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-violet-900 h-2.5 rounded-full"
          style={{ width: `${props.progress}%` }}
        ></div>
      </div>
    </div>
  );
}
