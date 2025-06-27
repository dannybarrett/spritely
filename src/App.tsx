import { useEffect } from "react";
import "./App.css";
import CreateSprite from "./components/CreateSprite";
import { SpriteState, useSpriteStore } from "./stores/spriteStore";

function App() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);

  useEffect(() => {
    console.log("sprite", sprite);
  }, [sprite]);

  if (!sprite) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <CreateSprite />
      </div>
    );
  }

  return <main>spritely</main>;
}

export default App;
