import "./App.css";
import { SpriteState, useSpriteStore } from "./stores/spriteStore";
import CreateSpriteForm from "./components/CreateSpriteForm";
import Layout from "./components/Layout";

export default function App() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);

  return <Layout>{sprite ? <div>editor</div> : <CreateSpriteForm />}</Layout>;
}
