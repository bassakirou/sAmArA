import classNames from 'classnames';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

interface ItemProps {
  icon: string;
  title: string;
  description: string;
  more: string;
}

interface Props {
  className?: string;
  item: ItemProps;
}

const TextInformationMoney: React.FC<Props> = ({ item, className }) => {
  const { t } = useTranslation('common');
  return (
    <div className="flex flex-col items-center pb-10 mx-auto mb-10 border-b border-gray-200 lg:w-3/5 sm:flex-row">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-20 h-20 bg-white rounded-full sm:w-32 sm:h-32 sm:mr-10">
        <Image
          src={item.icon}
          alt={t(`${item.title}`)}
          width="78"
          height="78"
          className="absolute"
        />
      </div>

      <div className="flex-grow mt-6 text-center sm:text-left sm:mt-0">
        <h2 className="mb-2 text-lg font-semibold text-white title-font">
          {t(`${item.title}`)}
        </h2>
        <p className="text-base leading-relaxed text-white opacity-60">
          {t(`${item.description}`)}
        </p>
      </div>
    </div>
  );
};

export default TextInformationMoney;
