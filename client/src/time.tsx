import React, { useEffect, useState } from "react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { MdOutlineSendToMobile } from "react-icons/md";
import { CheckBox } from "./Checkbox";
import { SwitcherOption } from "./Option";
import { RadioExample } from "./radio";
import "./time.css";
import { createTask } from "./services";
import TaskList from "./TaskList";
interface TimeProps {
  setIsTime: (param: boolean) => void;
  switchId: string;
}

export const Time: React.FC<TimeProps> = (props) => {
  const [value, setValue] = useState<string >('');
  const [onStatus, setOnStatus] = useState<boolean | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (value && onStatus) {
      setIsDisabled(false);
    }

    console.log(value, isDisabled);
  }, [value, onStatus, isDisabled]);

  const addTask = async () => {
    const [hour, minutes] = value.split(":");
    const task = {
      deviceId: props.switchId,
      onStatus: onStatus,
      scheduledTime: { hour, minutes },
    };

    try {
      const response = await createTask(task);
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
      <div className="rounded justify-center items-center">
        <TimePicker
          onChange={setValue}
          onClockClose={() => {
            console.log("close");
          }}
          value={value}
        />
      </div>
      <div className="rounded justify-center items-center">
        <TimePicker
          onChange={setValue}
          onClockClose={() => {
            console.log("close");
          }}
          value={value}
        />
      </div>
      <div className="rounded justify-center items-center">
        <SwitcherOption setOnStatus={setOnStatus}></SwitcherOption>
      </div>
      <div>
        <button
          onClick={() => {
            addTask();
            props.setIsTime(false);
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
