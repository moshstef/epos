const styles = {
  pass: "bg-pass-bg text-pass-text",
  retry: "bg-retry-bg text-retry-text",
  error: "bg-error-bg text-error-text",
} as const;

export type FeedbackVariant = keyof typeof styles;

export function FeedbackBanner({
  variant,
  children,
}: {
  variant: FeedbackVariant;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg px-3 py-2 text-sm ${styles[variant]}`}>
      {children}
    </div>
  );
}
