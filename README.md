# TabRouter

A powerful tab-based routing system for React applications using Context API. TabRouter allows you to manage multiple routes as tabs, similar to browser tabs, with full state persistence and programmatic control.

## Features

- 🗂️ **Tab-based routing** - Manage multiple routes as tabs
- 💾 **State persistence** - Automatically persists tabs in sessionStorage
- 🎯 **Context API** - Built on React Context API, no external dependencies
- 🎣 **React Hooks** - Simple and intuitive hooks API
- 📦 **TypeScript support** - Full TypeScript definitions included
- ⚙️ **Configurable** - Customize storage keys and initial paths

## Installation

```bash
npm install tabrouter
```

or

```bash
yarn add tabrouter
```

## Peer Dependencies

TabRouter requires the following peer dependency:

- `react` >= 16.8.0

## Quick Start

### 1. Setup TabRouter Provider

Wrap your app with the `TabRouterProvider`:

```tsx
import { TabRouterProvider } from "tabrouter";

function App() {
  return (
    <TabRouterProvider
      config={{
        storageKey: "myapp-tabs", // optional, defaults to "tabrouter-tabs"
        activeTabStorageKey: "myapp-active-tab", // optional, defaults to "tabrouter-active-tab"
        initialPath: "/", // optional, defaults to "/"
      }}
    >
      {/* Your app components */}
    </TabRouterProvider>
  );
}
```

### 2. Use the Link Component or Hooks

You can use the `Link` component (similar to Next.js) or hooks:

```tsx
import { Link, useTabRouter } from "tabrouter";

function Navigation() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/users?id=123">User 123</Link>
      <Link href={{ path: "/settings", params: { tab: "profile" } }}>
        Settings
      </Link>
    </nav>
  );
}

function MyComponent() {
  const { push, pathname, active, tabs } = useTabRouter();

  return (
    <div>
      <p>Current path: {pathname}</p>
      <button onClick={() => push("/dashboard")}>Go to Dashboard</button>
      <button onClick={() => push({ path: "/users", params: { id: "123" } })}>
        Go to User
      </button>
    </div>
  );
}
```

## API Reference

### `<Link>`

Next.js-style Link component for navigation.

**Props:**
- `href: string | { path: string; params?: Record<string, string | number> }` - The path to navigate to
- `replace?: boolean` - If `true`, replaces current tab instead of opening new one (default: `false`)
- `target?: string` - If `"_blank"`, uses `push` to open new tab (default: `undefined`)
- `prefetch?: boolean` - Reserved for future use
- `scroll?: boolean` - Reserved for future use
- `onClick?: (e: MouseEvent<HTMLAnchorElement>) => void` - Click handler
- All standard anchor tag props (`className`, `style`, etc.) are supported

**Behavior:**
- If `target="_blank"`, uses `push` (opens new tab)
- If `replace={true}`, uses `replace` (replaces current tab)
- If tab already exists, switches to it instead of creating duplicate
- Supports query params in href string (`/users?id=123`) or as object
- Supports hash in href (`/page#section`) with smooth scrolling
- Prevents default navigation and handles routing internally

**Examples:**
```tsx
import { Link } from "tabrouter";

// Simple link
<Link href="/dashboard">Dashboard</Link>

// Link with query params (string)
<Link href="/users?id=123&name=John">User</Link>

// Link with query params (object)
<Link href={{ path: "/users", params: { id: 123, name: "John" } }}>
  User
</Link>

// Link with hash
<Link href="/page#section">Section</Link>

// Replace current tab
<Link href="/settings" replace>Settings</Link>

// Open in new tab (uses push)
<Link href="/external" target="_blank">External</Link>

// With custom className and onClick
<Link 
  href="/dashboard" 
  className="nav-link"
  onClick={(e) => console.log("Clicked!")}
>
  Dashboard
</Link>
```

### `useRouter()`

Next.js-style router hook. Similar to `useTabRouter()` but with additional Next.js-compatible methods.

**Returns:**
- `pathname: string` - Current active path
- `query: Record<string, string | number>` - Query parameters
- `asPath: string` - Alias for pathname (Next.js compatibility)
- `push(url)` - Navigate to a new path
- `replace(url)` - Replace current tab
- `back()` - Go back to previous tab
- `reload()` - Reload current tab
- `prefetch()` - Reserved for future use
- `closePath(path)` - Close a tab by path
- `closeOthers(path)` - Close all other tabs
- `switchToPath(path)` - Switch to an existing tab
- `reorderTabs(fromIndex, toIndex)` - Reorder tabs
- `active: Tab | null` - Active tab
- `active_index: number` - Active tab index
- `tabs: Tab[]` - All tabs

**Example:**
```tsx
import { useRouter } from "tabrouter";

function MyComponent() {
  const router = useRouter();

  return (
    <div>
      <p>Current path: {router.pathname}</p>
      <button onClick={() => router.push("/dashboard")}>Dashboard</button>
      <button onClick={() => router.back()}>Back</button>
      <button onClick={() => router.reload()}>Reload</button>
    </div>
  );
}
```

### `TabRouterProvider`

Context provider component that manages tab state.

**Props:**
- `children: ReactNode` - Your app components
- `config?: TabRouterConfig` - Configuration object (optional)
  - `storageKey?: string` - Key for storing tabs in sessionStorage (default: `"tabrouter-tabs"`)
  - `activeTabStorageKey?: string` - Key for storing active tab index (default: `"tabrouter-active-tab"`)
  - `initialPath?: string` - Initial path for the first tab (default: `"/"`)

