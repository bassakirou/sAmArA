import * as yup from "yup";
import isEmpty from "lodash/isEmpty";

export const typeValidationSchema = yup.object().shape({
  name: yup.string().required("form:error-name-required"),
  images: yup
    .array()
    .min(1, 'form:add-at-least-one-image')
    .of(
      yup.object().shape({
        key: yup
          .object()
          .test(
            'not-empty-object',
            'form:text-select-layout',
            (value) => !!value && !isEmpty(value)
          ),
        image: yup.array().min(1, "form:error-min-one-image")
      })
    )
});
