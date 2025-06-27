import { ReactNode } from "react";
import Brushes from "./Brushes";
import Colors from "./Colors";
import Nav from "./Nav";

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-rows-[auto_1fr] h-screen w-full">
      <Nav />
      <div className="grid grid-cols-[auto_1fr_auto]">
        <Brushes />
        {children}
        <Colors />
      </div>
    </div>
  );
}
