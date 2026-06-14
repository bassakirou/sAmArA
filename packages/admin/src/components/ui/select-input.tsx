import cn from 'classnames';
import React, { useMemo, useState } from 'react';
import Select from '@/components/ui/select/select';
import CreatableSelect from '@/components/ui/select/creatable-select';
import { Controller } from 'react-hook-form';
import { GetOptionLabel } from 'react-select';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

interface SelectInputProps {
  className?: string;
  control: any;
  rules?: any;
  label?: string;
  error?: string;
  name: string;
  options: object[];
  getOptionLabel?: GetOptionLabel<unknown>;
  getOptionValue?: GetOptionLabel<unknown>;
  isMulti?: boolean;
  isClearable?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  isCreatable?: boolean;
  onCreateOption?: (inputValue: string) => void | Promise<void>;
  formatCreateLabel?: (inputValue: string) => string;
  [key: string]: unknown;
  placeholder?: string;
}

const SelectInput = React.forwardRef<HTMLDivElement, SelectInputProps>(
  (
    {
      className,
      control,
      options,
      name,
      rules,
      label,
      error,
      getOptionLabel,
      getOptionValue,
      disabled,
      isMulti,
      isClearable,
      isLoading,
      isCreatable,
      onCreateOption,
      formatCreateLabel,
      placeholder,
      ...rest
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');

    const normalizedInput = useMemo(
      () => inputValue.trim().toLowerCase(),
      [inputValue]
    );

    const optionAlreadyExists = useMemo(() => {
      if (!isCreatable) return false;
      if (!normalizedInput) return false;
      return (options ?? []).some((opt: any) => {
        const label = getOptionLabel
          ? String(getOptionLabel(opt as any))
          : String(opt?.label ?? opt?.name ?? '');
        return label.trim().toLowerCase() === normalizedInput;
      });
    }, [getOptionLabel, isCreatable, normalizedInput, options]);

    return (
      <div ref={ref} className={cn('mb-4', className)}>
        {label ? (
          <label className="mb-3 block text-sm font-semibold leading-none text-body-dark">
            {label}
          </label>
        ) : null}
        <Controller
          control={control}
          name={name}
          rules={rules}
          {...rest}
          render={({ field }) =>
            isCreatable ? (
              <CreatableSelect
                {...field}
                inputValue={inputValue}
                onInputChange={(next: any, meta: any) => {
                  if (meta?.action === 'input-change') {
                    setInputValue(String(next ?? ''));
                  }
                  if (
                    meta?.action === 'set-value' ||
                    meta?.action === 'menu-close'
                  ) {
                    setInputValue('');
                  }
                  return next;
                }}
                onKeyDown={async (e: any) => {
                  if (e.key !== 'Enter') return;
                  const nextValue = inputValue.trim();
                  if (!nextValue) return;
                  if (optionAlreadyExists) {
                    e.preventDefault();
                    toast.error(t('common:inline-create-already-exists'));
                    return;
                  }
                  if (!onCreateOption) return;
                  e.preventDefault();
                  await onCreateOption(nextValue);
                  setInputValue('');
                }}
                onCreateOption={async (nextValue: string) => {
                  const trimmed = String(nextValue ?? '').trim();
                  if (!trimmed) return;
                  if (optionAlreadyExists) {
                    toast.error(t('common:inline-create-already-exists'));
                    return;
                  }
                  if (!onCreateOption) return;
                  await onCreateOption(trimmed);
                  setInputValue('');
                }}
                isValidNewOption={(val: any) => {
                  const next = String(val ?? '')
                    .trim()
                    .toLowerCase();
                  if (!next) return false;
                  return !(options ?? []).some((opt: any) => {
                    const label = getOptionLabel
                      ? String(getOptionLabel(opt as any))
                      : String(opt?.label ?? opt?.name ?? '');
                    return label.trim().toLowerCase() === next;
                  });
                }}
                formatCreateLabel={
                  formatCreateLabel ??
                  ((val: string) => `${t('common:text-create')} "${val}"`)
                }
                getOptionLabel={getOptionLabel}
                getOptionValue={getOptionValue}
                placeholder={placeholder}
                isMulti={isMulti}
                isClearable={isClearable}
                isLoading={isLoading}
                options={options}
                isDisabled={disabled as boolean}
              />
            ) : (
              <Select
                {...field}
                getOptionLabel={getOptionLabel}
                getOptionValue={getOptionValue}
                placeholder={placeholder}
                isMulti={isMulti}
                isClearable={isClearable}
                isLoading={isLoading}
                options={options}
                isDisabled={disabled as boolean}
              />
            )
          }
        />
        {error ? (
          <p className="my-2 text-xs text-red-500 text-start">{error}</p>
        ) : null}
      </div>
    );
  }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;
