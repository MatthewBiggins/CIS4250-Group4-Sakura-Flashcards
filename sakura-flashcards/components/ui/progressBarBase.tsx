import { useState } from "react";

interface ProgressProps {
  showLabel: boolean;
  progress: number;
  progressType: string;
  tooltipText?: string[];
  style: {
    background: string;
    progress: string;
  };
}

export default function ProgressBarBase(props: ProgressProps) {
  const [hover, toggleHover] = useState(false);

  return (
    <div className="m-2">
      {props.showLabel && (
        <p className="font-bold">
          {props.progress.toFixed(0)}
          {props.progressType}
        </p>
      )}
      <div
        className={`w-full rounded-full h-2.5 ${props.style.background}`}
        onMouseOver={() => toggleHover(true)}
        onMouseOut={() => toggleHover(false)}
      >
        <div
          className={`${props.style.progress} h-2.5 rounded-full`}
          style={{ width: `${props.progress}%` }}
        />
      </div>
      <div
        className="text-left bg-globalBackground border border-violet-900 p-2 rounded-xl max-w-md"
        style={{
          visibility: hover ? "visible" : "hidden",
          position: "absolute",
        }}
      >
        {props.tooltipText?.map((ln) => (
          <p>{ln}</p>
        ))}
      </div>
    </div>
  );
}
