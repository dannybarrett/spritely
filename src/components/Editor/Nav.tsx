import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar";

export default function Nav() {
  const menus = [
    {
      name: "File",
      items: [
        {
          name: "New",
          key: "Ctrl+N",
          disabled: false,
          onClick: () => {},
        },
        {
          name: "Open",
          key: "Ctrl+O",
          disabled: false,
          onClick: () => {
            console.log("test");
          },
        },
        {
          name: "Save",
          key: "Ctrl+S",
          disabled: false,
          onClick: () => {},
        },
        {
          name: "Export",
          key: "Ctrl+E",
          disabled: false,
          onClick: () => {},
        },
        {
          name: "Exit",
          key: "",
          disabled: false,
          onClick: () => {},
        },
      ],
    },
    {
      name: "Edit",
      items: [
        {
          name: "Undo",
          key: "Ctrl+Z",
          disabled: false,
          onClick: () => {},
        },
        {
          name: "Redo",
          key: "Ctrl+Shift+Z",
          disabled: false,
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <Menubar>
      {menus.map(menu => (
        <MenubarMenu key={menu.name}>
          <MenubarTrigger>{menu.name}</MenubarTrigger>
          <MenubarContent>
            {menu.items.map(item => (
              <MenubarItem
                key={item.name}
                onClick={item.onClick}
                disabled={item.disabled}
                className="flex justify-between"
              >
                {item.name} <span className="font-code">{item.key}</span>
              </MenubarItem>
            ))}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}
