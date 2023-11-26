import React, {  useState } from "react";
import "../styles/OnOffOption.css"; // Import your CSS file for styling
import { OnStatus } from "./TaskSetter";

interface Option {
  value: string;
  label: string;
}

interface OnOffOptionProps {
  setOnStatus: (param: OnStatus | null) => void;
  onStatus: OnStatus|null
}


export const OnOffOption: React.FC<OnOffOptionProps> = (props) => {
  const [isOn, setIsOn] = useState<OnStatus|null>(props.onStatus);
  const options: Option[] = [
    { value: "ON", label: "ON" },
    { value: "OFF", label: "OFF" },
  ];
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOn(event.target.value as OnStatus);
    props.setOnStatus(event.target.value as OnStatus)
  };



  return (
    <div className="radio-button-container">
      {options.map((option) => (
        <label key={option.value} className="radio-button-label">
          <input
            type="radio"
            name="options"
            value={option.value}
            checked={isOn === option.value}
            onChange={handleOptionChange}
            className="radio-button-input"
          />
          <span className="radio-button-text">{option.label}</span>
        </label>
      ))}
    </div>
  );
};
