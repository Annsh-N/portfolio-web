import { z } from "zod";

export const wordleSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(5, "Enter a five-letter answer")
    .max(5, "Enter a five-letter answer")
    .regex(/^[a-zA-Z]+$/, "Use letters only"),
});

const connectionGroupSchema = z.object({
  category: z.string().trim().min(3, "Category title is too short").max(40, "Category title is too long"),
  color: z.enum(["amber", "green", "blue", "purple"]),
  words: z.array(z.string().trim().min(1, "Add all four items")).length(4, "Each group needs exactly four items"),
});

export const connectionsSchema = z
  .object({
    groups: z.array(connectionGroupSchema).length(4, "Connections requires four groups"),
  })
  .superRefine((value, ctx) => {
    const normalizedWords = value.groups.flatMap((group) => group.words.map((word) => word.trim().toUpperCase()));
    const deduped = new Set(normalizedWords);
    if (deduped.size !== normalizedWords.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each board item must be unique.",
      });
    }
  });
