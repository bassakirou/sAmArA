import type { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

function isAllowedMediaHost(hostname: string) {
  return (
    hostname === 'rockfish-outflank-skewed.ngrok-free.dev' ||
    hostname.endsWith('.ngrok-free.dev') ||
    hostname.endsWith('.ngrok.io') ||
    hostname === 'samara-api.appaa-cameroun.net' ||
    hostname === 'api.samara-shopping.com' ||
    hostname === '127.0.0.1' ||
    hostname === 'localhost'
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rawUrl = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;

  if (!rawUrl) {
    res.status(400).json({ message: 'Missing media url' });
    return;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    res.status(400).json({ message: 'Invalid media url' });
    return;
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    res.status(400).json({ message: 'Unsupported protocol' });
    return;
  }

  if (!isAllowedMediaHost(targetUrl.hostname)) {
    res.status(403).json({ message: 'Forbidden media host' });
    return;
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'user-agent': 'samara-media-proxy/1.0',
        ...(req.headers.range ? { range: String(req.headers.range) } : {}),
      },
      redirect: 'follow',
    });

    res.status(upstream.status);

    const passthroughHeaders = [
      'accept-ranges',
      'cache-control',
      'content-length',
      'content-range',
      'content-type',
      'etag',
      'expires',
      'last-modified',
    ];

    passthroughHeaders.forEach((header) => {
      const value = upstream.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });

    if (!upstream.ok && upstream.status !== 206) {
      const text = await upstream.text();
      res.end(text);
      return;
    }

    if (req.method === 'HEAD' || !upstream.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstream.body as any).pipe(res);
  } catch (error: any) {
    res.status(502).json({
      message: error?.message || 'Unable to load remote media',
    });
  }
}

