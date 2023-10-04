import React, { useEffect, useState } from "react";
import "./OnOffOption.css"; // Import your CSS file for styling

interface Option {
  value: string;
  label: string;
}

interface OnOffOptionProps {
  setOnStatus: (param: boolean) => void;
}

export const OnOffOption: React.FC<OnOffOptionProps> = (props) => {
  const [isOn, setIsOn] = useState<string>("");
  const options: Option[] = [
    { value: "ON", label: "ON" },
    { value: "OFF", label: "OFF" },
  ];
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOn(event.target.value);
  };

  useEffect(() => {
    if (isOn === "ON") {
      props.setOnStatus(true);
    }
    if (isOn === "OFF") {
      props.setOnStatus(false);
    }
  }, [isOn, props]);

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
