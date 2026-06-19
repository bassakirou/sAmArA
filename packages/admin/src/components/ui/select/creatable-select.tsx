import { useIsRTL } from '@/utils/locals';
import React from 'react';
import ReactCreatableSelect, { CreatableProps } from 'react-select/creatable';
import { selectStyles } from './select.styles';

export type Ref = any;

export const CreatableSelect = React.forwardRef<
  Ref,
  CreatableProps<any, boolean, any>
>((props, ref) => {
  const { isRTL } = useIsRTL();
  return (
    <ReactCreatableSelect
      ref={ref}
      styles={selectStyles}
      isRtl={isRTL}
      {...props}
    />
  );
});

CreatableSelect.displayName = 'CreatableSelect';

export default CreatableSelect;
