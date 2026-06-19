import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import PageSectionEditor from '../shared/page-section-editor';

export default function BannerEditor({ control, register }: any) {
  const name = 'sections.banner';
  return (
    <PageSectionEditor
      title="Banner"
      details="Contenu principal affiche en haut de la page."
      name={name}
      control={control}
      register={register}
    >
      <Input label="Titre du ticker" {...register(`${name}.data.newsTickerTitle`)} variant="outline" className="mb-5" />
      <Input label="Lien du ticker" {...register(`${name}.data.newsTickerURL`)} variant="outline" className="mb-5" />
      <Input label="Titre" {...register(`${name}.data.title`)} variant="outline" className="mb-5" />
      <TextArea label="Description" {...register(`${name}.data.description`)} variant="outline" className="mb-5" />
      <Input label="Nom bouton principal" {...register(`${name}.data.button1Name`)} variant="outline" className="mb-5" />
      <Input label="Lien bouton principal" {...register(`${name}.data.button1Link`)} variant="outline" className="mb-5" />
      <Input label="Nom bouton secondaire" {...register(`${name}.data.button2Name`)} variant="outline" className="mb-5" />
      <Input label="Lien bouton secondaire" {...register(`${name}.data.button2Link`)} variant="outline" className="mb-5" />
      <FileInput name={`${name}.data.image`} control={control} multiple={false} />
    </PageSectionEditor>
  );
}
