import React, { useState } from 'react';
import Input, { InputProps } from '@/components/ui/input';
import { EyeIcon } from '@/components/icons/eye-icon';
import { EyeOffIcon } from '@/components/icons/eye-off-icon';

export interface PasswordInputProps extends InputProps {
  forgotPassHelpText?: string;
  forgotPageLink?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const { label, error, forgotPassHelpText, forgotPageLink, className, ...rest } = props;
    const [show, setShow] = useState(false);

    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          <label
            htmlFor={rest.name}
            className="text-sm font-semibold leading-none text-body-dark"
          >
            {label}
          </label>

          {forgotPageLink && forgotPassHelpText && (
            <a
              href={forgotPageLink}
              className="text-xs text-accent transition-colors duration-200 focus:outline-none focus:text-accent-700 hover:text-accent-hover"
            >
              {forgotPassHelpText}
            </a>
          )}
        </div>
        <Input
          {...rest}
          error={error}
          showLabel={false}
          type={show ? 'text' : 'password'}
          ref={ref}
        >
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShow((prev) => !prev)}
          >
            {show ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </Input>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
