import { useState, useEffect, useRef } from "react";

interface CheckBoxProps {
    setCheckbox_status: (param:boolean)=>void
    status: boolean
}

export  const CheckBox:React.FC <CheckBoxProps> = (props) => {
  const [checkbox_status, setChecked] = useState(false);
  const initialRender = useRef(true)
  const handleChange = () => {
    console.log("HANDLE CHANGE CALLED");
    setChecked(!checkbox_status);
    props.setCheckbox_status(true)
  };


  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    
   
  }, [checkbox_status, props.status]);

  return (
    <div>
      <input
        className="form-check-input"
        style={{ width: "25px", height: "25px" }}
        type="checkbox"
        value = "ON"
        defaultChecked={checkbox_status}
        id="flexCheckIndeterminate"
        onChange={handleChange}
      ></input>
    </div>
  );
}