'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}

export default function ProgressiveImage({
  src,
  alt,
  className = '',
  skeletonClassName = 'bg-zinc-800',
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <>
      {!loaded && (
        <div
          className={`absolute inset-0 ${skeletonClassName} motion-safe:animate-pulse`}
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        className={`${className} transition-opacity duration-500 motion-reduce:transition-none ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}
