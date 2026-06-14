import * as yup from 'yup';

export const shopValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  balance: yup.object().shape({
    payment_info: yup.object().shape({
      email: yup
        .string()
        .typeError('form: error-email-string')
        .email('form:error-email-format'),
      orange_money_phone: yup.string().nullable(),
      mobile_money_phone: yup.string().nullable(),
    }).test(
      'payment-phone-required',
      'form:error-payment-number-required',
      function (value) {
        const orange = value?.orange_money_phone;
        const mobile = value?.mobile_money_phone;
        if (orange || mobile) return true;
        return this.createError({
          path: `${this.path}.mobile_money_phone`,
          message: 'form:error-payment-number-required',
        });
      }
    ),
  }),
});
