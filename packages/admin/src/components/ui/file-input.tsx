import Uploader from '@/components/common/uploader';
import cn from 'classnames';
import { Controller } from 'react-hook-form';

interface FileInputProps {
  className?: string;
  control: any;
  name: string;
  multiple?: boolean;
  acceptFile?: boolean;
  accept?: string;
  helperText?: string;
  defaultValue?: any;
}

const FileInput = ({
  className,
  control,
  name,
  multiple = true,
  acceptFile = false,
  accept,
  helperText,
  defaultValue = [],
}: FileInputProps) => {
  return (
    <div className={cn('mb-4', className)}>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue}
        render={({ field: { ref, ...rest } }) => (
          <Uploader
            {...rest}
            multiple={multiple}
            acceptFile={acceptFile}
            accept={accept}
            helperText={helperText}
          />
        )}
      />
    </div>
  );
};

export default FileInput;
