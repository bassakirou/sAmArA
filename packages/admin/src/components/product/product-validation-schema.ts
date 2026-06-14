import { ProductStatus, ProductType } from '@/types';
import * as yup from 'yup';

// fetch
// yup conditionnally
const SUPPORTED_IMAGE_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];

export const productValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  product_type: yup.object().required('form:error-product-type-required'),
  sku: yup.mixed().when(['product_type', 'status'], {
    is: (
      productType: {
        name: string;
        value: string;
        [key: string]: unknown;
      },
      status: string
    ) =>
      productType?.value === ProductType.Simple && status !== ProductStatus.Draft,
    then: yup.string().nullable().required('form:error-sku-required'),
  }),
  price: yup.mixed().when(['product_type', 'status'], {
    is: (
      productType: {
        name: string;
        value: string;
        [key: string]: unknown;
      },
      status: string
    ) =>
      productType?.value === ProductType.Simple && status !== ProductStatus.Draft,
    then: yup
      .number()
      .typeError('form:error-price-must-number')
      .positive('form:error-price-must-positive')
      .required('form:error-price-required'),
  }),
  sale_price: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .lessThan(yup.ref('price'), 'Sale Price should be less than ${less}')
    .positive('form:error-sale-price-must-positive'),
  quantity: yup.mixed().when(['product_type', 'status'], {
    is: (
      productType: {
        name: string;
        value: string;
        [key: string]: unknown;
      },
      status: string
    ) =>
      productType?.value === ProductType.Simple && status !== ProductStatus.Draft,
    then: yup
      .number()
      .typeError('form:error-quantity-must-number')
      .positive('form:error-quantity-must-positive')
      .integer('form:error-quantity-must-integer')
      .required('form:error-quantity-required'),
  }),
  unit: yup.string().required('form:error-unit-required'),
  type: yup.object().nullable(),
  status: yup.string().nullable().required('form:error-status-required'),
  is_negotiable: yup.boolean(),
  variation_options: yup.array().of(
    yup.object().shape({
      price: yup
        .number()
        .typeError('form:error-price-must-number')
        .positive('form:error-price-must-positive')
        .required('form:error-price-required'),
      sale_price: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .lessThan(yup.ref('price'), 'Sale Price should be less than ${less}')
        .positive('form:error-sale-price-must-positive'),
      quantity: yup
        .number()
        .typeError('form:error-quantity-must-number')
        .positive('form:error-quantity-must-positive')
        .integer('form:error-quantity-must-integer')
        .required('form:error-quantity-required'),
      sku: yup.string().required('form:error-sku-required'),
      digital_file_input: yup.mixed().when(['is_digital', 'status'], (isDigital, status) => {
        if (status !== ProductStatus.Draft && isDigital) {
          return yup
            .object()
            .test(
              'check-digital-file',
              'form:error-digital-file-input-required',
              (file) => file && file?.original
            );
        }
        return yup.string().nullable();
      }),
    })
  ),
  digital_file_input: yup.mixed().when(['is_digital', 'status'], (isDigital, status) => {
    if (status !== ProductStatus.Draft && isDigital) {
      return yup
        .object()
        .test(
          'check-digital-file',
          'form:error-digital-file-input-required',
          (file) => file && file?.original
        );
    }
    return yup.string().nullable();
  }),
  video: yup
    .array()
    .max(1)
    .of(
      yup.object().shape({
        source: yup.mixed().nullable(),
        url: yup.string().when('source', {
          is: (source: any) => (source?.value ?? source) !== 'upload',
          then: yup.string().required('form:error-video-url-required'),
          otherwise: yup.string().nullable(),
        }),
        file: yup.mixed().when('source', {
          is: (source: any) => (source?.value ?? source) === 'upload',
          then: yup
            .object()
            .test(
              'check-video-file',
              'form:error-video-file-required',
              (file) => file && (file as any)?.original
            ),
          otherwise: yup.mixed().nullable(),
        }),
      })
    ),
  // image: yup
  //   .mixed()
  //   .nullable()
  //   .required('A file is required')
  //   .test(
  //     'FILE_SIZE',
  //     'Uploaded file is too big.',
  //     (value) => !value || (value && value.size <= 1024 * 1024)
  //   )
  //   .test(
  //     'FILE_FORMAT',
  //     'Uploaded file has unsupported format.',
  //     (value) =>
  //       !value || (value && SUPPORTED_IMAGE_FORMATS.includes(value?.type))
  //   ),
});
