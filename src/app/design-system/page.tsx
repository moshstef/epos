import {
  Button,
  Card,
  CardLink,
  FeedbackBanner,
  ProgressIndicator,
  Spinner,
} from "@/components/ui";

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Design System</h1>
        <p className="mt-2 text-muted">
          Internal reference for EPOS UI components.
        </p>
      </div>

      {/* Buttons */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Buttons</h2>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted">Variants</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-muted">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-muted">
              Icon buttons
            </h3>
            <div className="flex items-center gap-3">
              <Button variant="icon" size="icon" aria-label="Icon button">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </Button>
              <Button
                variant="icon-outline"
                size="icon"
                aria-label="Icon outline button"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </Button>
              <Button
                variant="icon"
                size="icon-lg"
                aria-label="Large icon button"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-muted">Disabled</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>Disabled</Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Cards</h2>
        <div className="space-y-4">
          <Card>
            <h3 className="font-medium">Static Card</h3>
            <p className="mt-1 text-sm text-muted">
              Used for exercise cards and content containers.
            </p>
          </Card>
          <CardLink href="#">
            <h3 className="font-medium">Interactive Card</h3>
            <p className="mt-1 text-sm text-muted">
              Used for lesson list items. Hover to see the effect.
            </p>
          </CardLink>
        </div>
      </section>

      {/* Feedback Banners */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Feedback Banners</h2>
        <div className="space-y-3">
          <FeedbackBanner variant="pass">Great job!</FeedbackBanner>
          <FeedbackBanner variant="retry">
            Try again — make sure to include &ldquo;Είμαι&rdquo;.
          </FeedbackBanner>
          <FeedbackBanner variant="error">
            Something went wrong. Please try again.
          </FeedbackBanner>
        </div>
      </section>

      {/* Progress Indicator */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Progress Indicator</h2>
        <div className="space-y-4">
          <ProgressIndicator current={1} total={5} />
          <ProgressIndicator current={3} total={5} />
          <ProgressIndicator current={5} total={5} />
        </div>
      </section>

      {/* Spinner */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Spinner</h2>
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </section>

      {/* Semantic Colors */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Semantic Colors</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-pass-bg p-3 text-sm text-pass-text">
            pass
          </div>
          <div className="rounded-lg bg-retry-bg p-3 text-sm text-retry-text">
            retry
          </div>
          <div className="rounded-lg bg-error-bg p-3 text-sm text-error-text">
            error
          </div>
          <div className="rounded-lg border border-border bg-surface p-3 text-sm">
            surface
          </div>
          <div className="rounded-lg border border-border-hover bg-surface-hover p-3 text-sm">
            surface-hover
          </div>
          <div className="rounded-lg bg-zinc-100 p-3 text-sm text-muted dark:bg-zinc-800">
            muted
          </div>
        </div>
      </section>
    </div>
  );
}
