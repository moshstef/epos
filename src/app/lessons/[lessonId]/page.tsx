import { notFound } from "next/navigation";
import { getLesson } from "../actions";
import LessonFlow from "./LessonFlow";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = await getLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <LessonFlow lesson={lesson} />
    </div>
  );
}
