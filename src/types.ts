export interface Tab {
    path: string;
    params?: Record<string, string | number>;
}

export interface TabsState {
    tabs: Tab[];
    active_index: number;
}

export interface TabRouterConfig {
    storageKey?: string;
    activeTabStorageKey?: string;
    initialPath?: string;
}

