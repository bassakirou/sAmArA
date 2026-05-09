import Link from "@components/ui/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInOut } from "@utils/motion/fade-in-out";
import { IoIosCloseCircle } from "react-icons/io";
import { ROUTES } from "@lib/routes";
import { generateCartItemName } from "@utils/generate-cart-item-name";
import { useBookmark } from "@store/bookmarks/bookmark.context";

type Props = {
	item: any;
};

const BookmarkItem: React.FC<Props> = ({ item }) => {
	const { removeItemFromBookmark } = useBookmark();


	return (
		<motion.div
			layout
			initial="from"
			animate="to"
			exit="from"
			variants={fadeInOut(0.25)}
			className={`group w-full h-auto flex justify-start items-center bg-white py-4 md:py-7 border-b border-gray-100 relative last:border-b-0`}
			title={item?.name}
		>
			<div className="relative flex w-24 md:w-28 h-24 md:h-28 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer ltr:mr-4 rtl:ml-4">
				<Image
					src={item?.image ?? "/assets/placeholder/cart-item.svg"}
					width={112}
					height={112}
					loading="eager"
					alt={item.name || "Product Image"}
					className="bg-gray-300 object-cover"
				/>
				<div
					className="absolute top-0 ltr:left-0 rtl:right-0 h-full w-full bg-black bg-opacity-30 md:bg-opacity-0 flex justify-center items-center transition duration-200 ease-in-out md:group-hover:bg-opacity-30"
					onClick={() => removeItemFromBookmark(item.id)}
					role="button"
				>
					<IoIosCloseCircle className="relative text-white text-2xl transform md:scale-0 md:opacity-0 transition duration-300 ease-in-out md:group-hover:scale-100 md:group-hover:opacity-100" />
				</div>
			</div>

			<div className="flex flex-col w-full overflow-hidden">
				<Link
					href={`${ROUTES.PRODUCT}/${item?.slug}`}
					className="truncate text-sm text-heading mb-1.5 -mt-1"
				>
					{generateCartItemName(item.name, item.attributes)}
				</Link>
		
			</div>
		</motion.div>
	);
};

export default BookmarkItem;
