import { ReactNode } from "react";
import Brushes from "./Brushes";
import Colors from "./Colors";
import Nav from "./Nav";
import Frames from "./Frames";

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-rows-[auto_1fr] h-screen w-full">
      <Nav />
      <div className="grid grid-cols-[auto_1fr_auto]">
        <Brushes />
        <div className="grid grid-rows-[1fr_auto]">
          {children}
          <Frames />
        </div>
        <Colors />
      </div>
    </div>
  );
}
