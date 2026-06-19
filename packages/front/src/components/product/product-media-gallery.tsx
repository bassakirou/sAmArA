import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import cn from 'classnames';
import SwiperCore, {
  A11y,
  FreeMode,
  Keyboard,
  Navigation,
  Thumbs,
} from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IoChevronBack, IoChevronForward, IoPlay } from 'react-icons/io5';
import { Attachment } from '@type/index';
import 'swiper/swiper-bundle.min.css';

SwiperCore.use([Navigation, Thumbs, FreeMode, Keyboard, A11y]);

export type ProductVideoEntry = {
  url?: string;
  type?: string;
  attachment_id?: number | string;
};

type ProductMediaItem =
  | {
      kind: 'image';
      src: string;
      thumb: string;
      alt: string;
    }
  | {
      kind: 'video';
      poster: string;
      alt: string;
    };

function asUrl(attachment: Attachment | null | undefined): string | null {
  if (!attachment) return null;
  return attachment.original ?? attachment.thumbnail ?? null;
}

function uniqueAttachments(
  attachments: Array<Attachment | null | undefined>
): Attachment[] {
  const seen = new Set<string>();
  const output: Attachment[] = [];
  for (const item of attachments) {
    const url = asUrl(item);
    if (!url) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    output.push(item as Attachment);
  }
  return output;
}

export default function ProductMediaGallery({
  productName,
  coverImage,
  gallery,
  video,
  onOpenVideo,
}: {
  productName: string;
  coverImage?: Attachment | null;
  gallery?: Attachment[] | null;
  video?: ProductVideoEntry[] | null;
  onOpenVideo?: () => void;
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperCore | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const hasVideo = Boolean(
    Array.isArray(video) && video.length && video[0]?.url
  );
  const media = useMemo<ProductMediaItem[]>(() => {
    const images = uniqueAttachments([
      ...(Array.isArray(gallery) ? gallery : []),
      coverImage ?? null,
    ]);
    const items: ProductMediaItem[] = images.map((img, index) => {
      const url =
        asUrl(img) ?? '/assets/placeholder/products/product-gallery.svg';
      const thumb =
        img?.thumbnail ??
        img?.original ??
        '/assets/placeholder/products/product-thumbnail.svg';
      return {
        kind: 'image',
        src: url,
        thumb,
        alt: `${productName} – ${index + 1}`,
      };
    });

    if (hasVideo) {
      const poster =
        coverImage?.thumbnail ??
        coverImage?.original ??
        '/assets/placeholder/products/product-thumbnail.svg';
      items.push({
        kind: 'video',
        poster,
        alt: `${productName} – Vidéo`,
      });
    }
    return items.length
      ? items
      : [
          {
            kind: 'image',
            src: '/assets/placeholder/products/product-gallery.svg',
            thumb: '/assets/placeholder/products/product-thumbnail.svg',
            alt: productName,
          },
        ];
  }, [coverImage, gallery, hasVideo, productName]);

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-3 md:grid md:grid-cols-[88px_minmax(0,1fr)] md:gap-4'
      )}
      aria-label="Galerie du produit"
    >
      <div
        className={cn(
          'relative order-2 h-[84px] min-w-0 md:order-1 md:h-[560px]'
        )}
      >
        <Swiper
          onSwiper={(swiper) => setThumbsSwiper(swiper)}
          direction="horizontal"
          slidesPerView={5}
          spaceBetween={10}
          freeMode
          watchSlidesProgress
          observer
          observeParents
          className="h-full w-full"
          breakpoints={{
            0: { slidesPerView: 5, direction: 'horizontal' as any },
            768: { slidesPerView: 6, direction: 'vertical' as any },
          }}
        >
          {media.map((item, index) => {
            const isActive = index === activeIndex;
            const thumbSrc =
              item.kind === 'image'
                ? item.thumb
                : item.poster ??
                  '/assets/placeholder/products/product-thumbnail.svg';
            return (
              <SwiperSlide
                key={`product-thumb-${index}`}
                className="!h-auto !w-auto md:!w-full"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (media.length > 1) {
                      if (mainSwiper && !mainSwiper.destroyed) {
                        mainSwiper.slideToLoop(index);
                      }
                    } else {
                      if (mainSwiper && !mainSwiper.destroyed) {
                        mainSwiper.slideTo(index);
                      }
                    }
                    setActiveIndex(index);
                  }}
                  className={cn(
                    'relative block h-[76px] w-[76px] overflow-hidden rounded-lg border transition',
                    isActive
                      ? 'border-black ring-2 ring-black'
                      : 'border-gray-200 hover:border-gray-400'
                  )}
                  aria-label={
                    item.kind === 'video'
                      ? 'Afficher la vidéo'
                      : `Afficher l’image ${index + 1}`
                  }
                  aria-current={isActive ? 'true' : undefined}
                >
                  <Image
                    src={thumbSrc}
                    alt={item.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  {item.kind === 'video' ? (
                    <span className="absolute inset-0 grid place-items-center bg-black/35">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-red-600 shadow">
                        <IoPlay size={18} />
                      </span>
                    </span>
                  ) : null}
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="relative order-1 min-w-0 md:order-2">
        <div
          className={cn(
            'relative h-[320px] w-full min-w-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-[420px] md:h-[560px]'
          )}
        >
          <Swiper
            onSwiper={(swiper) => setMainSwiper(swiper)}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            loop={media.length > 1}
            keyboard={{ enabled: true }}
            observer
            observeParents
            watchOverflow
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.realIndex);
              if (thumbsSwiper && !thumbsSwiper.destroyed) {
                thumbsSwiper.slideTo(swiper.realIndex);
              }
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              const navigation = (swiper.params.navigation ?? {}) as any;
              navigation.prevEl = prevRef.current;
              navigation.nextEl = nextRef.current;
              swiper.params.navigation = navigation;
            }}
            className="h-full w-full"
          >
            {media.map((item, index) => (
              <SwiperSlide key={`product-media-${index}`} className="!h-full">
                <div className="relative h-full w-full">
                  {item.kind === 'image' ? (
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 720px"
                      className="object-cover"
                      priority={index === 0}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenVideo?.()}
                      disabled={!onOpenVideo}
                      className={cn(
                        'group relative h-full w-full',
                        onOpenVideo ? 'cursor-pointer' : 'cursor-default'
                      )}
                      aria-label="Voir la vidéo"
                    >
                      <Image
                        src={item.poster}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 720px"
                        className="object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center bg-black/35">
                        <span className="grid h-16 w-16 place-items-center rounded-full bg-red-600 text-white shadow transition group-hover:bg-red-700">
                          <IoPlay size={28} />
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            ref={prevRef}
            type="button"
            aria-label="Média précédent"
            className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-900 shadow transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black"
          >
            <IoChevronBack size={20} />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label="Média suivant"
            className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-900 shadow transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black"
          >
            <IoChevronForward size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
