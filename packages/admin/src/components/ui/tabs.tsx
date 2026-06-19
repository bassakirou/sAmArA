import { Fragment } from 'react';
import { Tab } from '@headlessui/react';
import cn from 'classnames';

interface TabItem {
  title: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  variant?: 'underline' | 'pill';
  selectedIndex?: number;
  onChange?: (index: number) => void;
}

export default function Tabs({
  tabs,
  variant = 'underline',
  selectedIndex,
  onChange,
}: TabsProps) {
  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={onChange}>
      <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab, index) => (
          <Tab as={Fragment} key={index}>
            {({ selected }) => (
              <button
                type="button"
                className={cn(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-white'
                )}
              >
                {tab.title}
              </button>
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-2">
        {tabs.map((tab, idx) => (
          <Tab.Panel
            key={idx}
            unmount={false}
            className={cn(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {tab.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}
