import { Menubar, MenubarMenu, MenubarTrigger } from "./ui/menubar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
      {children}
    </div>
  );
}
