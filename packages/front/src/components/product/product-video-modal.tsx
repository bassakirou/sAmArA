import React, { useMemo } from 'react';
import { useUI } from '@contexts/ui.context';
import { ProductVideoEntry } from './product-media-gallery';

function getYouTubeId(url: string): string | null {
  try {
    const normalized = url.trim();
    const u = new URL(normalized);
    const hostname = u.hostname.replace(/^www\./, '');
    if (hostname === 'youtu.be') {
      return u.pathname.split('/').filter(Boolean)[0] || null;
    }
    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return id;
      const parts = u.pathname.split('/').filter(Boolean);
      const shortsIndex = parts.indexOf('shorts');
      if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
        return parts[shortsIndex + 1];
      }
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1];
      }
      const liveIndex = parts.indexOf('live');
      if (liveIndex >= 0 && parts[liveIndex + 1]) {
        return parts[liveIndex + 1];
      }
    }
    return null;
  } catch {
    return null;
  }
}

function getVimeoId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const hostname = u.hostname.replace(/^www\./, '');
    if (!hostname.includes('vimeo.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    const numericPart = [...parts].reverse().find((part) => /^\d+$/.test(part));
    return numericPart || null;
  } catch {
    return null;
  }
}

function resolveVideoEmbed(entry: ProductVideoEntry | null): {
  kind: 'iframe' | 'file' | 'unknown';
  src: string | null;
} {
  const url = entry?.url ? String(entry.url).trim() : '';
  if (!url) return { kind: 'unknown', src: null };

  const type = String(entry?.type ?? '').toLowerCase();
  if (type === 'upload') return { kind: 'file', src: url };

  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    const origin =
      typeof window !== 'undefined'
        ? encodeURIComponent(window.location.origin)
        : '';
    const query = [
      'rel=0',
      'modestbranding=1',
      'playsinline=1',
      origin ? `origin=${origin}` : '',
    ]
      .filter(Boolean)
      .join('&');
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${youtubeId}?${query}`,
    };
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeoId}` };

  if (type === 'external') {
    return { kind: 'iframe', src: url };
  }

  const looksLikeFile = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
  if (looksLikeFile) return { kind: 'file', src: url };

  return { kind: 'unknown', src: null };
}

function getPlayableVideoSrc(src: string | null) {
  if (!src) return null;
  try {
    const url = new URL(src);
    const shouldProxyNgrok =
      url.hostname === 'rockfish-outflank-skewed.ngrok-free.dev' ||
      url.hostname.endsWith('.ngrok-free.dev') ||
      url.hostname.endsWith('.ngrok.io');

    if (!shouldProxyNgrok) {
      return src;
    }

    return `/api/media-proxy?url=${encodeURIComponent(src)}`;
  } catch {
    return src;
  }
}

export default function ProductVideoModal({ video }: { video?: ProductVideoEntry[] | null }) {
  const { closeModal } = useUI();
  const entry = Array.isArray(video) && video.length ? video[0] : null;
  const resolved = useMemo(() => resolveVideoEmbed(entry), [entry]);
  const playableSrc = useMemo(
    () => getPlayableVideoSrc(resolved.kind === 'file' ? resolved.src : null),
    [resolved]
  );

  return (
    <div className="w-screen max-w-3xl overflow-hidden rounded-xl bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
        <div className="text-base font-semibold text-heading">Vidéo du produit</div>
        <button
          type="button"
          onClick={closeModal}
          className="text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          Fermer
        </button>
      </div>
      <div className="p-5">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          {resolved.kind === 'file' && playableSrc ? (
            <video className="h-full w-full" controls autoPlay playsInline>
              <source src={playableSrc} />
            </video>
          ) : resolved.kind === 'iframe' && resolved.src ? (
            <iframe
              title="Vidéo du produit"
              src={resolved.src}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm text-white">
              Aucune vidéo disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
