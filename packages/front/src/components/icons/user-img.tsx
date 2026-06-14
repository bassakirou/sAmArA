import Image from 'next/image';

const UserImg = ({ width = 35, height = 35 }) => {
  return (
    <Image
      src="/assets/images/icons/samara-connexion-user.svg"
      height={height}
      width={width}
      layout="fixed"
      alt={''}
      loading="eager"
    />
  );
};

export default UserImg;
