import { useUI } from "@contexts/ui.context";
import StripePaymentModal from '@components/payment/stripe/stripe-payment-modal';
import Modal from '@components/common/modal/modal';
import RazorpayPaymentModal from "@components/payment/razorpay/razorpay-payment-modal";
import TaramoneyPaymentModal from '@components/payment/taramoney/taramoney-payment-modal';
import CampayPaymentModal from '@components/payment/campay/campay-payment-modal';


const PAYMENTS_FORM_COMPONENTS: any = {
  STRIPE: {
    component: StripePaymentModal,
    type: 'custom',
  },  
  RAZORPAY: {
    component: RazorpayPaymentModal,
    type: 'default',
  },
  TARAMONEY: {
    component: TaramoneyPaymentModal,
    type: 'locked',
  },
  CAMPAY: {
    component: CampayPaymentModal,
    type: 'locked',
  },
};

const PaymentModal = () => {
  const {
    closeModal,
    displayModal,
    modalData: { paymentGateway, paymentIntentInfo, trackingNumber },
  } = useUI();
  const PaymentMethod =
    PAYMENTS_FORM_COMPONENTS[paymentGateway?.toUpperCase()];
  const PaymentComponent = PaymentMethod?.component;
  const paymentModalType = PaymentMethod?.type;
  if (paymentModalType === 'custom') {
    return (
      <Modal open={displayModal} onClose={closeModal}>
        <PaymentComponent
          paymentIntentInfo={paymentIntentInfo}
          trackingNumber={trackingNumber}
          paymentGateway={paymentGateway}
        />
      </Modal>
    );
  }

  if (paymentModalType === 'locked') {
    return (
      <Modal
        open={displayModal}
        onClose={closeModal}
        canClose={false}
        showCloseButton={false}
      >
        <PaymentComponent
          paymentIntentInfo={paymentIntentInfo}
          trackingNumber={trackingNumber}
          paymentGateway={paymentGateway}
        />
      </Modal>
    );
  }

  return (
    <PaymentComponent
      paymentIntentInfo={paymentIntentInfo}
      trackingNumber={trackingNumber}
      paymentGateway={paymentGateway}
    />
  );
};

export default PaymentModal;
