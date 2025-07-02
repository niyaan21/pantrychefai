
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting detailed recipes based on a list of ingredients and optional dietary preferences provided by the user.
 *
 * - suggestRecipes - A function that takes ingredients and optional preferences, returning detailed recipe suggestions.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Update Input Schema to include optional dietary preferences
const SuggestRecipesInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .min(1, { message: 'Please provide at least one ingredient.' })
    .describe('A list of ingredients the user has on hand.'),
  dietaryPreferences: z
    .array(z.string())
    .optional()
    .describe('Optional list of dietary preferences (e.g., Vegetarian, Gluten-Free) the user wants the recipes to adhere to.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

// Define a schema for a single recipe object
const RecipeDetailSchema = z.object({
    name: z.string().describe('The name of the suggested recipe.'),
    description: z.string().describe('A brief description of the recipe.'),
    ingredientsNeeded: z.array(z.string()).optional().describe('List of ingredients required for the recipe (including quantities if possible). This should include the provided ingredients and any additional ones needed.'),
    instructions: z.array(z.string()).describe('Step-by-step instructions for preparing the recipe.'),
    prepTime: z.string().optional().describe('Estimated preparation time (e.g., "15 minutes").'),
    cookTime: z.string().optional().describe('Estimated cooking time (e.g., "30 minutes").'),
    servings: z.string().optional().describe('Number of servings the recipe yields (e.g., "4 servings").'),
    dietaryTags: z.array(z.string()).optional().describe('Tags indicating dietary suitability (e.g., ["Vegetarian", "Gluten-Free"]). Only include tags that are explicitly requested or inherently true based on standard ingredients.')
});

// Update Output Schema to return an array of detailed recipe objects
const SuggestRecipesOutputSchema = z.object({
  recipes: z
    .array(RecipeDetailSchema)
    .describe('A list of 2-3 suggested recipes including name, description, ingredients needed, instructions, and optional time/servings/tags, based on the ingredients and dietary preferences provided. Prioritize diversity.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

// Make the suggestRecipes function available for client-side calls
export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
    // Validate input using Zod schema
    const validationResult = SuggestRecipesInputSchema.safeParse(input);
    if (!validationResult.success) {
        // Throw an error or return a specific error structure if validation fails
        throw new Error(`Invalid input: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
    }
    return suggestRecipesFlow(validationResult.data); // Use validated data
}


const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: { schema: SuggestRecipesInputSchema },
  output: { schema: SuggestRecipesOutputSchema },
  prompt: `You are an expert chef AI specialized in suggesting creative and practical recipes based on available ingredients and dietary needs.

Given the following list of ingredients, suggest 2 to 3 distinct recipes that the user can make. Focus on variety (e.g., different cuisines, cooking methods, meal types).

Ingredients Provided:
{{#each ingredients}}- {{{this}}}
{{/each}}

{{#if dietaryPreferences}}

Important: Please ensure all suggested recipes strictly adhere to the following dietary preferences:
{{#each dietaryPreferences}}- {{{this}}}
{{/each}}
{{/if}}

For each recipe, provide the following details adhering strictly to the output schema:
1.  **name:** The name of the recipe.
2.  **description:** A short, appealing description.
3.  **ingredientsNeeded:** A list of all ingredients required, including quantities if possible. Clearly indicate which ingredients are from the provided list and which ones are additional.
4.  **instructions:** A list of clear, step-by-step instructions.
5.  **prepTime:** (Optional) Estimated preparation time.
6.  **cookTime:** (Optional) Estimated cooking time.
7.  **servings:** (Optional) Estimated number of servings.
8.  **dietaryTags:** (Optional) List any relevant dietary tags (e.g., "Vegetarian", "Gluten-Free") ONLY IF they were requested in the preferences OR are inherently true for the recipe (e.g., a standard vegetable soup is often inherently vegetarian). Do not guess tags.

Format the output strictly according to the RecipeDetailSchema within the SuggestRecipesOutputSchema. Ensure 'instructions' and 'ingredientsNeeded' are arrays of strings.
`,
});


const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // Ensure output is not null and conforms to the schema, return empty array if needed
    return output || { recipes: [] };
  }
);
