'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  className?: string;
  onLoad?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
  lazy?: boolean;
}

/**
 * Optimized image component with progressive loading
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  className = '',
  onLoad,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc = '/images/placeholder.png',
  lazy = true,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imageRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(imageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazy]);

  const handleError = () => {
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Generate blur data URL if not provided
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;

    // Simple SVG blur placeholder
    const svgBlur = `
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <filter id="blur" x="0" y="0">
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
        </filter>
        <rect width="100%" height="100%" fill="#f0f0f0" filter="url(#blur)" />
      </svg>
    `;

    return `data:image/svg+xml;base64,${Buffer.from(svgBlur).toString('base64')}`;
  };

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || 'auto',
        height: height || 'auto',
        backgroundColor: isLoading ? '#f0f0f0' : 'transparent',
      }}
    >
      {isInView && (
        <>
          {/* Loading skeleton */}
          {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

          {/* Next.js Image component for optimization */}
          {width && height ? (
            <Image
              src={imageSrc}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              quality={quality}
              onError={handleError}
              onLoad={handleLoad}
              placeholder={placeholder}
              blurDataURL={placeholder === 'blur' ? getBlurDataURL() : undefined}
              className={`transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />
          ) : (
            // For dynamic sizing
            <Image
              src={imageSrc}
              alt={alt}
              fill
              priority={priority}
              quality={quality}
              onError={handleError}
              onLoad={handleLoad}
              placeholder={placeholder}
              blurDataURL={placeholder === 'blur' ? getBlurDataURL() : undefined}
              className={`object-cover transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}
        </>
      )}
    </div>
  );
}

/**
 * Progressive image component with multiple resolutions
 */
export function ProgressiveImage({
  lowResSrc,
  highResSrc,
  alt,
  className = '',
  ...props
}: {
  lowResSrc: string;
  highResSrc: string;
  alt: string;
  className?: string;
  [key: string]: any;
}) {
  const [currentSrc, setCurrentSrc] = useState(lowResSrc);
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);

  useEffect(() => {
    // Preload high-res image
    const img = new window.Image();
    img.src = highResSrc;
    img.onload = () => {
      setCurrentSrc(highResSrc);
      setIsHighResLoaded(true);
    };
  }, [highResSrc]);

  return (
    <div className={`relative ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ${
          !isHighResLoaded ? 'filter blur-sm scale-105' : ''
        }`}
        {...props}
      />
    </div>
  );
}

/**
 * Image gallery with optimized loading
 */
export function OptimizedImageGallery({
  images,
  columns = 3,
  gap = 4,
}: {
  images: Array<{ src: string; alt: string; width?: number; height?: number }>;
  columns?: number;
  gap?: number;
}) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  return (
    <div
      className={`grid grid-cols-${columns} gap-${gap}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`,
      }}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          priority={index < columns} // First row gets priority
          onLoad={() => handleImageLoad(index)}
          className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
        />
      ))}
    </div>
  );
}
