export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`block rounded-lg border border-border bg-surface p-6 transition-colors hover:border-border-hover hover:bg-surface-hover ${className}`}
    >
      {children}
    </a>
  );
}
