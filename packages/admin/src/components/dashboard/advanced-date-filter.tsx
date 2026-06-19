import { Fragment, useEffect, useMemo, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import cn from 'classnames';
import { DatePicker } from '@/components/ui/date-picker';
import { CalendarIcon } from '@/components/icons/calendar';

dayjs.extend(isoWeek);

type Preset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'
  | 'all_time'
  | 'custom';

export type AdvancedDateFilterValue = {
  preset: Preset;
  startDate: Date | null;
  endDate: Date | null;
};

type Props = {
  value: AdvancedDateFilterValue;
  onApply: (next: AdvancedDateFilterValue) => void;
  minDate?: Date;
  maxDate?: Date;
};

function getPresetRange(preset: Preset, minDate?: Date, maxDate?: Date) {
  const now = new Date();
  const d = dayjs(now);

  if (preset === 'today') {
    return [d.startOf('day').toDate(), d.endOf('day').toDate()] as const;
  }
  if (preset === 'yesterday') {
    const y = d.subtract(1, 'day');
    return [y.startOf('day').toDate(), y.endOf('day').toDate()] as const;
  }
  if (preset === 'this_week') {
    return [d.startOf('isoWeek').toDate(), d.endOf('isoWeek').toDate()] as const;
  }
  if (preset === 'last_week') {
    const w = d.subtract(1, 'week');
    return [w.startOf('isoWeek').toDate(), w.endOf('isoWeek').toDate()] as const;
  }
  if (preset === 'this_month') {
    return [d.startOf('month').toDate(), d.endOf('month').toDate()] as const;
  }
  if (preset === 'last_month') {
    const m = d.subtract(1, 'month');
    return [m.startOf('month').toDate(), m.endOf('month').toDate()] as const;
  }
  if (preset === 'this_year') {
    return [d.startOf('year').toDate(), d.endOf('year').toDate()] as const;
  }
  if (preset === 'last_year') {
    const y = d.subtract(1, 'year');
    return [y.startOf('year').toDate(), y.endOf('year').toDate()] as const;
  }
  if (preset === 'all_time') {
    const from = minDate ? dayjs(minDate).startOf('day').toDate() : null;
    const to = maxDate ? dayjs(maxDate).endOf('day').toDate() : new Date();
    return [from, to] as const;
  }
  return [null, null] as const;
}

function formatLabel(startDate: Date | null, endDate: Date | null) {
  if (!startDate && !endDate) return 'Toutes dates';
  if (startDate && !endDate) return `${dayjs(startDate).format('YYYY-MM-DD')} -> ...`;
  if (!startDate && endDate) return `... -> ${dayjs(endDate).format('YYYY-MM-DD')}`;
  return `${dayjs(startDate).format('YYYY-MM-DD')} -> ${dayjs(endDate).format(
    'YYYY-MM-DD'
  )}`;
}

function formatFooterDate(date: Date | null) {
  return date ? dayjs(date).format('YYYY-MM-DD') : 'Date';
}

const PRESETS: Array<{ key: Exclude<Preset, 'custom'>; label: string }> = [
  { key: 'today', label: 'Aujourd’hui' },
  { key: 'yesterday', label: 'Hier' },
  { key: 'this_week', label: 'Cette semaine' },
  { key: 'last_week', label: 'Semaine derniere' },
  { key: 'this_month', label: 'Ce mois' },
  { key: 'last_month', label: 'Mois dernier' },
  { key: 'this_year', label: 'Cette annee' },
  { key: 'last_year', label: 'Annee derniere' },
  { key: 'all_time', label: 'Toutes dates' },
];

export default function AdvancedDateFilter({
  value,
  onApply,
  minDate,
  maxDate,
}: Props) {
  const [draftPreset, setDraftPreset] = useState<Preset>(value.preset);
  const [draftRange, setDraftRange] = useState<[Date | null, Date | null]>([
    value.startDate,
    value.endDate,
  ]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setDraftPreset(value.preset);
    setDraftRange([value.startDate, value.endDate]);
  }, [value.endDate, value.preset, value.startDate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(max-width: 639px)');
    const handleChange = () => setIsMobile(media.matches);

    handleChange();
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const label = useMemo(
    () => formatLabel(value.startDate, value.endDate),
    [value.endDate, value.startDate]
  );

  const handlePresetClick = (preset: Exclude<Preset, 'custom'>) => {
    setDraftPreset(preset);
    const [startDate, endDate] = getPresetRange(preset, minDate, maxDate);
    setDraftRange([startDate, endDate]);
  };

  return (
    <>
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={cn(
                'flex items-center gap-2 rounded border border-border-200 bg-light px-3 py-2 text-sm text-heading shadow-sm transition hover:bg-gray-50',
                open ? 'ring-1 ring-accent' : ''
              )}
            >
              <CalendarIcon className="h-4 w-4 text-muted" />
              <span className="whitespace-nowrap">{label}</span>
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="advanced-date-filter-panel absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded border border-border-200 bg-light shadow-lg sm:w-[52rem]">
                <div className="flex flex-col sm:flex-row">
                  <div className="hidden w-52 border-r border-border-200 bg-gray-50 p-3 sm:block">
                    <div className="space-y-1">
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => handlePresetClick(preset.key)}
                          className={cn(
                            'w-full rounded px-2 py-2 text-left text-sm transition',
                            draftPreset === preset.key
                              ? 'bg-accent text-white'
                              : 'text-body hover:bg-gray-100'
                          )}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <div className="mb-3 flex flex-wrap gap-2 border-b border-border-200 pb-3 sm:hidden">
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => handlePresetClick(preset.key)}
                          className={cn(
                            'rounded px-2.5 py-1.5 text-sm transition',
                            draftPreset === preset.key
                              ? 'bg-accent text-white'
                              : 'bg-gray-50 text-body hover:bg-gray-100'
                          )}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="advanced-date-filter-calendar overflow-hidden rounded border border-border-200">
                      <DatePicker
                        inline
                        selectsRange
                        monthsShown={isMobile ? 1 : 2}
                        startDate={draftRange[0]}
                        endDate={draftRange[1]}
                        minDate={minDate}
                        maxDate={maxDate}
                        onChange={(update: [Date | null, Date | null]) => {
                          setDraftPreset('custom');
                          setDraftRange(update);
                        }}
                      />
                    </div>

                    <div className="mt-3 flex flex-col gap-3 border-t border-border-200 pt-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="text-sm font-medium text-body-dark">
                          Plage personnalisee
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="min-w-[8.5rem] rounded border border-border-200 bg-gray-50 px-3 py-2 text-sm text-heading">
                            {formatFooterDate(draftRange[0])}
                          </div>
                          <span className="text-sm text-body">-</span>
                          <div className="min-w-[8.5rem] rounded border border-border-200 bg-gray-50 px-3 py-2 text-sm text-heading">
                            {formatFooterDate(draftRange[1])}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDraftPreset(value.preset);
                            setDraftRange([value.startDate, value.endDate]);
                            close();
                          }}
                          className="rounded border border-border-200 bg-light px-4 py-2 text-sm font-semibold text-body hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onApply({
                              preset: draftPreset,
                              startDate: draftRange[0],
                              endDate: draftRange[1],
                            });
                            close();
                          }}
                          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
                        >
                          Appliquer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>

      <style jsx global>{`
        .advanced-date-filter-panel .react-datepicker {
          display: flex;
          width: 100%;
          border: 0;
          font-family: inherit;
        }

        .advanced-date-filter-panel .react-datepicker__month-container {
          float: none;
          flex: 1 1 0%;
          min-width: 0;
          padding: 0.75rem;
        }

        .advanced-date-filter-panel .react-datepicker__header {
          background: transparent;
          border-bottom: 0;
          padding-top: 0.25rem;
        }

        .advanced-date-filter-panel .react-datepicker__month {
          margin: 0.5rem 0 0;
        }

        .advanced-date-filter-panel .react-datepicker__day-names,
        .advanced-date-filter-panel .react-datepicker__week {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
        }

        .advanced-date-filter-panel .react-datepicker__day,
        .advanced-date-filter-panel .react-datepicker__day-name {
          width: 100%;
          margin: 0;
          line-height: 2.25rem;
          text-align: center;
        }

        .advanced-date-filter-panel .react-datepicker__navigation {
          top: 1rem;
        }

        @media (max-width: 639px) {
          .advanced-date-filter-panel .react-datepicker {
            display: block;
          }

          .advanced-date-filter-panel .react-datepicker__month-container {
            width: 100%;
            padding: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}
