import { useEffect } from "react";
import "./App.css";
import CreateSprite from "./components/CreateSprite";
import Editor from "./components/Editor/Editor";
import EditorLayout from "./components/Editor/EditorLayout";
import { SpriteState, useSpriteStore } from "./stores/spriteStore";
import { getCurrentWindow } from "@tauri-apps/api/window";

function App() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const history = useSpriteStore((state: SpriteState) => state.history);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    async function updateTitle() {
      if (sprite) {
        await appWindow.setTitle(
          `Spritely - ${sprite.name}${
            history.prev.length > 0 || history.next.length > 0 ? "*" : ""
          }`
        );
      }
    }

    updateTitle();
  }, [sprite, appWindow]);

  if (!sprite) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <CreateSprite />
      </div>
    );
  }

  return (
    <EditorLayout>
      <Editor />
    </EditorLayout>
  );
}

export default App;
