"use server";

import { prisma } from "@/lib/prisma";
import { mockAnalyze } from "@/lib/analyzer";
import { parseRequiredWords, parseAllowedVariants } from "@/lib/schemas";

export async function getLessons() {
  return prisma.lesson.findMany({
    include: { exercises: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
}

export async function getLesson(id: string) {
  return prisma.lesson.findUnique({
    where: { id },
    include: { exercises: { orderBy: { order: "asc" } } },
  });
}

export async function createSession(lessonId: string) {
  const session = await prisma.session.create({
    data: { lessonId },
  });
  return session.id;
}

export async function completeSession(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { endedAt: new Date() },
  });
}

export async function submitAttempt({
  sessionId,
  exerciseId,
  userInput,
}: {
  sessionId: string;
  exerciseId: string;
  userInput: string;
}) {
  const exercise = await prisma.exercise.findUniqueOrThrow({
    where: { id: exerciseId },
  });

  const requiredWords = parseRequiredWords(exercise.requiredWords);
  const allowedVariants = parseAllowedVariants(exercise.allowedVariants);
  const result = mockAnalyze(userInput, requiredWords, allowedVariants);

  await prisma.attempt.create({
    data: {
      sessionId,
      exerciseId,
      transcript: userInput,
      outcome: result.outcome,
      analyzerOutput: JSON.stringify(result),
    },
  });

  return result;
}
