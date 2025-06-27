import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { Sprite } from "@/types/sprite";

const formSchema = z.object({
  name: z.string().min(1).max(50),
  width: z.number().min(1).max(512),
  height: z.number().min(1).max(512),
});

export default function CreateSprite() {
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "untitled",
      width: 16,
      height: 16,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newSprite: Sprite = {
      name: values.name,
      frames: [
        {
          layers: [
            {
              pixels: Array(values.width * values.height).fill({
                r: 0,
                g: 0,
                b: 0,
                a: 0,
              }),
            },
          ],
        },
      ],
    };

    setSprite(newSprite);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <h1>Create Sprite</h1>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button>Create sprite</Button>
      </form>
    </Form>
  );
}
