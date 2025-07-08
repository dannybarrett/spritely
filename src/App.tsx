import "./App.css";
import { SpriteState, useSpriteStore } from "./stores/spriteStore";
import CreateSpriteForm from "./components/CreateSpriteForm";

export default function App() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);

  if (!sprite) {
    return <CreateSpriteForm />;
  }

  return <div>hello</div>;
}
