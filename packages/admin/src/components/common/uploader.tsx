import { UploadIcon } from '@/components/icons/upload-icon';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Attachment } from '@/types';
import { CloseIcon } from '@/components/icons/close-icon';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { useUploadMutation } from '@/data/upload';
import Image from 'next/image';
import { zipPlaceholder } from '@/utils/placeholders';
import { ACCEPTED_FILE_TYPES } from '@/utils/constants';
import { processFileWithName } from '../product/form-utils';

const getPreviewImage = (value: any) => {
  let images: any[] = [];
  if (value) {
    images = Array.isArray(value) ? value : [{ ...value }];
  }
  return images;
};

const IMAGE_EXTENSIONS = [
  'tif',
  'tiff',
  'bmp',
  'jpg',
  'jpeg',
  'gif',
  'png',
  'raw',
  'svg',
  'webp',
];

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'm4v'];

const getFileExtension = (file: any) => {
  const candidate =
    file?.file_name || file?.original || file?.thumbnail || file?.url || '';
  const cleanCandidate = String(candidate).split('?')[0];
  const segments = cleanCandidate.split('.');
  return String(segments.pop() ?? '').toLowerCase();
};

const getBestPreviewSrc = (file: any) => {
  return file?.thumbnail || file?.original || file?.url || null;
};

const getAbsoluteMediaSrc = (url: string | null) => {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return url;
    }
  } catch {
    const apiBaseUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
    if (apiBaseUrl && url.startsWith('/')) {
      return `${apiBaseUrl.replace(/\/+$/, '')}${url}`;
    }
  }

  return url;
};

const getProxiedMediaSrc = (url: string | null) => {
  const absoluteUrl = getAbsoluteMediaSrc(url);
  if (!absoluteUrl) return null;

  try {
    const parsed = new URL(absoluteUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return absoluteUrl;
    }

    return `/api/media-proxy?url=${encodeURIComponent(absoluteUrl)}`;
  } catch {
    return absoluteUrl;
  }
};

