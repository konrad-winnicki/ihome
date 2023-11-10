import React, { useEffect, useState } from "react";
import ReactSwitch from "react-switch";
import {toggleSwitch } from "./services";

const ToggleSwitch: React.FC<{ switchId: string, onStatus:boolean }> = (props) => {
  const [checked, setChecked] = useState(props.onStatus);
  const token = localStorage.getItem("token");

  const handleChange = (val: boolean) => {
    console.log('before', val, checked)

    setChecked(val);
    console.log('after', val, checked)
    toggleSwitch(props.switchId, val, token)
  };

  useEffect(() => {
  
    console.log('togle mounted')
  }, []);
  
  return (
      <ReactSwitch
        offColor='#0F28FA'
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
