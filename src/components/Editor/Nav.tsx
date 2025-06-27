import { Menubar, MenubarMenu, MenubarTrigger } from "../ui/menubar";

export default function Nav() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
}
