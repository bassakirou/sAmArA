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

const TextInformation2: React.FC<Props> = ({ item, className }) => {
  const { t } = useTranslation('common');
  return (
    <div className="p-4 md:w-1/3 flex align-top">
      <Image
        src={item.icon}
        alt={t(`${item.title}`)}
        width="78"
        height="78"
        className="absolute"
      />
      <div className="flex-grow pl-24">
        <h2 className="text-gray-900 text-lg title-font font-semibold mb-2">
          {t(`${item.title}`)}
        </h2>
        <p className="leading-relaxed text-base">{t(`${item.description}`)}</p>
        {/* <a className="mt-3 text-green-600 inline-flex items-center font-medium">
          {t(`${item.more}`)}
          <svg
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            className="w-4 h-4 ml-2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </a> */}
      </div>
    </div>
  );
};

export default TextInformation2;
