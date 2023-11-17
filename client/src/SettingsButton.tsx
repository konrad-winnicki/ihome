import { useEffect } from "react";
import { IoSettingsOutline } from "react-icons/io5";

export type ComponentToRenderProps = {
  setAddSettings: (param: string | null) => void;
};

type SetingsButtonProps = {
  settings: string | null;
  setAddSettings: (param: string | null) => void;
  name: string;
  componentToRender: React.FC<ComponentToRenderProps>;
};

export const SettingsButton: React.FC<SetingsButtonProps> = (props) => {
  const RenderedComponent = props.componentToRender;

  useEffect(() => {}, [props]);

  return (
    <div className="w-full">
      {props.settings ? (
        <RenderedComponent
          setAddSettings={props.setAddSettings}
        ></RenderedComponent>
      ) : (
        <button
          className="m-1 bg-blue-700 hover:bg-green-700 text-white text-sm font-bold py-2 px-2 rounded"
          onClick={() => {
            props.setAddSettings(props.name);
          }}
        >
          <div className="flex justify-center items-center">
            <div className=" m-1">{props.name}</div>
            <div className="m-1">
              <IoSettingsOutline />
            </div>
          </div>
        </button>
      )}
    </div>
  );
};
