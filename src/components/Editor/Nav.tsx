import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar";
import { useEffect } from "react";
import { open, confirm, save } from "@tauri-apps/plugin-dialog";

export default function Nav() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const undo = useSpriteStore((state: SpriteState) => state.undo);
  const redo = useSpriteStore((state: SpriteState) => state.redo);
  const saveSprite = useSpriteStore((state: SpriteState) => state.save);
  const savePath = useSpriteStore((state: SpriteState) => state.savePath);
  const openSprite = useSpriteStore((state: SpriteState) => state.open);
  const history = useSpriteStore((state: SpriteState) => state.history);

  async function handleInput(event: KeyboardEvent) {
    event.preventDefault();
    console.log("key", event.key);
    let meta = false;
    let shift = false;

    if (event.metaKey || event.ctrlKey) meta = true;
    if (event.shiftKey) shift = true;

    if (meta && event.key === "y") {
      redo();
    }

    if (meta && event.key === "z") {
      undo();
    }

    // save
    if (event.key === "s" && meta) {
      let path;

      if (!savePath) {
        path = await save({
          defaultPath: `${sprite?.name ?? "untitled"}.spr`,
          filters: [
            {
              name: "Spritely Files",
              extensions: ["spr"],
            },
          ],
        });
      }

      path = savePath ?? path;

      saveSprite(path ?? "");
    }

    // open
    if (event.key === "o" && meta) {
      let canOpen = true;
      if (sprite || history.prev.length > 0 || history.next.length > 0) {
        canOpen = await confirm(
          "All unsaved changes will be lost. Are you sure you want to continue?",
          {
            title: "Open sprite",
            kind: "warning",
          }
        );
      }

      if (canOpen) {
        const path = await open({
          multiple: false,
          filters: [
            {
              name: "Spritely Files",
              extensions: ["spr"],
            },
          ],
        });

        if (path) {
          openSprite(path);
        }
      }
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleInput);

    return () => document.removeEventListener("keydown", handleInput);
  }, []);

  const menus = [
    {
      name: "File",
      items: [
        {
          name: "New",
          key: "Ctrl+N",
          disabled: false,
          onClick: () => {},
        },
        {
          name: "Open",
          key: "Ctrl+O",
          disabled: false,
          onClick: () => {
            console.log("test");
          },
        },
        {
          name: "Save",
          key: "Ctrl+S",
          disabled: false,
          onClick: () => {},
        },
        {
          name: "Export",
          key: "Ctrl+E",
          disabled: false,
          onClick: () => {},
        },
        {
          name: "Exit",
          key: "",
          disabled: false,
          onClick: () => {},
        },
      ],
    },
    {
      name: "Edit",
      items: [
        {
          name: "Undo",
          key: "Ctrl+Z",
          onClick: () => undo(),
        },
        {
          name: "Redo",
          key: "Ctrl+Y",
          disabled: false,
          onClick: () => redo(),
        },
      ],
    },
  ];

  return (
    <Menubar>
      {menus.map(menu => (
        <MenubarMenu key={menu.name}>
          <MenubarTrigger>{menu.name}</MenubarTrigger>
          <MenubarContent>
            {menu.items.map(item => (
              <MenubarItem
                key={item.name}
                onClick={item.onClick}
                disabled={item.disabled}
                className="flex justify-between"
              >
                {item.name} <span className="font-code">{item.key}</span>
              </MenubarItem>
            ))}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}
