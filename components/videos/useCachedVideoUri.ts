// hooks/useCachedVideoUri.ts
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';

type UseCachedVideoUriOpts = {
  /**
   * If true, start a background download even while streaming remotely.
   * Next play will be instant from disk.
   */
  prefetch?: boolean;
  /**
   * Invalidate cache when the presigned URL changes (includes new X-Amz-Expires).
   * You can also pass a stable cacheKey (e.g., your video.id) to persist across new signatures.
   */
  cacheKey?: string;
  /**
   * Optional TTL in ms. If file older than TTL, we refresh it in background.
   * Default: 7 days.
   */
  ttl?: number;
};

export function useCachedVideoUri(
  remoteUrl?: string,
  opts: UseCachedVideoUriOpts = {}
) {
  const { prefetch = true, cacheKey, ttl = 7 * 24 * 60 * 60 * 1000 } = opts;
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isCaching, setIsCaching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!remoteUrl) {
      setLocalUri(null);
      setError(null);
      return;
    }

    const keyBase = cacheKey ?? remoteUrl;
    const run = async () => {
      try {
        const digest = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          keyBase
        );
        const cachePath = `${FileSystem.cacheDirectory}videos/${digest}.mp4`;

        await FileSystem.makeDirectoryAsync(
          `${FileSystem.cacheDirectory}videos`,
          { intermediates: true }
        );
        const info = await FileSystem.getInfoAsync(cachePath);
        if (info.exists) {
          if (ttl > 0) {
            const age =
              Date.now() -
              (info.modificationTime
                ? info.modificationTime * 1000
                : Date.now());
            if (age <= ttl) {
              setLocalUri(info.uri);
              // Optionally refresh in background if close to TTL (skip here)
              return;
            }
          } else {
            setLocalUri(info.uri);
            return;
          }
        }

        // No fresh file -> optionally prefetch in background while we keep streaming remote
        if (prefetch && !startedRef.current) {
          startedRef.current = true;
          setIsCaching(true);
          FileSystem.downloadAsync(remoteUrl, cachePath)
            .then(({ uri, status }) => {
              if (status >= 200 && status < 300) setLocalUri(uri);
            })
            .catch((e) => setError(e?.message ?? 'Cache download failed'))
            .finally(() => setIsCaching(false));
        }
      } catch (e: any) {
        setError(e?.message ?? 'Cache init failed');
      }
    };

    run();
  }, [remoteUrl, cacheKey, prefetch, ttl]);

  return {
    playableUri: localUri ?? remoteUrl ?? null,
    isCaching,
    error,
  };
}
