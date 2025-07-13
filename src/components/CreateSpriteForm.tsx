import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { Frame, Layer } from "@/lib/types";
import { BrushState, useBrushStore } from "@/stores/brushStore";

const formSchema = z.object({
  name: z.string().min(1),
  width: z.string().min(1),
  height: z.string().min(1),
});

export default function CreateSpriteForm() {
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);
  const setColor = useBrushStore((state: BrushState) => state.setColor);
  const setAltColor = useBrushStore((state: BrushState) => state.setAltColor);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "untitled",
      width: "16",
      height: "16",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const pixels = new Uint8ClampedArray(
      parseInt(data.width) * parseInt(data.height) * 4
    );
    const layer: Layer = {
      name: undefined,
      pixels,
      visible: true,
    };
    const frame: Frame = {
      name: undefined,
      layers: [layer],
    };
    const black = new Uint8ClampedArray([0, 0, 0, 255]);
    const white = new Uint8ClampedArray([255, 255, 255, 255]);
    setColor(black);
    setAltColor(white);

    setSprite({
      name: data.name,
      width: parseInt(data.width),
      height: parseInt(data.height),
      frames: [frame],
      colors: [black, white],
    });
  }

  return (
    <main>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <h1>Create Sprite</h1>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Sprite Name" {...field} />
                </FormControl>
                <FormMessage />
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
                  <Input placeholder="Sprite Width" {...field} />
                </FormControl>
                <FormMessage />
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
                  <Input placeholder="Sprite Height" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create Sprite</Button>
        </form>
      </Form>
    </main>
  );
}
