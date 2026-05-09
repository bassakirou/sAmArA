import { getLayout } from "@components/layout/layout";
import AccountLayout from "@components/my-account/account-layout";
import Scrollbar from '@components/common/scrollbar';
import { useTranslation } from "next-i18next";
import { useBookmark } from "@store/bookmarks/bookmark.context";
import BookmarkItem from "@components/bookmark/bookmark-item";
import { motion } from "framer-motion";
import EmptyCart from "@components/cart/empty-cart";
import { fadeInOut } from "@utils/motion/fade-in-out";

export { getStaticProps } from "@framework/common.ssr";

export default function BookmarkTablePage() {
    const { t } = useTranslation();
    const { items, isEmpty } = useBookmark();



    return (
        <AccountLayout>
            <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-heading mb-6 xl:mb-8">
                {t("common:text-bookmark")}
            </h2>
            {!isEmpty ? (
                <Scrollbar className="flex-grow w-full cart-scrollbar">
                    <div className="w-full px-5 md:px-7">
                        {items?.map((item) => (
                            <BookmarkItem item={item} key={item.id} />
                        ))}
                    </div>
                </Scrollbar>
            ) : (
                <motion.div
                    layout
                    initial="from"
                    animate="to"
                    exit="from"
                    variants={fadeInOut(0.25)}
                    className="flex flex-col items-center justify-center px-5 pt-8 pb-5 md:px-7"
                >
                    <EmptyCart />
                    <h3 className="pt-8 text-lg font-bold text-heading">
                        {t('text-empty-cart')}
                    </h3>
                </motion.div>)}\
        </AccountLayout>
    );
}

BookmarkTablePage.authenticate = true;
BookmarkTablePage.getLayout = getLayout;
