import React, { useEffect, useState } from "react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { MdOutlineSendToMobile } from "react-icons/md";
import { OnOffOption } from "./OnOffOption";
import "../styles/time.css";
import { createTask } from "../services";
interface TimeProps {
  switchId: string;
  setNewAdded: (param: boolean) => void;
}

export const TaskSetter: React.FC<TimeProps> = (props) => {
  const [time, setTime] = useState<string | null>(null);
  const [onStatus, setOnStatus] = useState<boolean | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (time && onStatus != null) {
      setIsDisabled(false);
    }

    console.log("task setter", onStatus);
  }, [time, onStatus]);

  const addTask = async () => {
    const [hour, minutes] = time ? time.split(":") : "";
    const task = {
      deviceId: props.switchId,
      onStatus: onStatus,
      scheduledTime: { hour, minutes },
    };
    const token = localStorage.getItem("token");

    try {
      const response = await createTask(task, token);
      if (response.ok) {
        setTime(null);
        setOnStatus(null);
        setIsDisabled(true);
        props.setNewAdded(true);
        alert("Task created");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className="flex flex-row rounded justify-center items-center mx-2">
      <div className="rounded justify-center items-center mx-1">
        <TimePicker
          onChange={(value: string | null) => setTime(value)}
          openClockOnFocus={false}
          format={"HH : mm"}
          maxDetail="minute"
          hourPlaceholder="hh"
          minutePlaceholder="mm"
          value={time}
        />
      </div>
      <div className="rounded justify-center items-center">
        <OnOffOption
          setOnStatus={setOnStatus}
          onStatus={onStatus}
        ></OnOffOption>
      </div>
      <div>
        <button
          onClick={() => {
            addTask();
          }}
          disabled={isDisabled}
          className={isDisabled ? "inactive-button" : "active-button"}
        >
          <MdOutlineSendToMobile />
        </button>
      </div>
    </div>
  );
};
