import styles from "./loader.module.css";
import cn from "classnames";
import Image from "next/image";

interface Props {
  className?: string;
  text?: string;
  showText?: boolean;
  simple?: boolean;
}

const Loader = (props: Props) => {
  const { className, showText = true, text = "Chargement...", simple } = props;
  return (
    <>
      {simple ? (
        <div className={cn(className, styles.simple_loading)} />
      ) : (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-center",
            className
          )}
          style={{ height: "calc(100vh - 200px)" }}
        >
          {showText && (
            <h3 className="text-lg font-semibold text-body italic flex flex-col justify-center">
              <Image src={"/image/loader-sAmArA.gif"} width={80} height={80} alt="" />
              {text}
            </h3>
          )}
        </div>
      )}
    </>
  );
};

export default Loader;
