import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Tab, TabsState, TabRouterConfig } from "./types";

// Action types
type TabsAction =
    | { type: "ADD_TAB"; payload: Tab }
    | { type: "REPLACE_TAB"; payload: Tab }
    | { type: "CLOSE_TAB"; payload: string }
    | { type: "CLOSE_OTHER_TABS"; payload: string }
    | { type: "SET_ACTIVE_TAB"; payload: string }
    | { type: "REORDER_TABS"; payload: { fromIndex: number; toIndex: number } }
    | { type: "UPDATE_TAB_PARAMS"; payload: { path: string; params: Record<string, string> } };

interface TabRouterContextValue {
    state: TabsState;
    dispatch: React.Dispatch<TabsAction>;
    config: Required<TabRouterConfig>;
}

const TabRouterContext = createContext<TabRouterContextValue | undefined>(undefined);

const defaultConfig: Required<TabRouterConfig> = {
    storageKey: "tabrouter-tabs",
    activeTabStorageKey: "tabrouter-active-tab",
    initialPath: "/",
};

// Reducer function
const createTabsReducer = (config: Required<TabRouterConfig>) => {
    const { storageKey, activeTabStorageKey } = config;

    return (state: TabsState, action: TabsAction): TabsState => {
        let newState: TabsState;

        switch (action.type) {
            case "ADD_TAB": {
                const newTab = action.payload;
                const existingTab = state.tabs.findIndex((tab) => tab.path === newTab.path);

                if (existingTab !== -1) {
                    newState = {
                        ...state,
                        active_index: existingTab,
                        tabs: state.tabs.map((tab, idx) => (idx === existingTab ? newTab : tab)),
                    };
                } else {
                    const newTabs = [...state.tabs, newTab];
                    newState = {
                        tabs: newTabs,
                        active_index: newTabs.length - 1,
                    };
                }
                break;
            }

            case "REPLACE_TAB": {
                const newTab = action.payload;
                const existingTab = state.tabs.findIndex((tab) => tab.path === newTab.path);

                if (existingTab !== -1) {
                    newState = {
                        ...state,
                        active_index: existingTab,
                    };
                } else {
                    const newTabs = [...state.tabs];
                    newTabs[state.active_index] = newTab;
                    newState = {
                        ...state,
                        tabs: newTabs,
                    };
                }
                break;
            }

            case "CLOSE_TAB": {
                const closingPath = action.payload;
                const closingIndex = state.tabs.findIndex((tab) => tab.path === closingPath);

                if (closingIndex === -1 || state.tabs.length < 2) {
                    return state;
                }

                const newTabs = state.tabs.filter((_, idx) => idx !== closingIndex);
                let newActiveIndex = state.active_index;

                if (state.active_index === closingIndex) {
                    newActiveIndex = newTabs.length === 0 ? 0 : Math.min(closingIndex, newTabs.length - 1);
                } else if (state.active_index > closingIndex) {
                    newActiveIndex = Math.max(0, state.active_index - 1);
                }

                newState = {
                    tabs: newTabs,
                    active_index: newActiveIndex,
                };
                break;
            }

            case "CLOSE_OTHER_TABS": {
                const keepTab = state.tabs.find((tab) => tab.path === action.payload);
                if (!keepTab) {
                    return state;
                }
                newState = {
                    tabs: [keepTab],
                    active_index: 0,
                };
                break;
            }

            case "SET_ACTIVE_TAB": {
                const tabIndex = state.tabs.findIndex((tab) => tab.path === action.payload);
                if (tabIndex === -1) {
                    return state;
                }
                newState = {
                    ...state,
                    active_index: tabIndex,
                };
                break;
            }

            case "REORDER_TABS": {
                const { fromIndex, toIndex } = action.payload;
                const newTabs = [...state.tabs];
                const [movedTab] = newTabs.splice(fromIndex, 1);
                newTabs.splice(toIndex, 0, movedTab);
                newState = {
                    tabs: newTabs,
                    active_index: toIndex,
                };
                break;
            }

            case "UPDATE_TAB_PARAMS": {
                const { path, params } = action.payload;
                const tabIndex = state.tabs.findIndex((tab) => tab.path === path);
                if (tabIndex === -1) {
                    return state;
                }
                newState = {
                    ...state,
                    tabs: state.tabs.map((tab, idx) =>
                        idx === tabIndex ? { ...tab, params: params || {} } : tab
                    ),
                    active_index: tabIndex,
                };
                break;
            }

            default:
                return state;
        }

        // Persist to sessionStorage
        if (typeof window !== "undefined") {
            sessionStorage.setItem(storageKey, JSON.stringify(newState.tabs));
            sessionStorage.setItem(activeTabStorageKey, String(newState.active_index));
        }

        return newState;
    };
};

// Get initial state
const getInitialState = (config: Required<TabRouterConfig>): TabsState => {
    const { storageKey, activeTabStorageKey, initialPath } = config;
    const initialTab: Tab = { path: initialPath, params: {} };

    if (typeof window === "undefined") {
        return {
            tabs: [initialTab],
            active_index: 0,
        };
    }

    const storedTabs = sessionStorage.getItem(storageKey);
    const storedActiveIndex = sessionStorage.getItem(activeTabStorageKey);

    return {
        tabs: storedTabs ? JSON.parse(storedTabs) || [initialTab] : [initialTab],
        active_index: storedActiveIndex ? Number(storedActiveIndex) || 0 : 0,
    };
};

interface TabRouterProviderProps {
    children: ReactNode;
    config?: TabRouterConfig;
}

export const TabRouterProvider: React.FC<TabRouterProviderProps> = ({
    children,
    config = {},
}) => {
    const finalConfig = { ...defaultConfig, ...config };
    const [state, dispatch] = useReducer(
        createTabsReducer(finalConfig),
        getInitialState(finalConfig)
    );

    // Sync state from sessionStorage on mount (for SSR/hydration)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedTabs = sessionStorage.getItem(finalConfig.storageKey);
            const storedActiveIndex = sessionStorage.getItem(finalConfig.activeTabStorageKey);

            if (storedTabs && storedActiveIndex !== null) {
                const parsedTabs = JSON.parse(storedTabs);
                const parsedIndex = Number(storedActiveIndex);

                if (
                    JSON.stringify(parsedTabs) !== JSON.stringify(state.tabs) ||
                    parsedIndex !== state.active_index
                ) {
                    dispatch({
                        type: "SET_ACTIVE_TAB",
                        payload: parsedTabs[parsedIndex]?.path || state.tabs[state.active_index]?.path || finalConfig.initialPath,
                    });
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    const value: TabRouterContextValue = {
        state,
        dispatch,
        config: finalConfig,
    };

    return (
        <TabRouterContext.Provider value={value}>{children}</TabRouterContext.Provider>
    );
};

export const useTabRouterContext = (): TabRouterContextValue => {
    const context = useContext(TabRouterContext);
    if (context === undefined) {
        throw new Error("useTabRouterContext must be used within a TabRouterProvider");
    }
    return context;
};

