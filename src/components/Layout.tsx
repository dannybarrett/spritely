import { useCallback, useEffect } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./ui/menubar";
import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { confirm, save, open } from "@tauri-apps/plugin-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useState } from "react";
import ExportSpriteForm from "./ExportSpriteForm";
import { exit } from "@tauri-apps/plugin-process";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);
  const setHistory = useSpriteStore((state: SpriteState) => state.setHistory);
  const undo = useSpriteStore((state: SpriteState) => state.undo);
  const redo = useSpriteStore((state: SpriteState) => state.redo);
  const savePath = useSpriteStore((state: SpriteState) => state.savePath);
  const saveSprite = useSpriteStore((state: SpriteState) => state.saveSprite);
  const openSprite = useSpriteStore((state: SpriteState) => state.openSprite);

  const openAction = useCallback(async () => {
    if (sprite) {
      const confirmation = await confirm(
        "Any unsaved changes will be lost. Are you sure you want to open a new file?"
      );
      if (!confirmation) return;
    }

    const path = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Spritely Files", extensions: ["spr"] }],
    });

    if (!path) return;
    await openSprite(path);
  }, [sprite, openSprite]);

  const saveAsAction = useCallback(async () => {
    const path = await save({
      defaultPath: `${sprite?.name}.spr`,
      filters: [{ name: "Spritely Files", extensions: ["spr"] }],
    });

    if (!path) return;
    await saveSprite(path);
  }, [sprite, saveSprite]);

  const saveAction = useCallback(async () => {
    if (!savePath) return await saveAsAction();
    await saveSprite(savePath);
  }, [savePath, saveAsAction]);

  const menus = [
    {
      name: "File",
      items: [
        {
          name: "New",
          action: async () => {
            if (sprite) {
              const confirmation = await confirm(
                "Any unsaved changes will be lost. Are you sure you want to open a new file?"
              );
              if (!confirmation) return;
            }
            setSprite(undefined);
            setHistory([], []);
          },
          key: {
            name: "n",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
        {
          name: "Open",
          action: openAction,
          key: {
            name: "o",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
        {
          name: "Save",
          action: saveAction,
          key: {
            name: "s",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
        {
          name: "Save As",
          action: saveAsAction,
          key: {
            name: "s",
            modifiers: { meta: true, shift: true, alt: false },
          },
        },
        {
          name: "Export",
          action: () => setDialogOpen(true),
          key: {
            name: "e",
            modifiers: { meta: true, shift: false, alt: false },
          },
        },
        {
          name: "Exit",
          action: async () => {
            if (sprite) {
              const confirmation = await confirm(
                "Any unsaved changes will be lost. Are you sure you want to exit?"
              );
              if (!confirmation) return;
            }
            await exit();
          },
          key: {
            name: null,
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

  async function handleKeyDown(event: KeyboardEvent) {
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
          await item.action();
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Sprite</DialogTitle>
            <DialogDescription>
              Choose a format to export your sprite.
            </DialogDescription>
          </DialogHeader>
          <ExportSpriteForm />
        </DialogContent>
      </Dialog>
      <Menubar>
        {menus.map(menu => (
          <MenubarMenu key={menu.name}>
            <MenubarTrigger>{menu.name}</MenubarTrigger>
            <MenubarContent>
              {menu.items.map(item => (
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
