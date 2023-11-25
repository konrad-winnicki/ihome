import React, { useContext, useState } from "react";
import ReactSwitch from "react-switch";
import { runDevice } from "../services";
import { AuthorizationContext } from "../contexts/AuthorizationContext";
import { SwitchModuleContext } from "../contexts/SwitchModuleContext";

const ToggleSwitch: React.FC = () => {
  const authorizationContext = useContext(AuthorizationContext);
  const switchModuleContext = useContext(SwitchModuleContext);
  const [checked, setChecked] = useState(
    switchModuleContext.switchDevice.onStatus
  );
  const token = localStorage.getItem("token");

  const handleChange = async (val: boolean) => {
    setChecked(val);
    const response = await runDevice(
      switchModuleContext.switchDevice.id,
      val,
      token
    );
    if (response.status === 401) {
      authorizationContext.setLoggedIn(false);
    }
  };

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
