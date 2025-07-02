
'use client';

import * as React from 'react';
import { ChefHat, ListPlus, UtensilsCrossed, Loader2, Clock, Users, Info, Sparkles, WheatOff, Vegan, MilkOff, Carrot, X } from 'lucide-react'; // Added X icon
import { suggestRecipes, type SuggestRecipesOutput, type SuggestRecipesInput } from '@/ai/flows/suggest-recipes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define available dietary options
const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: Carrot },
  { id: 'vegan', label: 'Vegan', icon: Vegan },
  { id: 'gluten-free', label: 'Gluten-Free', icon: WheatOff },
  { id: 'dairy-free', label: 'Dairy-Free', icon: MilkOff },
] as const;

// Define common ingredient suggestions
const SUGGESTED_INGREDIENTS = [
  'Chicken Breast', 'Eggs', 'Milk', 'Flour', 'Sugar', 'Salt', 'Pepper', 'Olive Oil', 'Onion', 'Garlic', 'Tomatoes', 'Potatoes', 'Rice', 'Pasta', 'Cheese'
];


export default function PantryChefPage() {
  const [ingredients, setIngredients] = React.useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = React.useState<string>('');
  const [selectedPreferences, setSelectedPreferences] = React.useState<string[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = React.useState<SuggestRecipesOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [currentYear, setCurrentYear] = React.useState<number | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleAddIngredient = (ingredientToAdd?: string) => {
    const ingredient = (ingredientToAdd || currentIngredient).trim();
    if (ingredient !== '' && !ingredients.some(i => i.toLowerCase() === ingredient.toLowerCase())) {
      setIngredients([...ingredients, ingredient]);
      setCurrentIngredient(''); // Clear input only if adding from input
    } else if (ingredient !== '' && ingredients.some(i => i.toLowerCase() === ingredient.toLowerCase())) {
        toast({
            title: "Duplicate Ingredient",
            description: `"${ingredient}" is already in your list.`,
            variant: "default", // Use default or a specific "info" variant if created
            duration: 3000,
          });
    }
  };


  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handlePreferenceChange = (preferenceLabel: string, checked: boolean | string) => {
     const isChecked = checked === true;
     setSelectedPreferences(prev =>
       isChecked
         ? [...prev, preferenceLabel]
         : prev.filter(p => p !== preferenceLabel)
     );
   };


  const handleSuggestRecipes = async () => {
    if (ingredients.length === 0) {
      toast({
        title: "No Ingredients",
        description: "Please add some ingredients first.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestedRecipes(null);
    try {
      const input: SuggestRecipesInput = {
         ingredients,
         dietaryPreferences: selectedPreferences.length > 0 ? selectedPreferences : undefined,
       };
      const result = await suggestRecipes(input);
      setSuggestedRecipes(result);
    } catch (error) {
      console.error('Error suggesting recipes:', error);
      let errorMessage = "Failed to suggest recipes. Please try again.";
      if (error instanceof Error) {
        errorMessage = `An error occurred: ${error.message}. Check the AI configuration or try refining your input.`;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-center h-16 px-4 border-b bg-background shadow-sm">
        <ChefHat className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-2xl font-semibold text-primary">Pantry Chef AI</h1>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs Section */}
        <Card className="lg:col-span-1 shadow-lg rounded-lg border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-primary">Your Kitchen</CardTitle>
            <ListPlus className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Ingredient Input */}
            <Label htmlFor="ingredient-input" className="text-sm font-medium">Add Ingredients</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="ingredient-input"
                type="text"
                placeholder="e.g., chicken breast, tomatoes"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                className="flex-1"
                aria-label="New ingredient"
              />
              <Button onClick={() => handleAddIngredient()} size="icon" aria-label="Add ingredient">
                <ListPlus className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggested Ingredients */}
             <div className="mt-3 mb-4">
                 <Label className="text-xs font-medium text-muted-foreground block mb-1.5">Quick Add:</Label>
                 <div className="flex flex-wrap gap-1.5">
                   {SUGGESTED_INGREDIENTS.map((suggestion) => (
                     <Badge
                       key={suggestion}
                       variant="secondary"
                       className="cursor-pointer hover:bg-primary/20 transition-colors py-1 px-2 text-xs"
                       onClick={() => handleAddIngredient(suggestion)}
                       aria-label={`Add ${suggestion}`}
                       role="button"
                       tabIndex={0}
                       onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAddIngredient(suggestion)}
                     >
                       {suggestion}
                     </Badge>
                   ))}
                 </div>
             </div>


            <ScrollArea className="h-40 border rounded-md p-2 mb-4">
              {ingredients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No ingredients added yet.</p>
              ) : (
                <ul className="space-y-1">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center justify-between bg-secondary/30 p-1.5 rounded-md text-sm">
                      <span>{ingredient}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-destructive hover:text-destructive/80 h-6 w-6 p-0"
                        aria-label={`Remove ${ingredient}`}
                      >
                         <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>

             {/* Dietary Preferences */}
             <Label className="text-sm font-medium block mb-2">Dietary Preferences (Optional)</Label>
             <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
               {DIETARY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                     <div key={option.id} className="flex items-center space-x-2">
                       <Checkbox
                         id={option.id}
                         checked={selectedPreferences.includes(option.label)}
                         onCheckedChange={(checked) => handlePreferenceChange(option.label, checked)} // Pass label
                       />
                       <Label
                         htmlFor={option.id}
                         className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5 cursor-pointer"
                       >
                         <Icon className="h-4 w-4 text-muted-foreground" />
                         {option.label}
                       </Label>
                     </div>
                  );
                })}
             </div>


            <Button
              onClick={handleSuggestRecipes}
              disabled={isLoading || ingredients.length === 0}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Thinking...' : 'Generate Recipes'}
            </Button>
          </CardContent>
        </Card>

        {/* Recipes Section */}
        <Card className="lg:col-span-2 shadow-lg rounded-lg border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-primary">AI Recipe Suggestions</CardTitle>
            <CardDescription>Advanced recipes tailored to your ingredients and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-[calc(100vh-26rem)] pr-4"> {/* Adjust height & add padding */}
              {isLoading && (
                 <div className="flex flex-col justify-center items-center h-64 text-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Generating creative recipes...</p>
                 </div>
              )}
              {!isLoading && !suggestedRecipes && (
                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                  <UtensilsCrossed className="h-16 w-16 mb-4" />
                  <p className="font-medium">Ready to cook?</p>
                  <p>Add your ingredients, select preferences,</p>
                  <p>and click "Generate Recipes"!</p>
                </div>
              )}
              {suggestedRecipes && suggestedRecipes.recipes.length > 0 && (
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {suggestedRecipes.recipes.map((recipe, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="border bg-card rounded-lg shadow-sm overflow-hidden">
                       <AccordionTrigger className="hover:no-underline px-4 py-3 bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-t-lg">
                         <div className="flex flex-col items-start text-left flex-1 mr-4">
                            <h3 className="font-semibold text-md text-primary">{recipe.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{recipe.description}</p>
                         </div>
                       </AccordionTrigger>
                       <AccordionContent className="px-4 pb-4 pt-3 bg-card rounded-b-lg">
                         <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs mb-4">
                             {recipe.prepTime && (
                                <Badge variant="outline" className="flex items-center gap-1 py-0.5 px-2">
                                   <Clock className="h-3 w-3" /> Prep: {recipe.prepTime}
                                </Badge>
                             )}
                             {recipe.cookTime && (
                                <Badge variant="outline" className="flex items-center gap-1 py-0.5 px-2">
                                   <Clock className="h-3 w-3" /> Cook: {recipe.cookTime}
                                </Badge>
                             )}
                             {recipe.servings && (
                                <Badge variant="outline" className="flex items-center gap-1 py-0.5 px-2">
                                   <Users className="h-3 w-3" /> {recipe.servings}
                                </Badge>
                             )}
                             {recipe.skillLevel && (
                                <Badge variant="outline" className="flex items-center gap-1 py-0.5 px-2 capitalize">
                                     <ChefHat className="h-3 w-3" /> Skill: {recipe.skillLevel}
                                </Badge>
                              )}
                             {recipe.cuisineType && (
                                <Badge variant="outline" className="flex items-center gap-1 py-0.5 px-2 capitalize">
                                     {/* Could add a generic food icon here if needed */}
                                     Cuisine: {recipe.cuisineType}
                                </Badge>
                              )}
                             {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                                recipe.dietaryTags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-0.5 px-2 capitalize">
                                     {tag.toLowerCase().includes('vegetarian') && <Carrot className="h-3 w-3" />}
                                     {tag.toLowerCase().includes('vegan') && <Vegan className="h-3 w-3" />}
                                     {tag.toLowerCase().includes('gluten-free') && <WheatOff className="h-3 w-3" />}
                                     {tag.toLowerCase().includes('dairy-free') && <MilkOff className="h-3 w-3" />}
                                     {tag}
                                  </Badge>
                                ))
                             )}
                          </div>

                         {recipe.ingredientsNeeded && recipe.ingredientsNeeded.length > 0 && (
                            <>
                               <h4 className="font-medium mb-1 text-sm text-foreground">Ingredients Needed:</h4>
                               <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4 pl-1">
                                 {recipe.ingredientsNeeded.map((ing, ingIndex) => (
                                   <li key={ingIndex}>{ing}</li>
                                 ))}
                               </ul>
                               <Separator className="my-3"/>
                            </>
                         )}

                         <h4 className="font-medium mb-2 text-sm text-foreground">Instructions:</h4>
                         <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-3">
                           {recipe.instructions.map((step, stepIndex) => (
                             <li key={stepIndex}>{step}</li>
                           ))}
                         </ol>

                         {recipe.tips && recipe.tips.length > 0 && (
                            <>
                              <Separator className="my-3"/>
                              <h4 className="font-medium mb-1 text-sm text-foreground">Chef's Tips:</h4>
                               <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                 {recipe.tips.map((tip, tipIndex) => (
                                   <li key={tipIndex}>{tip}</li>
                                 ))}
                               </ul>
                            </>
                          )}


                       </AccordionContent>
                     </AccordionItem>
                  ))}
                </Accordion>
              )}
              {suggestedRecipes && suggestedRecipes.recipes.length === 0 && !isLoading && (
                 <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                    <Info className="h-12 w-12 mb-4"/>
                   <p>No recipes found matching your ingredients and preferences.</p>
                   <p>Try adding more common items or removing some restrictions!</p>
                 </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

       <footer className="mt-auto py-4 text-center text-xs text-muted-foreground border-t bg-background">
         Powered by AI ✨ - Pantry Chef AI &copy; {currentYear ?? ''}
       </footer>
    </div>
  );
}

