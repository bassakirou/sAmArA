import cn from "classnames";
import { useTranslation } from "next-i18next";
import Image from "next/image";

const PageLoader = ({
  width = 100,
  height = 100,
}) => {
  const { t } = useTranslation("common");
  return (
    <div
      className={cn(
        "w-full h-screen flex flex-col items-center justify-center"
      )}
    >
      <div className="flex relative">
        {/* <div className={styles.page_loader}></div> */}
        <Image src="/image/loader-sAmArA.gif"
          height={height}
          width={width}
          layout="fixed"
          loading="eager"
          alt=""
        />
        <h3 className="text-sm font-semibold text-body italic absolute top-1/2 -mt-2 w-full text-center">
          {t("text-loading")}
        </h3>
      </div>
    </div>
  );
};

export default PageLoader;
