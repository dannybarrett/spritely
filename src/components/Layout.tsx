import { useEffect } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./ui/menubar";
import { SpriteState, useSpriteStore } from "@/stores/spriteStore";

export default function Layout({ children }: { children: React.ReactNode }) {
  const undo = useSpriteStore((state: SpriteState) => state.undo);
  const redo = useSpriteStore((state: SpriteState) => state.redo);

  const menus = [
    {
      name: "File",
      items: [
        {
          name: "New",
          action: () => console.log("new"),
          key: {
            name: "n",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
        {
          name: "Open",
          action: () => console.log("open"),
          key: {
            name: "o",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
        {
          name: "Save",
          action: () => console.log("save"),
          key: {
            name: "s",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
        {
          name: "Save As",
          action: () => console.log("save as"),
          key: {
            name: "s",
            modifiers: { meta: true, shift: true, alt: false },
          },
        },
        {
          name: "Export",
          action: () => console.log("export"),
          key: {
            name: "e",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
        {
          name: "Exit",
          action: () => console.log("exit"),
          key: {
            name: "q",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
      ],
    },
    {
      name: "Edit",
      items: [
        {
          name: "Undo",
          action: () => undo(),
          key: {
            name: "z",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
        {
          name: "Redo",
          action: () => redo(),
          key: {
            name: "z",
            modifiers: { meta: true, shift: true, alt: false },
          },
        },
      ],
    },
  ];

  function handleKeyDown(event: KeyboardEvent) {
    const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
    const modifiers = {
      meta: metaKey || ctrlKey,
      shift: shiftKey,
      alt: altKey,
    };

    for (const menu of menus) {
      for (const item of menu.items) {
        if (
          item.key.name === key.toLowerCase() &&
          item.key.modifiers.meta === modifiers.meta &&
          item.key.modifiers.shift === modifiers.shift &&
          item.key.modifiers.alt === modifiers.alt
        ) {
          item.action();
          return;
        }
      }
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Menubar>
        {menus.map((menu) => (
          <MenubarMenu key={menu.name}>
            <MenubarTrigger>{menu.name}</MenubarTrigger>
            <MenubarContent>
              {menu.items.map((item) => (
                <MenubarItem key={item.name} onClick={item.action}>
                  {item.name}
                </MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
      {children}
    </div>
  );
}
