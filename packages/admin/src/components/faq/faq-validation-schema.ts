import * as yup from 'yup';

export const faqValidationSchema = yup.object().shape({
  title: yup.string().required('form:error-title-required'),
  description: yup.string().required('form:error-description-required'),
  type: yup.object().nullable().required('form:error-type-required'),
});

