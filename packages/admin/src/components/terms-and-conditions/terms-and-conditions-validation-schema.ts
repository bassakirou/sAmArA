import * as yup from 'yup';

export const termsAndConditionsValidationSchema = yup.object().shape({
  title: yup.string().required('form:error-title-required'),
  description: yup.string().required('form:error-description-required'),
});

