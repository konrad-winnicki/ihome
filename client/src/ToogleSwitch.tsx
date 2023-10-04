import React, { useState } from "react";
import ReactSwitch from "react-switch";
import { toggleSwitch } from "./services";

const ToggleSwitch: React.FC<{ switchId: string }> = (props) => {
  const [checked, setChecked] = useState(false);

  const handleChange = (val: boolean) => {
    setChecked(val);
    toggleSwitch(props.switchId, checked);

  };
  
  return (
      <ReactSwitch
        offColor='#6366F1'
        onColor="#D00"
        handleDiameter={20}
        height={25}
        width={60}
        borderRadius={50}
        checked={checked}
        onChange={handleChange}
      />
  );
};

export default ToggleSwitch;
