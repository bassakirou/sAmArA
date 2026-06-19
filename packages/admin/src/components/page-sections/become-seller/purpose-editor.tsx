import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useFieldArray } from 'react-hook-form';
import PageSectionEditor from '../shared/page-section-editor';

export default function PurposeEditor({ control, register }: any) {
  const name = 'sections.purpose';
  const items = useFieldArray({ control, name: `${name}.data.items` as any });
  return (
    <PageSectionEditor
      title="Pourquoi vendre sur sAmArA"
      details="Arguments et avantages pour convaincre les vendeurs."
      name={name}
      control={control}
      register={register}
    >
      <Input label="Titre" {...register(`${name}.data.title`)} variant="outline" className="mb-5" />
      <TextArea label="Description" {...register(`${name}.data.description`)} variant="outline" className="mb-5" />
      {items.fields.map((field, index) => (
        <div key={field.id} className="mb-6 rounded border border-dashed border-gray-300 p-4">
          <Input label="Titre" {...register(`${name}.data.items.${index}.title`)} variant="outline" className="mb-5" />
          <TextArea label="Description" {...register(`${name}.data.items.${index}.description`)} variant="outline" className="mb-5" />
          <Input label="Nom de l'icone" {...register(`${name}.data.items.${index}.icon`)} variant="outline" className="mb-5" />
          <button type="button" className="text-sm text-red-500" onClick={() => items.remove(index)}>
            Supprimer
          </button>
        </div>
      ))}
      <Button type="button" onClick={() => items.append({ title: '', description: '', icon: '' })}>
        Ajouter un avantage
      </Button>
    </PageSectionEditor>
  );
}
