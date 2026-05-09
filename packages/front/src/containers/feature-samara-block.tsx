import TextInformation from "@components/common/text-information";
import { featureSamaraBlock as data } from "@data/static/feature-samara-block";

interface Props {
  className?: string;
}

const FeatureSamaraBlock: React.FC<Props> = ({
  className = "mb-12 md:mb-14 xl:mb-16",
}) => {
  return (
    <div
      className={`${className} feature-block-wrapper border rounded-md w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-12 xl:gap-0 overflow-hidden py-12 xl:py-0 sm:px-4 md:px-8 lg:px-16 xl:px-16`}
    >
      {data?.map((item) => (
        <TextInformation item={item} key={item.id} />
      ))}
    </div>
  );
};

export default FeatureSamaraBlock;
