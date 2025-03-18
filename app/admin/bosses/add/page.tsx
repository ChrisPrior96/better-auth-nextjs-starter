"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createBoss } from "@/app/actions/admin";

// Team size options
const TEAM_SIZES = [
  { id: "solo", label: "Solo" },
  { id: "duo", label: "Duo" },
  { id: "trio", label: "Trio" },
  { id: "4-man", label: "4-man" },
  { id: "5-man", label: "5-man" },
  { id: "8-man", label: "8-man" },
];

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  imageUrl: z.string().url("Please enter a valid image URL"),
  teamSizes: z.array(z.string()).min(1, "Select at least one team size"),
});

export default function AddBossPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      teamSizes: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("imageUrl", values.imageUrl);
      formData.append("allowedTeamSizes", JSON.stringify(values.teamSizes));
      
      // Call server action
      const result = await createBoss(formData);
      
      if (result.success) {
        toast.success("Boss added successfully!");
        router.push("/admin/bosses");
        router.refresh();
      } else {
        toast.error(`Failed to add boss: ${result.error}`);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Boss</h1>
        <p className="text-muted-foreground mt-1">
          Create a new boss entry for the leaderboard
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Boss Information</CardTitle>
          <CardDescription>
            Enter the boss details and select allowed team sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter boss name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of the boss as it appears in OSRS
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A direct URL to an image of the boss
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamSizes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Allowed Team Sizes</FormLabel>
                      <FormDescription>
                        Select which team sizes are valid for this boss
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {TEAM_SIZES.map((size) => (
                        <FormField
                          key={size.id}
                          control={form.control}
                          name="teamSizes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={size.id}
                                className="flex items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(size.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, size.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== size.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {size.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Boss"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 