type LiveDotProps = {
  className?: string;
  colorClassName?: string;
};

export default function LiveDot({
  className = "",
  colorClassName = "bg-live",
}: LiveDotProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full ${colorClassName} animate-live-pulse ${className}`.trim()}
    />
  );
}
