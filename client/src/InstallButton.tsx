import { useEffect, useState } from "react";
import { GiClockwork } from "react-icons/gi";

export type CreateMeterProps = {
  setInstall: (param: boolean) => void;
  
}

export const InstallButton: React.FC<{ name: string, componentToRender: React.FC<CreateMeterProps>}> = (props) => {
  const [install, setInstall] = useState(false);
  
  const RenderedComponent = props.componentToRender;


  useEffect(() => {
    
  }, [install]);

  return (
    <div>
    {install? <RenderedComponent setInstall={setInstall}></RenderedComponent>: <button
      className="m-2 bg-blue-700 hover:bg-green-700 text-white text-lg font-bold py-2 px-2 rounded"
      onClick={() => {
        setInstall(true);
      }}
    >
      <div className="flex flex-row w-full justify-center items-center">
        <div className=" m-1">{props.name}</div>
        <div className="m-1">
          <GiClockwork />
        </div>
      </div>
    </button>}


    
    </div>
  );
};
