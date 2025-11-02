
'use server';
/**
 * @fileOverview A flow to enrich user-submitted Dhikr with Arabic script and English translation.
 *
 * - enrichDhikr - A function that handles the enrichment process.
 * - EnrichDhikrInput - The input type for the enrichDhikr function.
 * - EnrichDhikrOutput - The return type for the enrichDhikr function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnrichDhikrInputSchema = z.object({
    dhikr: z.string().describe('The Dhikr submitted by the user. This can be in English or a common transliteration.'),
});
export type EnrichDhikrInput = z.infer<typeof EnrichDhikrInputSchema>;

const EnrichDhikrOutputSchema = z.object({
    arabicText: z.string().describe('The correct Arabic script for the Dhikr.'),
    translation: z.string().describe('The English translation of the Dhikr.'),
    transliteration: z.string().describe('The transliteration of the Dhikr.'),
});
export type EnrichDhikrOutput = z.infer<typeof EnrichDhikrOutputSchema>;

export async function enrichDhikr(input: EnrichDhikrInput): Promise<EnrichDhikrOutput> {
    return enrichDhikrFlow(input);
}

const enrichmentPrompt = ai.definePrompt({
    name: 'enrichDhikrPrompt',
    input: { schema: EnrichDhikrInputSchema },
    output: { schema: EnrichDhikrOutputSchema },
    prompt: `A user has submitted a Dhikr for remembrance. The input might be in English or a transliteration.
Your task is to identify the Dhikr and provide its correct Arabic script, its English translation, and a standard transliteration.

User input: "{{dhikr}}"

Please return the information in a JSON object. For example, if the user enters "Alhamdulillah", your output should be:
{
  "arabicText": "ٱلْحَمْدُ لِلَّٰهِ",
  "translation": "All praise is due to Allah.",
  "transliteration": "Alhamdulillah"
}

If the user enters "Sufficient for me is Allah, and [He is] the best Disposer of affairs.", your output should be:
{
  "arabicText": "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
  "translation": "Sufficient for us is Allah, and [He is] the best Disposer of affairs.",
  "transliteration": "Hasbunallahu wa ni'mal wakeel"
}

Provide only the JSON object in your response.
`,
});

const enrichDhikrFlow = ai.defineFlow(
    {
        name: 'enrichDhikrFlow',
        inputSchema: EnrichDhikrInputSchema,
        outputSchema: EnrichDhikrOutputSchema,
    },
    async (input) => {
        const { output } = await enrichmentPrompt(input);
        if (!output) {
            throw new Error('Could not process the Dhikr.');
        }
        return output;
    }
);
