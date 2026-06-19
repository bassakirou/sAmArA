import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import PageSectionEditor from '../shared/page-section-editor';

export default function ContactEditor({ control, register }: any) {
  const name = 'sections.contact';
  return (
    <PageSectionEditor
      title="Contact"
      details="Bloc de contact final de la page."
      name={name}
      control={control}
      register={register}
    >
      <Input label="Titre" {...register(`${name}.data.title`)} variant="outline" className="mb-5" />
      <TextArea label="Description" {...register(`${name}.data.description`)} variant="outline" className="mb-5" />
    </PageSectionEditor>
  );
}
