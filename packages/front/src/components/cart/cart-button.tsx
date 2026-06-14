import CartImg from '@components/icons/cart-img';
import { useUI } from '@contexts/ui.context';
import { useCart } from '@store/quick-cart/cart.context';

const CartButton = () => {
  const { openCart } = useUI();
  const { totalItems } = useCart();
  function handleCartOpen() {
    return openCart();
  }

  return (
    <button
      className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none transform"
      onClick={handleCartOpen}
      aria-label="cart-button"
    >
      <CartImg />
      <span className="cart-counter-badge flex items-center justify-center bg-heading text-white absolute -top-3.5 ltr:-right-2.5 ltr:xl:-right-3.5 rtl:-left-2.5 rtl:xl:-left-3 rounded-full font-bold">
        {totalItems}
      </span>
    </button>
  );
};

export default CartButton;
