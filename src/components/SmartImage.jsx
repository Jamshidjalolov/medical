import { useState } from "react";

export default function SmartImage({ src, fallbackSrc, alt, className, ...restProps }) {
  const [hasError, setHasError] = useState(false);

  return (
    <img
      {...restProps}
      src={hasError ? fallbackSrc : src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
