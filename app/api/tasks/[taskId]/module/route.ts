import { readFile } from "node:fs/promises"

import ts from "typescript"

import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { getUserTaskFilePath } from "@/lib/user/server"

type Params = { taskId: string }

export const dynamic = "force-dynamic"
export const revalidate = 0

function transpile(code: string, fileName: string) {
  const res = ts.transpileModule(code, {
    fileName,
    compilerOptions: {
      target: ts.ScriptTarget.ES2017,
      module: ts.ModuleKind.CommonJS,
      // Важно: используем классический runtime, чтобы не было import 'react/jsx-runtime'
      jsx: ts.JsxEmit.React,
      esModuleInterop: false,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
  })
  return res.outputText
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function createServerRequire() {
  return (specifier: string) => {
    if (specifier.endsWith(".css")) return {}
    if (specifier === "./props") return {}
    throw new Error(`Неподдерживаемая зависимость в mock/styles: ${specifier}`)
  }
}

function executeCommonJsModule(js: string) {
  const exportsObj: Record<string, unknown> = {}
  const moduleObj: { exports: Record<string, unknown> | unknown } = { exports: exportsObj }
  const fn = new Function("module", "exports", "require", js)
  fn(moduleObj, exportsObj, createServerRequire())
  return moduleObj.exports
}

function extractExpectedPropNames(componentRaw: string): string[] {
  const match = componentRaw.match(/\(\{\s*([^}]*)\}\s*(?::[^)]*)?\)\s*=>/)
  if (!match) return []

  return match[1]
    .split(",")
    .map((part) => part.trim())
    .map((part) => part.replace(/=[\s\S]*$/, "").trim())
    .map((part) => part.replace(/\?.*$/, "").trim())
    .map((part) => part.replace(/:.*$/, "").trim())
    .filter(Boolean)
}

function pickPropsFromMock(
  mockJs: string,
  expectedPropNames: string[],
): Record<string, unknown> {
  let exportsValue: unknown

  try {
    exportsValue = executeCommonJsModule(mockJs)
  } catch {
    return {}
  }

  if (!isPlainObject(exportsValue)) return {}

  const explicit = exportsValue.mockProps ?? exportsValue.mock
  if (isPlainObject(explicit)) return explicit

  const entries = Object.entries(exportsValue).filter(([key]) => key !== "__esModule")
  if (entries.length === 0) return {}

  const firstExpectedProp = expectedPropNames[0]
  if (firstExpectedProp && entries.length === 1) {
    const [, singleValue] = entries[0]

    if (Array.isArray(singleValue)) {
      const firstItem = singleValue[0]
      if (isPlainObject(firstItem) && firstExpectedProp in firstItem) {
        return firstItem
      }

      return { [firstExpectedProp]: singleValue }
    }

    if (isPlainObject(singleValue)) {
      return singleValue
    }

    return { [firstExpectedProp]: singleValue }
  }

  for (const [, value] of entries) {
    if (
      isPlainObject(value) &&
      expectedPropNames.length > 0 &&
      expectedPropNames.every((propName) => propName in value)
    ) {
      return value
    }
  }

  return {}
}

