export const SMS_GROUP_OPTION = [
  {
    label: 'Admin',
    options: [
      { value: 'admin-statusChangeOrder', label: 'Status Change Order' },
      { value: 'admin-refundOrder', label: 'Refund Order' },
      { value: 'admin-paymentOrder', label: 'Payment ' },
      { value: 'admin-paymentSubscription', label: 'Subscription Payment' },
    ],
  },
  {
    label: 'Store Owner',
    options: [
      { value: 'vendor-statusChangeOrder', label: 'Status Change Order' },
      { value: 'vendor-refundOrder', label: 'Refund Order' },
      { value: 'vendor-paymentOrder', label: 'Payment ' },
      { value: 'vendor-paymentSubscription', label: 'Subscription Payment' },
    ],
  },
  {
    label: 'Customer',
    options: [

      { value: 'customer-statusChangeOrder', label: 'Status Change Order' },
      { value: 'customer-refundOrder', label: 'Refund Order' },
      { value: 'customer-paymentOrder', label: 'Payment ' },
    ],
  },
];
export const EMAIL_GROUP_OPTION = [
  {
    label: 'Admin',
    options: [
      { value: 'admin-statusChangeOrder', label: 'Status Change Order' },
      { value: 'admin-refundOrder', label: 'Refund Order' },
      { value: 'admin-paymentOrder', label: 'Payment ' },
      { value: 'admin-paymentSubscription', label: 'Subscription Payment' },

    ],
  },
  {
    label: 'Store Owner',
    options: [
      { value: 'vendor-statusChangeOrder', label: 'Status Change Order' },
      { value: 'vendor-refundOrder', label: 'Refund Order' },
      { value: 'vendor-paymentOrder', label: 'Payment ' },
      { value: 'vendor-paymentSubscription', label: 'Subscription Payment' },
      { value: 'vendor-createQuestion', label: 'Create Question' },
      { value: 'vendor-createReview', label: 'Create Review' },
    ],
  },
  {
    label: 'Customer',
    options: [
      { value: 'customer-statusChangeOrder', label: 'Status Change Order' },
      { value: 'customer-refundOrder', label: 'Refund Order' },
      { value: 'customer-paymentOrder', label: 'Payment ' },
      { value: 'customer-answerQuestion', label: 'Answer Question' },
    ],
  },
];

export const IN_APP_GROUP_OPTION = [
  {
    label: 'Admin',
    options: [
      { value: 'admin-paymentSubscription', label: 'Subscription Payment' },
    ],
  },
  {
    label: 'Store Owner',
    options: [
      { value: 'vendor-paymentSubscription', label: 'Subscription Payment' },
    ],
  },
];
