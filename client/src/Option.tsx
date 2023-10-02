import React, { useEffect, useState } from 'react';
import './RadioButton.css'; // Import your CSS file for styling

interface Option {
  value: string;
  label: string;
}

const options: Option[] = [
  { value: 'ON', label: 'ON' },
  { value: 'OFF', label: 'OFF' },
];

interface SwitcherOptionProps{
    setOnStatus: (param:boolean)=> void
}

export const SwitcherOption: React.FC<SwitcherOptionProps> = (props) => {
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  useEffect(()=>{
    if(selectedOption ==="ON"){
props.setOnStatus(true)
    }
    if (selectedOption ==="OFF"){
        props.setOnStatus(false)
    }

  }, [selectedOption, props])

  return (
    <div className="radio-button-container">
      {options.map((option) => (
        <label key={option.value} className="radio-button-label">
          <input
            type="radio"
            name="options"
            value={option.value}
            checked={selectedOption === option.value}
            onChange={handleOptionChange}
            className="radio-button-input"
          />
          <span className="radio-button-text">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

