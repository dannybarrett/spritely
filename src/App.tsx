import "./App.css";
import { SpriteState, useSpriteStore } from "./stores/spriteStore";
import CreateSpriteForm from "./components/CreateSpriteForm";
import Layout from "./components/Layout";
import Editor from "./components/editor/Editor";

export default function App() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);

  return <Layout>{sprite ? <Editor /> : <CreateSpriteForm />}</Layout>;
}
