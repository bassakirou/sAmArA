import { SearchIcon } from '@/components/icons/search-icon';
import cn from 'classnames';
import { CloseIcon } from '@/components/icons/close-icon';
import { useTranslation } from 'next-i18next';

interface Props {
  className?: string;
  onChange: any;
  value: string;
  clear: any;
}

const UserBoxHeaderView = ({
  className,
  onChange,
  value,
  clear,
  ...rest
}: Props) => {
  const { t } = useTranslation();
  return (
    <>
      <form
        className={cn(
          'border-b border-solid border-b-[#E5E7EB] bg-white px-4 py-3 sm:px-5 sm:py-4',
          className
        )}
        {...rest}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="relative flex h-11 items-center sm:h-12">
          <input
            type="text"
            name="search"
            value={value}
            onChange={onChange}
            className="h-full w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-4 pr-12 text-sm text-heading outline-none transition focus:border-accent focus:bg-white"
            placeholder={t('text-input-search')}
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-1 flex items-center justify-center">
            {!!value ? (
              <button
                type="button"
                onClick={clear}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-[#EEF2F7] hover:text-heading"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center text-[#9CA3AF]">
                <SearchIcon height={15} width={16} />
              </span>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

export default UserBoxHeaderView;
