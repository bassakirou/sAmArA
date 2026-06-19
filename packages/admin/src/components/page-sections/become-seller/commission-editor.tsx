import Button from '@/components/ui/button';
import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useFieldArray } from 'react-hook-form';
import PageSectionEditor from '../shared/page-section-editor';

export default function CommissionEditor({ control, register }: any) {
  const name = 'sections.commission';
  const items = useFieldArray({ control, name: `${name}.data.items` as any });
  return (
    <PageSectionEditor
      title="Frais et commissions"
      details="Section sur les frais et niveaux de commission."
      name={name}
      control={control}
      register={register}
    >
      <Input label="Titre" {...register(`${name}.data.title`)} variant="outline" className="mb-5" />
      <TextArea label="Description" {...register(`${name}.data.description`)} variant="outline" className="mb-5" />
      <TextArea label="Texte par defaut des commissions" {...register(`${name}.data.defaultCommissionDetails`)} variant="outline" className="mb-5" />
      <Input label="Taux par defaut (%)" type="number" {...register(`${name}.data.defaultCommissionRate`)} variant="outline" className="mb-5" />
      {items.fields.map((field, index) => (
        <div key={field.id} className="mb-6 rounded border border-dashed border-gray-300 p-4">
          <Input label="Niveau" {...register(`${name}.data.items.${index}.level`)} variant="outline" className="mb-5" />
          <Input label="Sous-niveau" {...register(`${name}.data.items.${index}.sub_level`)} variant="outline" className="mb-5" />
          <TextArea label="Description" {...register(`${name}.data.items.${index}.description`)} variant="outline" className="mb-5" />
          <Input label="Solde min" type="number" {...register(`${name}.data.items.${index}.min_balance`)} variant="outline" className="mb-5" />
          <Input label="Solde max" {...register(`${name}.data.items.${index}.max_balance`)} variant="outline" className="mb-5" />
          <Input label="Commission (%)" type="number" {...register(`${name}.data.items.${index}.commission`)} variant="outline" className="mb-5" />
          <FileInput name={`${name}.data.items.${index}.image`} control={control} multiple={false} />
          <button type="button" className="text-sm text-red-500" onClick={() => items.remove(index)}>
            Supprimer
          </button>
        </div>
      ))}
      <Button type="button" onClick={() => items.append({ level: '', sub_level: '', description: '', min_balance: '', max_balance: '', commission: '', image: null })}>
        Ajouter un niveau
      </Button>
    </PageSectionEditor>
  );
}
