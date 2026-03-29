export default function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton-block ${className}`.trim()} aria-hidden="true" />;
}
