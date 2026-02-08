import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { createAdapter } from "../src/lib/db.js";

const prisma = new PrismaClient({ adapter: createAdapter() });

async function main() {
  const existing = await prisma.lesson.findFirst({
    where: { title: "Greetings & Introductions" },
  });
  if (existing) {
    console.log(`Seed data already exists, skipping.`);
    return;
  }

  const lesson = await prisma.lesson.create({
    data: {
      title: "Greetings & Introductions",
      description: "Learn basic Greek greetings and how to introduce yourself.",
      order: 1,
      exercises: {
        create: [
          {
            type: "speaking",
            prompt: 'Say "Hello, my name is Maria" in Greek.',
            expectedPhrase: "Γεια σου, με λένε Μαρία",
            requiredWords: JSON.stringify(["Γεια", "λένε"]),
            allowedVariants: JSON.stringify([
              "Γεια σου με λένε Μαρία",
              "Γεια, με λένε Μαρία",
            ]),
            order: 1,
          },
          {
            type: "speaking",
            prompt: 'Say "How are you?" in Greek.',
            expectedPhrase: "Τι κάνεις;",
            requiredWords: JSON.stringify(["Τι", "κάνεις"]),
            allowedVariants: JSON.stringify(["Τι κάνεις", "Πώς είσαι"]),
            order: 2,
          },
          {
            type: "speaking",
            prompt: 'Say "I am fine, thank you" in Greek.',
            expectedPhrase: "Είμαι καλά, ευχαριστώ",
            requiredWords: JSON.stringify(["καλά", "ευχαριστώ"]),
            allowedVariants: JSON.stringify([
              "Είμαι καλά ευχαριστώ",
              "Καλά ευχαριστώ",
              "Καλά, ευχαριστώ",
            ]),
            order: 3,
          },
        ],
      },
    },
    include: { exercises: true },
  });

  console.log(
    `Seeded lesson: "${lesson.title}" with ${lesson.exercises.length} exercises`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
