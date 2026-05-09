import TextInformation from '@components/common/text-information';
import TextInformation2 from '@components/common/text-information-2';
import { featureSellerBlock as data } from '@data/static/feature-seller-block';

interface Props {
  className?: string;
}

const FeatureSellerBlock: React.FC<Props> = ({
  className = 'flex flex-wrap -mx-4 -mt-4 -mb-10 space-y-6 sm:-m-4 md:space-y-0',
}) => {
  return (
    <div className={`${className} `}>
      {data?.map((item) => (
        <TextInformation2 item={item} key={item.id} />
      ))}
    </div>
  );
};

export default FeatureSellerBlock;
