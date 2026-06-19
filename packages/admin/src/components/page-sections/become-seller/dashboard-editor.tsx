import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import PageSectionEditor from '../shared/page-section-editor';

export default function DashboardEditor({ control, register }: any) {
  const name = 'sections.dashboard';
  return (
    <PageSectionEditor
      title="Apercu du dashboard"
      details="Mettre en avant le tableau de bord vendeur."
      name={name}
      control={control}
      register={register}
    >
      <Input label="Titre" {...register(`${name}.data.title`)} variant="outline" className="mb-5" />
      <TextArea label="Description" {...register(`${name}.data.description`)} variant="outline" className="mb-5" />
      <Input label="Nom du bouton" {...register(`${name}.data.buttonName`)} variant="outline" className="mb-5" />
      <Input label="Lien du bouton" {...register(`${name}.data.buttonLink`)} variant="outline" className="mb-5" />
      <FileInput name={`${name}.data.image`} control={control} multiple={false} />
    </PageSectionEditor>
  );
}
