'use server';
/**
 * @fileOverview A flow to find relevant Names of Allah based on user input.
 *
 * - seekGuidance - A function that handles finding the names.
 * - SeekGuidanceInput - The input type for the seekGuidance function.
 * - SeekGuidanceOutput - The return type for the seekGuidance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ALLAH_NAMES } from '@/lib/data';

const SeekGuidanceInputSchema = z.object({
    prompt: z.string().describe('The user\'s challenge, feeling, or desired quality.'),
});
export type SeekGuidanceInput = z.infer<typeof SeekGuidanceInputSchema>;

const RecommendedNameSchema = z.object({
    id: z.number().describe('The id of the name of Allah.'),
    name: z.string().describe('The name of Allah in transliteration.'),
    transliteration: z.string().describe('The name of Allah in Arabic script.'),
    en: z.string().describe('The meaning of the name in English.'),
    reasoning: z.string().describe('A brief explanation of why this name is relevant to the user\'s prompt.'),
});

const SeekGuidanceOutputSchema = z.object({
    names: z.array(RecommendedNameSchema).describe('An array of 1 to 3 recommended Names of Allah.'),
});
export type SeekGuidanceOutput = z.infer<typeof SeekGuidanceOutputSchema>;


export async function seekGuidance(input: SeekGuidanceInput): Promise<SeekGuidanceOutput> {
    return seekGuidanceFlow(input);
}

const guidancePrompt = ai.definePrompt({
    name: 'seekGuidancePrompt',
    input: { schema: SeekGuidanceInputSchema },
    output: { schema: SeekGuidanceOutputSchema },
    prompt: `You are a wise and compassionate Islamic spiritual guide. A user is seeking guidance by describing a challenge, feeling, or a quality they wish to embody. Your task is to reflect on their words and recommend 1 to 3 of the 99 Names of Allah that are most relevant for their situation.

The user's input is: "{{prompt}}"

Here is the full list of the 99 Names of Allah with their meanings:
${JSON.stringify(ALLAH_NAMES, null, 2)}

Carefully consider the user's prompt and select the most fitting names. For each name you select, provide a brief, gentle, and encouraging "reasoning" for why it is relevant to their specific situation. Your response should be structured as a JSON object containing an array of the recommended names.
`,
});

const seekGuidanceFlow = ai.defineFlow(
    {
        name: 'seekGuidanceFlow',
        inputSchema: SeekGuidanceInputSchema,
        outputSchema: SeekGuidanceOutputSchema,
    },
    async (input) => {
        const { output } = await guidancePrompt(input);
        if (!output) {
            throw new Error('Could not generate guidance.');
        }
        return output;
    }
);
