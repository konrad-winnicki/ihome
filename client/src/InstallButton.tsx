import { useEffect } from "react";
import { IoSettingsOutline } from "react-icons/io5";

export type ComponentToRenderProps = {
  setInstall: (param: string | null) => void;
};

type InstallButtonProps = {
  install: string | null;
  setInstall: (param: string | null) => void;
  name: string;
  componentToRender: React.FC<ComponentToRenderProps>;
};

export const InstallButton: React.FC<InstallButtonProps> = (props) => {
  const RenderedComponent = props.componentToRender;

  useEffect(() => {}, [props]);

  return (
    <div>
      {props.install ? (
        <RenderedComponent setInstall={props.setInstall}></RenderedComponent>
      ) : (
        <button
          className="m-2 bg-blue-700 hover:bg-green-700 text-white text-lg font-bold py-2 px-2 rounded"
          onClick={() => {
            props.setInstall(props.name);
          }}
        >
          <div className="flex flex-row w-full justify-center items-center">
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
