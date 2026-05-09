import cn from "classnames";
import Image from "next/image";

const PageLoader = ({
  width = 100,
  height = 100,
}) => {
  return (
    <div
      className={cn(
        "w-full h-screen flex flex-col items-center justify-center"
      )}
    >
      <Image src="/assets/images/loader-sAmArA.gif"
        height={height}
        width={width}
        layout="fixed"
        loading="eager"
        alt="loading"
      />
    </div>
  );
};

export default PageLoader;
