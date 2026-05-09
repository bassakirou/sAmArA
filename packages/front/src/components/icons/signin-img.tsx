import Image from "next/image";

const SignInImg = ({
	width = 50,
	height = 50,
}) => {
	return (
		<Image src="/assets/images/icons/samara-connexion.svg"
				height={height}
				width={width}
				alt={""}
				layout="fixed"
				loading="eager"
			/>
	);
};

export default SignInImg;