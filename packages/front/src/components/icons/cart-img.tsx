import Image from "next/image";

const CartImg = ({
	width = 50,
	height = 50,
}) => {
	return (
		<Image src="/assets/images/icons/samara-panier.svg"
				height={height}
				width={width}
				alt={""}
				layout="fixed"
				loading="eager"
			/>
	);
};

export default CartImg;