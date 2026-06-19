import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import SwitchInput from '@/components/ui/switch-input';
import { ReactNode } from 'react';

export type PageSectionEditorProps = {
  title: string;
  details: string;
  name: string;
  control: any;
  register: any;
  children: ReactNode;
};

export default function PageSectionEditor({
  title,
  details,
  name,
  control,
  register,
  children,
}: PageSectionEditorProps) {
  return (
    <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
      <Description
        title={title}
        details={details}
        className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
      />
      <Card className="w-full sm:w-8/12 md:w-2/3">
        <div className="mb-6 grid gap-5 md:grid-cols-2">
          <Input
            label="Ordre d'affichage"
            type="number"
            min={1}
            {...register(`${name}.meta.order`, { valueAsNumber: true })}
            variant="outline"
          />
          <div className="flex items-end">
            <SwitchInput
              name={`${name}.meta.enabled`}
              control={control}
              label="Activer/Desactiver la section"
            />
          </div>
        </div>
        {children}
      </Card>
    </div>
  );
}
