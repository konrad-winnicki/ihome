import React, { useEffect, useState } from "react";
import ReactSwitch from "react-switch";
import { runDevice } from "./services";
import { SwitchInterface } from "./SwitchesList";

const ToggleSwitch: React.FC<{
  switchDevice: SwitchInterface;
  onStatus: boolean;
}> = (props) => {
  const [checked, setChecked] = useState(props.switchDevice.onStatus);
  const token = localStorage.getItem("token");

  const handleChange = (val: boolean) => {
    console.log("before", val, checked);

    setChecked(val);
    console.log("after", val, checked);
    runDevice(props.switchDevice.id, val, token);
  };

  useEffect(() => {
    console.log("togle mounted");
  }, []);

  return (
    <ReactSwitch
      offColor="#0F28FA"
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