function buildClientRuntimeModule(files: {
  componentJs: string
  stylesJs: string
  mockJs: string
  propsJs: string
}) {
  return `
const __UI_BARREL__ = (() => {
  const div = ({ children, ...props }) => React.createElement("div", props, children);
  const span = ({ children, ...props }) => React.createElement("span", props, children);
  const button = ({ children, type = "button", ...props }) => React.createElement("button", { type, ...props }, children);
  const input = (props) => React.createElement("input", props);
  const textarea = (props) => React.createElement("textarea", props);
  const select = ({ children, ...props }) => React.createElement("select", props, children);
  const option = ({ children, ...props }) => React.createElement("option", props, children);
  const table = ({ children, ...props }) => React.createElement("table", props, children);
  const thead = ({ children, ...props }) => React.createElement("thead", props, children);
  const tbody = ({ children, ...props }) => React.createElement("tbody", props, children);
  const tfoot = ({ children, ...props }) => React.createElement("tfoot", props, children);
  const tr = ({ children, ...props }) => React.createElement("tr", props, children);
  const th = ({ children, ...props }) => React.createElement("th", props, children);
  const td = ({ children, ...props }) => React.createElement("td", props, children);
  const noop = () => {};
  const variant = () => "";

  return {
    Accordion: div,
    AccordionContent: div,
    AccordionItem: div,
    AccordionTrigger: button,
    Alert: div,
    AlertAction: div,
    AlertDescription: div,
    AlertDialog: div,
    AlertDialogAction: button,
    AlertDialogCancel: button,
    AlertDialogContent: div,
    AlertDialogDescription: div,
    AlertDialogFooter: div,
    AlertDialogHeader: div,
    AlertDialogMedia: div,
    AlertDialogOverlay: div,
    AlertDialogPortal: div,
    AlertDialogTitle: div,
    AlertDialogTrigger: button,
    AlertTitle: div,
    AspectRatio: div,
    Avatar: div,
    AvatarBadge: span,
    AvatarFallback: span,
    AvatarGroup: div,
    AvatarGroupCount: span,
    AvatarImage: (props) => React.createElement("img", props),
    Badge: span,
    Breadcrumb: div,
    BreadcrumbEllipsis: span,
    BreadcrumbItem: div,
    BreadcrumbLink: ({ children, ...props }) => React.createElement("a", props, children),
    BreadcrumbList: div,
    BreadcrumbPage: span,
    BreadcrumbSeparator: span,
    Button: button,
    ButtonGroup: div,
    ButtonGroupSeparator: span,
    ButtonGroupText: span,
    Calendar: div,
    CalendarDayButton: button,
    Card: div,
    CardAction: div,
    CardContent: div,
    CardDescription: div,
    CardFooter: div,
    CardHeader: div,
    CardTitle: div,
    Carousel: div,
    CarouselContent: div,
    CarouselItem: div,
    CarouselNext: button,
    CarouselPrevious: button,
    ChartContainer: div,
    ChartLegend: div,
    ChartLegendContent: div,
    ChartStyle: () => null,
    ChartTooltip: div,
    ChartTooltipContent: div,
    Checkbox: ({ checked, defaultChecked, ...props }) => React.createElement("input", { type: "checkbox", checked, defaultChecked, ...props }),
    Collapsible: div,
    CollapsibleContent: div,
    CollapsibleTrigger: button,
    Combobox: div,
    ComboboxChip: span,
    ComboboxChips: div,
    ComboboxChipsInput: input,
    ComboboxCollection: div,
    ComboboxContent: div,
    ComboboxEmpty: div,
    ComboboxGroup: div,
    ComboboxInput: input,
    ComboboxItem: div,
    ComboboxLabel: span,
    ComboboxList: div,
    ComboboxSeparator: div,
    ComboboxTrigger: button,
    ComboboxValue: span,
    Command: div,
    CommandDialog: div,
    CommandEmpty: div,
    CommandGroup: div,
    CommandInput: input,
    CommandItem: div,
    CommandList: div,
    CommandSeparator: div,
    CommandShortcut: span,
    ContextMenu: div,
    ContextMenuCheckboxItem: div,
    ContextMenuContent: div,
    ContextMenuGroup: div,
    ContextMenuItem: div,
    ContextMenuLabel: div,
    ContextMenuPortal: div,
    ContextMenuRadioGroup: div,
    ContextMenuRadioItem: div,
    ContextMenuSeparator: div,
    ContextMenuShortcut: span,
    ContextMenuSub: div,
    ContextMenuSubContent: div,
    ContextMenuSubTrigger: div,
    ContextMenuTrigger: div,
    Dialog: div,
    DialogClose: button,
    DialogContent: div,
    DialogDescription: div,
    DialogFooter: div,
    DialogHeader: div,
    DialogOverlay: div,
    DialogPortal: div,
    DialogTitle: div,
    DialogTrigger: button,
    DirectionProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    Drawer: div,
    DrawerClose: button,
    DrawerContent: div,
    DrawerDescription: div,
    DrawerFooter: div,
    DrawerHeader: div,
    DrawerOverlay: div,
    DrawerPortal: div,
    DrawerTitle: div,
    DrawerTrigger: button,
    DropdownMenu: div,
    DropdownMenuCheckboxItem: div,
    DropdownMenuContent: div,
    DropdownMenuGroup: div,
    DropdownMenuItem: div,
    DropdownMenuLabel: div,
    DropdownMenuPortal: div,
    DropdownMenuRadioGroup: div,
    DropdownMenuRadioItem: div,
    DropdownMenuSeparator: div,
    DropdownMenuShortcut: span,
    DropdownMenuSub: div,
    DropdownMenuSubContent: div,
    DropdownMenuSubTrigger: div,
    DropdownMenuTrigger: button,
    Empty: div,
    EmptyContent: div,
    EmptyDescription: div,
    EmptyHeader: div,
    EmptyMedia: div,
    EmptyTitle: div,
    Field: div,
    FieldContent: div,
    FieldDescription: div,
    FieldError: div,
    FieldGroup: div,
    FieldLabel: ({ children, ...props }) => React.createElement("label", props, children),
    FieldLegend: ({ children, ...props }) => React.createElement("legend", props, children),
    FieldSeparator: div,
    FieldSet: ({ children, ...props }) => React.createElement("fieldset", props, children),
    FieldTitle: div,
    HoverCard: div,
    HoverCardContent: div,
    HoverCardTrigger: div,
    Input: input,
    InputGroup: div,
    InputGroupAddon: span,
    InputGroupButton: button,
    InputGroupInput: input,
    InputGroupText: span,
    InputGroupTextarea: textarea,
    InputOTP: div,
    InputOTPGroup: div,
    InputOTPSeparator: span,
    InputOTPSlot: span,
    Item: div,
    ItemActions: div,
    ItemContent: div,
    ItemDescription: div,
    ItemFooter: div,
    ItemGroup: div,
    ItemHeader: div,
    ItemMedia: div,
    ItemSeparator: div,
    ItemTitle: div,
    Kbd: span,
    KbdGroup: span,
    Label: ({ children, ...props }) => React.createElement("label", props, children),
    Menubar: div,
    MenubarCheckboxItem: div,
    MenubarContent: div,
    MenubarGroup: div,
    MenubarItem: div,
    MenubarLabel: div,
    MenubarMenu: div,
    MenubarPortal: div,
    MenubarRadioGroup: div,
    MenubarRadioItem: div,
    MenubarSeparator: div,
    MenubarShortcut: span,
    MenubarSub: div,
    MenubarSubContent: div,
    MenubarSubTrigger: div,
    MenubarTrigger: button,
    NativeSelect: select,
    NativeSelectOptGroup: ({ children, ...props }) => React.createElement("optgroup", props, children),
    NativeSelectOption: option,
    NavigationMenu: div,
    NavigationMenuContent: div,
    NavigationMenuIndicator: div,
    NavigationMenuItem: div,
    NavigationMenuLink: ({ children, ...props }) => React.createElement("a", props, children),
    NavigationMenuList: div,
    NavigationMenuTrigger: button,
    NavigationMenuViewport: div,
    Pagination: div,
    PaginationContent: div,
    PaginationEllipsis: span,
    PaginationItem: div,
    PaginationLink: ({ children, ...props }) => React.createElement("a", props, children),
    PaginationNext: ({ children = "Next", ...props }) => React.createElement("a", props, children),
    PaginationPrevious: ({ children = "Previous", ...props }) => React.createElement("a", props, children),
    Popover: div,
    PopoverAnchor: div,
    PopoverContent: div,
    PopoverDescription: div,
    PopoverHeader: div,
    PopoverTitle: div,
    PopoverTrigger: button,
    Progress: ({ value, ...props }) => React.createElement("progress", { value, max: 100, ...props }),
    RadioGroup: div,
    RadioGroupItem: (props) => React.createElement("input", { type: "radio", ...props }),
    ResizableHandle: div,
    ResizablePanel: div,
    ResizablePanelGroup: div,
    ScrollArea: div,
    ScrollBar: div,
    Select: select,
    SelectContent: div,
    SelectGroup: div,
    SelectItem: option,
    SelectLabel: span,
    SelectScrollDownButton: button,
    SelectScrollUpButton: button,
    SelectSeparator: div,
    SelectTrigger: button,
    SelectValue: span,
    Separator: div,
    Sheet: div,
    SheetClose: button,
    SheetContent: div,
    SheetDescription: div,
    SheetFooter: div,
    SheetHeader: div,
    SheetTitle: div,
    SheetTrigger: button,
    Sidebar: div,
    SidebarContent: div,
    SidebarFooter: div,
    SidebarGroup: div,
    SidebarGroupAction: button,
    SidebarGroupContent: div,
    SidebarGroupLabel: div,
    SidebarHeader: div,
    SidebarInput: input,
    SidebarInset: div,
    SidebarMenu: div,
    SidebarMenuAction: button,
    SidebarMenuBadge: span,
    SidebarMenuButton: button,
    SidebarMenuItem: div,
    SidebarMenuSkeleton: div,
    SidebarMenuSub: div,
    SidebarMenuSubButton: button,
    SidebarMenuSubItem: div,
    SidebarProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SidebarRail: div,
    SidebarSeparator: div,
    SidebarTrigger: button,
    Skeleton: div,
    Slider: (props) => React.createElement("input", { type: "range", ...props }),
    Spinner: span,
    Switch: (props) => React.createElement("input", { type: "checkbox", role: "switch", ...props }),
    Table: table,
    TableBody: tbody,
    TableCaption: ({ children, ...props }) => React.createElement("caption", props, children),
    TableCell: td,
    TableFooter: tfoot,
    TableHead: th,
    TableHeader: thead,
    TableRow: tr,
    Tabs: div,
    TabsContent: div,
    TabsList: div,
    TabsTrigger: button,
    Textarea: textarea,
    Toaster: () => null,
    Toggle: button,
    ToggleGroup: div,
    ToggleGroupItem: button,
    Tooltip: div,
    TooltipContent: div,
    TooltipProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    TooltipTrigger: div,
    badgeVariants: variant,
    buttonGroupVariants: variant,
    buttonVariants: variant,
    navigationMenuTriggerStyle: variant,
    tabsListVariants: variant,
    toggleVariants: variant,
    useCarousel: () => ({}),
    useComboboxAnchor: () => null,
    useDirection: () => "ltr",
    useSidebar: () => ({ open: false, setOpen: noop, toggleSidebar: noop }),
  };
})();

const __BUILTINS__ = {
  "@/components/shadcn/ui": (() => {
    return __UI_BARREL__;
  })(),
  "@/components/ui": (() => {
    return __UI_BARREL__;
  })(),
  "@/components/ui/": (() => {
    return __UI_BARREL__;
  })(),
  "@/components/ui/button": (() => {
    const Button = ({ children, type = "button", ...props }) => React.createElement("button", { type, ...props }, children);
    return { Button };
  })(),
  "@/components/ui/Button": (() => {
    const Button = ({ children, type = "button", ...props }) => React.createElement("button", { type, ...props }, children);
    return { Button };
  })(),
  "@/components/ui/input": (() => {
    const Input = (props) => React.createElement("input", props);
    return { Input };
  })(),
  "@/components/ui/textarea": (() => {
    const Textarea = (props) => React.createElement("textarea", props);
    return { Textarea };
  })(),
  "@/components/ui/checkbox": (() => {
    const Checkbox = ({ checked, defaultChecked, ...props }) =>
      React.createElement("input", {
        type: "checkbox",
        checked,
        defaultChecked,
        ...props,
      });
    return { Checkbox };
  })(),
  "@/components/ui/label": (() => {
    const Label = ({ children, ...props }) => React.createElement("label", props, children);
    return { Label };
  })(),
  "@/components/ui/badge": (() => {
    const Badge = ({ children, ...props }) => React.createElement("span", props, children);
    return { Badge };
  })(),
  "@/components/ui/card": (() => {
    const Card = ({ children, ...props }) => React.createElement("div", props, children);
    const CardHeader = ({ children, ...props }) => React.createElement("div", props, children);
    const CardTitle = ({ children, ...props }) => React.createElement("div", props, children);
    const CardDescription = ({ children, ...props }) => React.createElement("div", props, children);
    const CardContent = ({ children, ...props }) => React.createElement("div", props, children);
    const CardFooter = ({ children, ...props }) => React.createElement("div", props, children);
    return {
      Card,
      CardHeader,
      CardTitle,
      CardDescription,
      CardContent,
      CardFooter,
    };
  })(),
};

const __MODULES__ = {
  "./Component": function(module, exports, require) {
${files.componentJs}
  },
  "./styles": function(module, exports, require) {
${files.stylesJs}
  },
  "./mock": function(module, exports, require) {
${files.mockJs}
  },
  "./props": function(module, exports, require) {
${files.propsJs}
  }
};

const __CACHE__ = {};

function __desengineLoad(specifier) {
  if (specifier === "react") {
    return { ...React, default: React };
  }

  if (Object.prototype.hasOwnProperty.call(__BUILTINS__, specifier)) {
    return __BUILTINS__[specifier];
  }

  if (specifier.startsWith("@/components/ui/")) {
    return __UI_BARREL__;
  }

  if (specifier.endsWith(".css")) {
    return {};
  }

  if (!Object.prototype.hasOwnProperty.call(__MODULES__, specifier)) {
    throw new Error("Неподдерживаемая зависимость: " + specifier);
  }

  if (__CACHE__[specifier]) {
    return __CACHE__[specifier].exports;
  }

  const localModule = { exports: {} };
  __CACHE__[specifier] = localModule;
  __MODULES__[specifier](localModule, localModule.exports, __desengineLoad);
  return localModule.exports;
}

const __desengineEntry__ = __desengineLoad("./Component");
module.exports = __desengineEntry__;
`.trimStart()
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params

  const componentPath = getUserTaskFilePath(taskId, "Component.tsx")
  const stylesPath = getUserTaskFilePath(taskId, "styles.ts")
  const mockPath = getUserTaskFilePath(taskId, "mock.ts")
  const propsPath = getUserTaskFilePath(taskId, "props.ts")

  const [componentRaw, stylesRaw, mockRaw, propsRaw] = await Promise.all([
    readFile(componentPath, "utf-8"),
    readFile(stylesPath, "utf-8").catch(() => "export const styles = {};"),
    readFile(mockPath, "utf-8").catch(() => "export const mock = {};"),
    readFile(propsPath, "utf-8").catch(() => "export {};"),
  ])

  const stylesJs = transpile(stylesRaw, stylesPath)
  const mockJs = transpile(mockRaw, mockPath)
  const propsJs = transpile(propsRaw, propsPath)
  const componentJs = transpile(componentRaw, componentPath)
  const props = pickPropsFromMock(mockJs, extractExpectedPropNames(componentRaw))

  const runtimeModule = buildClientRuntimeModule({
    componentJs,
    stylesJs,
    mockJs,
    propsJs,
  })

  return Response.json(
    { ok: true, module: runtimeModule, props },
    {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    },
  )
}
