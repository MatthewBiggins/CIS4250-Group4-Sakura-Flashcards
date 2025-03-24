interface ProgressProps {
  showLabel: boolean;
  progress: number;
  progressType: string;
  leftLabel?: string;
  rightLabel?: string;
  style: {
    background: string;
    progress: string;
  };
}

export default function ProgressBarBase(props: ProgressProps) {
  return (
    <div className="m-2">
      {props.showLabel && (
        <p className="font-bold">
          {props.progress.toFixed(0)}
          {props.progressType}
        </p>
      )}
      <div className="text-sm grid grid-cols-2">
        <div className="justify-self-start">{props.leftLabel}</div>
        <div className="justify-self-end">{props.rightLabel}</div>
      </div>
      <div className={`w-full rounded-full h-2.5 ${props.style.background}`}>
        <div
          className={`${props.style.progress} h-2.5 rounded-full`}
          style={{ width: `${props.progress}%` }}
        />
      </div>
    </div>
  );
}
