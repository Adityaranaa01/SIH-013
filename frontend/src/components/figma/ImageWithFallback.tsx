import React, { useState } from 'react';

// A simple placeholder image (inline SVG) shown when loading fails
const FALLBACK_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * An <img> wrapper that shows a fallback placeholder if the image fails to load.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  ...rest
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  return hasError ? (
    <div
      className={`inline-flex items-center justify-center bg-gray-100 text-center ${className ?? ''}`}
      style={style}
    >
      <img
        src={FALLBACK_IMAGE}
        alt="Image failed to load"
        {...rest}
        data-original-src={src}
      />
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}