**Example:**
```tsx
<TabRouterProvider config={{ storageKey: "myapp-tabs", initialPath: "/home" }}>
  <App />
</TabRouterProvider>
```

### `useTabRouter()`

Main hook for tab routing functionality. Must be used within a `TabRouterProvider`.

**Returns:**
- `query: Record<string, string | number>` - Query parameters from the active tab
- `pathname: string` - Current active path
- `active: Tab | null` - Active tab object
- `active_index: number` - Index of the active tab
- `tabs: Tab[]` - Array of all tabs
- `push(url)` - Navigate to a new path (opens new tab if path doesn't exist)
- `replace(url)` - Replace current tab with new path
- `closePath(path)` - Close a tab by path
- `closeOthers(path)` - Close all tabs except the specified path
- `switchToPath(path)` - Switch to an existing tab by path
- `reorderTabs(fromIndex, toIndex)` - Reorder tabs by dragging

**Example:**
```tsx
const { push, replace, closePath, switchToPath } = useTabRouter();

// Navigate to a new path
push("/dashboard");

// Navigate with parameters
push({ path: "/users", params: { id: "123", name: "John" } });

// Replace current tab
replace("/settings");

// Close a tab
closePath("/dashboard");

// Switch to an existing tab
switchToPath("/users");
```

### `useTabs()`

Alternative hook for tab management with different method names. Must be used within a `TabRouterProvider`.

**Returns:**
- `openTab(tabData)` - Open a new tab
- `closeTab(tabId)` - Close a tab by path
- `closeOtherTabs(tabId)` - Close all other tabs
- `switchToTab(path)` - Switch to a tab by path
- `reorderTabs(fromIndex, toIndex)` - Reorder tabs
- `isTabOpen(path)` - Check if a tab is open
- `getTabByPath(path)` - Get tab object by path
- `active: Tab | null` - Active tab
- `active_index: number` - Active tab index
- `tabs: Tab[]` - All tabs

**Example:**
```tsx
const { openTab, isTabOpen, getTabByPath } = useTabs();

// Open a new tab
openTab({ path: "/dashboard", params: { view: "grid" } });

// Check if tab is open
if (isTabOpen("/dashboard")) {
  console.log("Dashboard is already open");
}

// Get tab by path
const tab = getTabByPath("/dashboard");
```

## Types

### `Tab`

```typescript
interface Tab {
  path: string;
  params?: Record<string, string | number>;
}
```

### `TabsState`

```typescript
interface TabsState {
  tabs: Tab[];
  active_index: number;
}
```

### `TabRouterConfig`

```typescript
interface TabRouterConfig {
  storageKey?: string;
  activeTabStorageKey?: string;
  initialPath?: string;
}
```

## Advanced Usage

### Custom Storage Keys

If you need multiple tab routers in the same app, use different storage keys:

```tsx
function App() {
  return (
    <>
      <TabRouterProvider config={{ storageKey: "main-tabs" }}>
        <MainApp />
      </TabRouterProvider>
      <TabRouterProvider config={{ storageKey: "sidebar-tabs" }}>
        <SidebarApp />
      </TabRouterProvider>
    </>
  );
}
```

### Building a Tab Bar Component

```tsx
import { useTabRouter } from "tabrouter";

function TabBar() {
  const { tabs, active, switchToPath, closePath } = useTabRouter();

  return (
    <div className="tab-bar">
      {tabs.map((tab, index) => (
        <div
          key={tab.path}
          className={active?.path === tab.path ? "active" : ""}
          onClick={() => switchToPath(tab.path)}
        >
          {tab.path}
          {tabs.length > 1 && (
            <button onClick={() => closePath(tab.path)}>×</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Conditional Rendering Based on Active Tab

```tsx
import { useTabRouter } from "tabrouter";

function App() {
  const { pathname, active } = useTabRouter();

  return (
    <div>
      {pathname === "/dashboard" && <Dashboard />}
      {pathname === "/users" && <Users params={active?.params} />}
      {pathname === "/settings" && <Settings />}
    </div>
  );
}
```

### Complete Example

```tsx
import React from "react";
import { TabRouterProvider, useTabRouter } from "tabrouter";

function TabNavigation() {
  const { tabs, active, switchToPath, closePath } = useTabRouter();

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={active?.path === tab.path ? "active" : ""}
          onClick={() => switchToPath(tab.path)}
        >
          {tab.path}
          {tabs.length > 1 && (
            <button onClick={() => closePath(tab.path)}>×</button>
          )}
        </div>
      ))}
    </div>
  );
}

function Content() {
  const { pathname, push } = useTabRouter();

  return (
    <div>
      <button onClick={() => push("/dashboard")}>Dashboard</button>
      <button onClick={() => push("/users")}>Users</button>
      <button onClick={() => push("/settings")}>Settings</button>
      
      <div className="content">
        {pathname === "/dashboard" && <Dashboard />}
        {pathname === "/users" && <Users />}
        {pathname === "/settings" && <Settings />}
      </div>
    </div>
  );
}

function App() {
  return (
    <TabRouterProvider>
      <TabNavigation />
      <Content />
    </TabRouterProvider>
  );
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
