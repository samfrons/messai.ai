import { useState, useEffect, useCallback } from 'react';

interface PreloadedImage {
  src: string;
  loaded: boolean;
  error: boolean;
}

/**
 * Hook to preload images with loading states
 */
export function useImagePreloader(imageUrls: string[]) {
  const [images, setImages] = useState<Map<string, PreloadedImage>>(new Map());
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        setImages((prev) => {
          const newMap = new Map(prev);
          newMap.set(src, { src, loaded: true, error: false });
          return newMap;
        });
        resolve();
      };

      img.onerror = () => {
        setImages((prev) => {
          const newMap = new Map(prev);
          newMap.set(src, { src, loaded: false, error: true });
          return newMap;
        });
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (!imageUrls.length) return;

    // Initialize images map
    const initialImages = new Map<string, PreloadedImage>();
    imageUrls.forEach((src) => {
      initialImages.set(src, { src, loaded: false, error: false });
    });
    setImages(initialImages);

    // Preload all images
    let loadedCount = 0;
    const totalImages = imageUrls.length;

    const loadImages = async () => {
      const promises = imageUrls.map(async (src) => {
        try {
          await preloadImage(src);
          loadedCount++;
          setLoadingProgress((loadedCount / totalImages) * 100);
        } catch (error) {
          console.error('Failed to preload image:', error);
          loadedCount++;
          setLoadingProgress((loadedCount / totalImages) * 100);
        }
      });

      await Promise.allSettled(promises);
      setAllLoaded(true);
    };

    loadImages();
  }, [imageUrls, preloadImage]);

  const getImageStatus = (src: string): PreloadedImage | undefined => {
    return images.get(src);
  };

  const retryFailedImages = useCallback(async () => {
    const failedImages = Array.from(images.entries())
      .filter(([_, image]) => image.error)
      .map(([src]) => src);

    for (const src of failedImages) {
      try {
        await preloadImage(src);
      } catch (error) {
        console.error('Retry failed for image:', src);
      }
    }
  }, [images, preloadImage]);

  return {
    images: Array.from(images.values()),
    allLoaded,
    loadingProgress,
    getImageStatus,
    retryFailedImages,
  };
}

/**
 * Hook to lazy load images on intersection
 */
export function useLazyImageLoader(
  imageRefs: React.RefObject<HTMLElement>[],
  options?: IntersectionObserverInit
) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.findIndex((ref) => ref.current === entry.target);
            if (index !== -1) {
              setLoadedImages((prev) => new Set(prev).add(index));
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
        ...options,
      }
    );

    imageRefs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [imageRefs, options]);

  return loadedImages;
}

/**
 * Hook for responsive image loading
 */
export function useResponsiveImage(srcSet: {
  small: string;
  medium: string;
  large: string;
  xlarge?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(srcSet.small);

  useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setCurrentSrc(srcSet.small);
      } else if (width < 1024) {
        setCurrentSrc(srcSet.medium);
      } else if (width < 1920) {
        setCurrentSrc(srcSet.large);
      } else if (srcSet.xlarge) {
        setCurrentSrc(srcSet.xlarge);
      }
    };

    updateImageSrc();

    const debouncedUpdate = debounce(updateImageSrc, 300);
    window.addEventListener('resize', debouncedUpdate);

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, [srcSet]);

  return currentSrc;
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
