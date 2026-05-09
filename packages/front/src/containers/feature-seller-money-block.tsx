import TextInformationMoney from '@components/common/text-information-money';
import { featureSellerMoneyBlock as data } from '@data/static/feature-seller-block';

interface Props {
  className?: string;
}

const FeatureSellerMoneyBlock: React.FC<Props> = ({
  className = 'container px-5 py-12 mx-auto',
}) => {
  return (
    <div className={`${className} `}>
      {data?.map((item) => (
        <TextInformationMoney item={item} key={item.id} />
      ))}
    </div>
  );
};

export default FeatureSellerMoneyBlock;
