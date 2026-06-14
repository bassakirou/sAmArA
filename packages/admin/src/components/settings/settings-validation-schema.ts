import * as yup from 'yup';

export const settingsValidationSchema = yup.object().shape({
  currency: yup.object().nullable().required('form:error-currency-required'),
  // maximumQuestionLimit: yup
  //   .number()
  //   .positive()
  //   .required('form:error-maximum-question-limit')
  //   .typeError('form:error-maximum-question-limit'),
  currencyOptions: yup.object().shape({
    fractions: yup
      .number()
      .min(0, 'Fractional must be non-negative')
      .max(5, 'Fractional number can not be grater than 5')
      .transform((value) => (isNaN(value) ? undefined : value))
      .typeError('form:error-fractions-must-be-number')
      .required('form:error-currency-number of decimals-required'),
  }),
  minimumOrderAmount: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .moreThan(-1, 'form:error-sale-price-must-positive')
    .typeError('form:error-amount-number'),
  freeShippingAmount: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .moreThan(-1, 'form:error-free-shipping-amount-must-positive')
    .typeError('form:error-amount-number'),
  deliveryTime: yup
    .array()
    .of(
      yup.object().shape({
        title: yup.string().required('form:error-title-required'),
      })
    )
    .default([]),
});
