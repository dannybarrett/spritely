import "./App.css";
import { SpriteState, useSpriteStore } from "./stores/spriteStore";
import CreateSpriteForm from "./components/CreateSpriteForm";
import Layout from "./components/Layout";
import Editor from "./components/editor/Editor";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function App() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const prevHistory = useSpriteStore((state: SpriteState) => state.prevHistory);
  const nextHistory = useSpriteStore((state: SpriteState) => state.nextHistory);

  useEffect(() => {
    async function updateTitle() {
      if (!sprite) {
        await getCurrentWindow().setTitle("Create Sprite - Spritely");
      } else {
        await getCurrentWindow()
          .setTitle(
            `${sprite.name}${
              prevHistory.length > 0 || nextHistory.length > 0 ? "*" : ""
            } - Spritely`
          )
          .catch(error => console.error(error));
      }
    }
    updateTitle();
  }, [sprite, prevHistory, nextHistory]);

  return <Layout>{sprite ? <Editor /> : <CreateSpriteForm />}</Layout>;
}
