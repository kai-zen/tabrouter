import { useCallback } from "react";
import { useTabRouterContext } from "../TabRouterProvider";
import { Tab } from "../types";

export interface UseTabsReturn {
    openTab: (tabData: Tab) => void;
    closeTab: (tabId: string) => void;
    closeOtherTabs: (tabId: string) => void;
    switchToTab: (path: string) => void;
    reorderTabs: (fromIndex: number, toIndex: number) => void;
    isTabOpen: (path: string) => boolean;
    getTabByPath: (path: string) => Tab | undefined;
    active: Tab | null;
    active_index: number;
    tabs: Tab[];
}

export const useTabs = (): UseTabsReturn => {
    const { state, dispatch } = useTabRouterContext();
    const { active_index, tabs } = state;

    const openTab = useCallback(
        (tabData: Tab) => {
            dispatch({
                type: "ADD_TAB",
                payload: tabData,
            });
        },
        [dispatch]
    );

    const closeTabById = useCallback(
        (tabId: string) => {
            dispatch({
                type: "CLOSE_TAB",
                payload: tabId,
            });
        },
        [dispatch]
    );

    const closeOtherTabsById = useCallback(
        (tabId: string) => {
            dispatch({
                type: "CLOSE_OTHER_TABS",
                payload: tabId,
            });
        },
        [dispatch]
    );

    const switchToTab = useCallback(
        (path: string) => {
            const tab = tabs.find((t: Tab) => t.path === path);
            if (tab) {
                dispatch({
                    type: "SET_ACTIVE_TAB",
                    payload: path,
                });
            }
        },
        [dispatch, tabs]
    );

    const reorderTabsAction = useCallback(
        (fromIndex: number, toIndex: number) => {
            dispatch({
                type: "REORDER_TABS",
                payload: { fromIndex, toIndex },
            });
        },
        [dispatch]
    );

    const isTabOpen = useCallback(
        (path: string) => {
            return tabs.some((tab: Tab) => tab.path === path);
        },
        [tabs]
    );

    const getTabByPath = useCallback(
        (path: string) => {
            return tabs.find((tab: Tab) => tab.path === path);
        },
        [tabs]
    );

    return {
        openTab,
        closeTab: closeTabById,
        closeOtherTabs: closeOtherTabsById,
        switchToTab,
        reorderTabs: reorderTabsAction,
        isTabOpen,
        getTabByPath,
        active: tabs?.[active_index] || null,
        active_index,
        tabs,
    };
};
