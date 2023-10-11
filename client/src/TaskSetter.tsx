import React, { useEffect, useState } from "react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { MdOutlineSendToMobile } from "react-icons/md";
import { OnOffOption } from "./OnOffOption";
import "./time.css";
import { createTask } from "./services";
import { SwitchInterface } from "./SwitchesList";
interface TimeProps {
  setShowTaskDetails: (param: SwitchInterface | null) => void;
  switchId: string;
}

export const TaskSetter: React.FC<TimeProps> = (props) => {
  const [time, setTime] = useState<string|null>(null);
  const [onStatus, setOnStatus] = useState<boolean | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  useEffect(() => {
    console.log(time)
    if (time && onStatus != null) {
      setIsDisabled(false);
    }

    console.log(time, isDisabled);
  }, [time, onStatus, isDisabled]);

 

  const addTask = async () => {
    const [hour, minutes] = time? time.split(":"): ""
    const task = {
      deviceId: props.switchId,
      onStatus: onStatus,
      scheduledTime: { hour, minutes },
    };
    const token = localStorage.getItem("token");

    try {
      const response = await createTask(task, token);
      if (response.ok) {
        alert("Task created");
        console.log(await response.json());
      }
      if (response.status == 409) {
        alert("Room name already in use");
      }
    } catch (error) {
      console.error("an error occurred:", error);
    }
  };

  return (
    <div className="flex flex-row rounded justify-center items-center mx-2">
      <div className="rounded justify-center items-center mx-1">
      <TimePicker onChange={(value:string|null)=>setTime(value)} value={time} />
      </div>
      <div className="rounded justify-center items-center">
        <OnOffOption setOnStatus={setOnStatus}></OnOffOption>
      </div>
      <div>
        <button
          onClick={() => {
            addTask();
            props.setShowTaskDetails(null);
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