export default function Uploader({
  onChange,
  value,
  multiple,
  acceptFile,
  accept,
  helperText,
}: any) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<Attachment[]>(getPreviewImage(value));
  const { mutate: upload, isLoading: loading } = useUploadMutation();
  const [error, setError] = useState<string | null>(null);
  const wantsLargeVideoPreview =
    !multiple && typeof accept === 'string' && accept.includes('video');

  useEffect(() => {
    setFiles(getPreviewImage(value));
  }, [value]);
  const { getRootProps, getInputProps } = useDropzone({
    ...(accept
      ? { accept }
      : !acceptFile
      ? { accept: 'image/*' }
      : { accept: ACCEPTED_FILE_TYPES }),
    multiple,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length) {
        upload(
          acceptedFiles, // it will be an array of uploaded attachments
          {
            onSuccess: (data: any) => {
              // Process Digital File Name section
              data &&
                data?.map((file: any, idx: any) => {
                  const splitArray = file?.original?.split('/');
                  let fileSplitName =
                    splitArray[splitArray?.length - 1]?.split('.');
                  const fileType = fileSplitName?.pop(); // it will pop the last item from the fileSplitName arr which is the file ext
                  const filename = fileSplitName?.join('.'); // it will join the array with dot, which restore the original filename
                  data[idx]['file_name'] = filename + '.' + fileType;
                });

              let mergedData;
              if (multiple) {
                mergedData = files.concat(data);
                setFiles(files.concat(data));
              } else {
                mergedData = data[0];
                setFiles(data);
              }
              if (onChange) {
                onChange(mergedData);
              }
            },
          }
        );
      }
    },

    onDropRejected: (fileRejections) => {
      fileRejections.forEach((file) => {
        file?.errors?.forEach((error) => {
          if (error?.code === 'file-too-large') {
            setError(t('error-file-too-large'));
          } else if (error?.code === 'file-invalid-type') {
            setError(t('error-invalid-file-type'));
          }
        });
      });
    },
  });

  const handleDelete = (image: string) => {
    const images = files.filter(
      (file: any) => (file?.thumbnail || file?.original) !== image
    );
    setFiles(images);
    if (onChange) {
      onChange(images);
    }
  };
  const thumbs = files?.map((file: any, idx) => {
    if (file && file.id) {
      const fileType = getFileExtension(file);
      const displayNameSource = String(
        file?.file_name || file?.original || file?.thumbnail || ''
      )
        .split('?')[0]
        .split('/')
        .pop();
      const filename = displayNameSource?.replace(/\.[^.]+$/, '') || 'media';
      const previewSrc = getBestPreviewSrc(file);
      const proxiedPreviewSrc = getProxiedMediaSrc(previewSrc);
      const isImage = Boolean(
        proxiedPreviewSrc && IMAGE_EXTENSIONS.includes(String(fileType))
      );
      const isVideo = Boolean(
        file?.original && VIDEO_EXTENSIONS.includes(fileType)
      );

      return (
        <div
          className={`relative mt-2 inline-flex flex-col overflow-hidden rounded me-2 ${
            isVideo && wantsLargeVideoPreview ? 'w-full me-0' : ''
          } ${isImage ? 'border border-border-200' : ''}`}
          key={idx}
        >
          {isImage ? (
            <figure className="relative h-16 w-28">
              <Image
                src={proxiedPreviewSrc || previewSrc}
                alt={filename}
                fill
                sizes="(max-width: 768px) 100vw"
                className="object-contain"
              />
            </figure>
          ) : isVideo ? (
            <div
              className={
                wantsLargeVideoPreview ? 'w-full' : 'inline-flex flex-col'
              }
            >
              <figure
                className={
                  wantsLargeVideoPreview
                    ? 'relative w-full overflow-hidden rounded border border-border-200 aspect-[16/10] bg-black'
                    : 'relative h-16 w-28 overflow-hidden rounded bg-black'
                }
              >
                <video
                  src={getProxiedMediaSrc(file.original) || file.original}
                  controls
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              </figure>
              {wantsLargeVideoPreview ? (
                <p className="mt-2 text-xs text-body">
                  {filename}.{fileType}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 min-w-0 items-center justify-center overflow-hidden">
                <Image
                  src={zipPlaceholder}
                  width={56}
                  height={56}
                  alt="upload placeholder"
                />
              </div>
              <p className="flex cursor-default items-baseline p-1 text-xs text-body">
                <span
                  className="inline-block max-w-[64px] overflow-hidden overflow-ellipsis whitespace-nowrap"
                  title={`${filename}.${fileType}`}
                >
                  {filename}
                </span>
                .{fileType}
              </p>
            </div>
          )}
          {multiple ? (
            <button
              className="absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-light shadow-xl outline-none end-1"
              onClick={() => handleDelete(file?.thumbnail || file?.original)}
            >
              <CloseIcon width={10} height={10} />
            </button>
          ) : null}
        </div>
      );
    }
  });

  return (
    <section className="upload">
      <div
        {...getRootProps({
          className:
            'border-dashed border-2 border-border-base h-36 rounded flex flex-col justify-center items-center cursor-pointer focus:border-accent-400 focus:outline-none',
        })}
      >
        <input {...getInputProps()} />
        <UploadIcon className="text-muted-light" />
        <p className="mt-4 text-center text-sm text-body">
          {helperText ? (
            <span className="font-semibold text-gray-500">{helperText}</span>
          ) : (
            <>
              <span className="font-semibold text-accent">
                {t('text-upload-highlight')}
              </span>{' '}
              {t('text-upload-message')} <br />
              <span className="text-xs text-body">{t('text-img-format')}</span>
            </>
          )}
        </p>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600 text-body">
            {error}
          </p>
        )}
      </div>

      {(!!thumbs.length || loading) && (
        <aside className="mt-2 flex flex-wrap">
          {!!thumbs.length && thumbs}
          {loading && (
            <div className="mt-2 flex h-16 items-center ms-2">
              <Loader simple={true} className="h-6 w-6" />
            </div>
          )}
        </aside>
      )}
    </section>
  );
}
