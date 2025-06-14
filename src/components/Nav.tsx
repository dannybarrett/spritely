import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "./ui/menubar";

export default function Nav() {
  return (
    <Menubar className="rounded-none">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem className="flex justify-between">
            New <span className="font-mono">Ctrl+N</span>
          </MenubarItem>
          <MenubarItem className="flex justify-between">
            Save <span className="font-mono">Ctrl+S</span>
          </MenubarItem>
          <MenubarItem className="flex justify-between" disabled>
            Export <span className="font-mono">Ctrl+E</span>
          </MenubarItem>
          <MenubarItem className="flex justify-between">Exit</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
