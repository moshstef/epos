"use server";

import { analyze } from "@/lib/analyzer";
import { prisma } from "@/lib/prisma";
import {
  parseAllowedVariants,
  parseRequiredWords,
  validateAnalyzerResult,
} from "@/lib/schemas";
import { normalizeGreekTranscript } from "@/lib/stt/normalize";

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
  transcript,
  normalizedTranscript,
  confidence,
}: {
  sessionId: string;
  exerciseId: string;
  transcript: string;
  normalizedTranscript?: string;
  confidence?: number;
}) {
  const exercise = await prisma.exercise.findUniqueOrThrow({
    where: { id: exerciseId },
  });

  const requiredWords = parseRequiredWords(exercise.requiredWords);
  const allowedVariants = parseAllowedVariants(exercise.allowedVariants);

  // Normalize on the fly for text input (no pre-normalized transcript)
  const normalized =
    normalizedTranscript ?? normalizeGreekTranscript(transcript);
  const conf = confidence ?? 1.0;

  const result = analyze({
    transcript,
    normalizedTranscript: normalized,
    confidence: conf,
    requiredWords,
    allowedVariants,
    expectedPhrase: exercise.expectedPhrase,
  });

  validateAnalyzerResult(result);

  await prisma.attempt.create({
    data: {
      sessionId,
      exerciseId,
      transcript,
      outcome: result.outcome,
      sttConfidence: conf,
      analyzerOutput: JSON.stringify(result),
    },
  });

  return result;
}
