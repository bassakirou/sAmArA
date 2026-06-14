import React from 'react';
import PhoneInputBase, { PhoneInputProps } from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';

type Props = PhoneInputProps & {
  country?: string;
};

const PhoneInput = ({ country, ...props }: Props) => {
  return <PhoneInputBase {...props} country={country ?? 'cm'} />;
};

export default PhoneInput;
