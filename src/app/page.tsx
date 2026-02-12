import Link from "next/link";
import { Button } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">EPOS</h1>
        <p className="text-lg text-muted">
          Greek language tutor — speaking practice with supportive feedback
        </p>
        <Link href="/lessons">
          <Button size="lg" className="mt-2">
            Start Learning
          </Button>
        </Link>
      </main>
    </div>
  );
}
