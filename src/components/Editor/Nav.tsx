import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar";
import { useCallback, useEffect } from "react";
import { open, confirm, save } from "@tauri-apps/plugin-dialog";
import { exit } from "@tauri-apps/plugin-process";

export default function Nav() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);
  const undo = useSpriteStore((state: SpriteState) => state.undo);
  const redo = useSpriteStore((state: SpriteState) => state.redo);
  const saveSprite = useSpriteStore((state: SpriteState) => state.save);
  const savePath = useSpriteStore((state: SpriteState) => state.savePath);
  const setSavePath = useSpriteStore((state: SpriteState) => state.setSavePath);
  const openSprite = useSpriteStore((state: SpriteState) => state.open);
  const history = useSpriteStore((state: SpriteState) => state.history);
  const setHistory = useSpriteStore((state: SpriteState) => state.setHistory);
  const exportSprite = useSpriteStore(
    (state: SpriteState) => state.exportSprite
  );

  const confirmSavedAction = useCallback(async () => {
    let isSaved = true;

    if (sprite && (history.prev.length > 0 || history.next.length > 0)) {
      isSaved = await confirm(
        "All unsaved changes will be lost. Are you sure you want to continue?",
        {
          title: "Create new sprite",
          kind: "warning",
        }
      );
    }

    return isSaved;
  }, [sprite, history]);

  const saveSpriteAsAction = useCallback(async () => {
    let path = await save({
      defaultPath: `${sprite?.name ?? "untitled"}.spr`,
      filters: [
        {
          name: "Spritely Files",
          extensions: ["spr"],
        },
      ],
    });

    if (path) {
      saveSprite(path);
    }
  }, [sprite, saveSprite]);

  const saveSpriteAction = useCallback(async () => {
    if (!savePath) return saveSpriteAsAction();
    saveSprite(savePath);
  }, [saveSprite, savePath, saveSpriteAsAction]);

  const exportSpriteAsAction = useCallback(async () => {
    let path = await save({
      defaultPath: `${sprite?.name ?? "untitled"}.png`,
      filters: [
        {
          name: "PNG Files",
          extensions: ["png"],
        },
      ],
    });

    if (path) {
      exportSprite(path);
    }
  }, [sprite, exportSprite]);

  const exportSpriteAction = useCallback(async () => {
    if (!savePath) return exportSpriteAsAction();
    exportSprite(savePath);
  }, [exportSprite, savePath, exportSpriteAsAction]);

  const newSpriteAction = useCallback(async () => {
    let canCreate = await confirmSavedAction();

    if (canCreate) {
      setSprite(undefined);
      setHistory({
        prev: [],
        next: [],
      });
      setSavePath(undefined);
    }
  }, [confirmSavedAction, setSprite, setHistory, setSavePath]);

  const openSpriteAction = useCallback(async () => {
    let canOpen = await confirmSavedAction();

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
  }, [confirmSavedAction, openSprite]);

  const exitAction = useCallback(async () => {
    const canExit = await confirmSavedAction();

    if (canExit) {
      await exit();
    }
  }, [confirmSavedAction]);

  const handleInput = useCallback(
    async (event: KeyboardEvent) => {
      event.preventDefault();
      console.log("key", event.key);
      let meta = false;
      let shift = false;

      if (event.metaKey || event.ctrlKey) meta = true;
      if (event.shiftKey) shift = true;

      if (meta && event.key.toLowerCase() === "z") {
        if (shift) {
          redo();
        } else {
          undo();
        }
      }

      // save
      if (event.key.toLowerCase() === "s" && meta) {
        if (shift) {
          saveSpriteAsAction();
        } else {
          saveSpriteAction();
        }
      }

      // export
      if (event.key.toLowerCase() === "e" && meta) {
        if (shift) {
          exportSpriteAsAction();
        } else {
          exportSpriteAction();
        }
      }

      // open
      if (event.key === "o" && meta) {
        openSpriteAction();
      }

      if (event.key === "n" && meta) {
        newSpriteAction();
      }
    },
    [
      undo,
      redo,
      saveSpriteAsAction,
      saveSpriteAction,
      openSpriteAction,
      newSpriteAction,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleInput);

    return () => document.removeEventListener("keydown", handleInput);
  }, [handleInput]);

  const menus = [
    {
      name: "File",
      items: [
        {
          name: "New",
          key: "Ctrl+N",
          disabled: false,
          onClick: () => newSpriteAction(),
        },
        {
          name: "Open",
          key: "Ctrl+O",
          disabled: false,
          onClick: () => openSpriteAction(),
        },
        {
          name: "Save",
          key: "Ctrl+S",
          disabled: false,
          onClick: () => saveSpriteAction(),
        },
        {
          name: "Save as",
          key: "Ctrl+Shift+S",
          disabled: false,
          onClick: () => saveSpriteAsAction(),
        },
        {
          name: "Export",
          key: "Ctrl+E",
          disabled: false,
          onClick: () => exportSpriteAction(),
        },
        {
          name: "Export as",
          key: "Ctrl+Shift+E",
          disabled: false,
          onClick: () => exportSpriteAsAction(),
        },
        {
          name: "Exit",
          key: "",
          disabled: false,
          onClick: async () => await exitAction(),
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
