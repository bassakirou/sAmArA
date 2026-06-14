import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@lib/routes';

const ContacImg = ({
  width = 35,
  height = 35,
  classname = 'cursor-pointer',
}) => {
  return (
    <Link href={ROUTES.CONTACT}>
      <Image
        src="/assets/images/icons/samra-contact-tamtam.svg"
        height={height}
        width={width}
        layout="fixed"
        loading="eager"
        className={classname}
      />
    </Link>
  );
};

export default ContacImg;
