
interface ProductsProps {
    tree: any[]
}

const Sitemap: React.FC<ProductsProps> = ({
    tree
}) => {
    return (
        <div className="container px-30 py-10 bg-gray-100 flex justify-center">
            <div className="w-28 flex justify-center items-center  flex-col">
                <div className="h-12 w-full border-2 rounded-lg border-olive shadow-2xl border-solid flex justify-center items-center hover:text-white transition hover:bg-maroon hover:border-none hover:scale-x-110">
                    <h1 className="font-bold">
                        Home
                    </h1>
                </div>
                <div className="h-12 w-0.5 bg-olive"></div>
                <div className="w-12 h-0.5 bg-olive"></div>
        
            </div>
            <div className="grow h-6 border-b-2 border-olive border-solid "></div>
            <div className="h-24 w-28 flex justify-center items-center  flex-col">
                <div className="h-12 w-full border-2 rounded-lg border-olive shadow-2xl border-solid flex justify-center items-center hover:text-white transition hover:bg-maroon hover:border-none hover:scale-x-110">
                    <h1 className="font-bold">
                        Home
                    </h1>
                </div>
                <div className="h-12 w-0.5 bg-olive"></div>
            </div>

            <div className="grow h-6 border-b-2 border-olive border-solid "></div>
            <div className="h-24 w-28 flex justify-center items-center  flex-col">
                <div className="h-12 w-full border-2 rounded-lg border-olive shadow-2xl border-solid flex justify-center items-center hover:text-white transition hover:bg-maroon hover:border-none hover:scale-x-110">
                    <h1 className="font-bold">
                        Home
                    </h1>
                </div>
            </div>

        </div>
    );
};

export default Sitemap;
