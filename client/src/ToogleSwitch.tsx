import React, { useEffect, useState } from "react";
import ReactSwitch from "react-switch";
import { toggleSwitch } from "./services";

const ToggleSwitch: React.FC<{ switchId: string }> = (props) => {
  const [checked, setChecked] = useState(false);

  const handleChange = (val: boolean) => {
    setChecked(val);
  };
  const firstRender = React.useRef(true);
  useEffect(() => {
    if (!firstRender.current) {
      toggleSwitch(props.switchId, checked);
    } else {
      firstRender.current = false;
    }
  }, [checked, props]);

  return (
      <ReactSwitch
        offColor="#00F"
        onColor="#D00"
        handleDiameter={30}
        height={35}
        width={80}
        borderRadius={60}
        checked={checked}
        onChange={handleChange}
      />
  );
};

export default ToggleSwitch;
