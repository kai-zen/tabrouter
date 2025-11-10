import { useCallback, useMemo } from "react";
import { useTabRouterContext } from "../TabRouterProvider";
import { Tab } from "../types";

export interface UseTabRouterReturn {
    query: Record<string, string | number>;
    pathname: string;
    active: Tab | null;
    active_index: number;
    tabs: Tab[];
    push: (
        url:
            | string
            | {
                path: string;
                params?: {
                    [x: string]: string | number;
                };
            }
    ) => void;
    replace: (url: string | Tab) => void;
    closePath: (path: string) => void;
    closeOthers: (path: string) => void;
    switchToPath: (path: string) => void;
    reorderTabs: (fromIndex: number, toIndex: number) => void;
}

export const useTabRouter = (): UseTabRouterReturn => {
    const { state, dispatch } = useTabRouterContext();
    const { tabs, active_index } = state;
    const activeTab = tabs?.[active_index] || null;

    const query = useMemo(() => {
        return typeof activeTab?.params === "object" ? activeTab?.params || {} : {};
    }, [activeTab?.params]);

    const pathname = useMemo(() => {
        return typeof activeTab?.path === "string" ? activeTab?.path || "/" : "/";
    }, [activeTab?.path]);

    const push = useCallback(
        (
            url:
                | string
                | {
                    path: string;
                    params?: {
                        [x: string]: string | number;
                    };
                }
        ) => {
            const desiredPath = typeof url === "string" ? url : url.path;
            dispatch({
                type: "ADD_TAB",
                payload: {
                    path: desiredPath,
                    params: typeof url === "string" ? {} : url.params,
                },
            });
        },
        [dispatch]
    );

    const replace = useCallback(
        (url: string | Tab) => {
            const desiredPath = typeof url === "string" ? url : url.path;
            dispatch({
                type: "REPLACE_TAB",
                payload: {
                    path: desiredPath,
                    params: typeof url === "string" ? {} : url.params,
                },
            });
        },
        [dispatch]
    );

    const closePath = useCallback(
        (path: string) =>
            dispatch({
                type: "CLOSE_TAB",
                payload: path,
            }),
        [dispatch]
    );

    const closeOthers = useCallback(
        (path: string) =>
            dispatch({
                type: "CLOSE_OTHER_TABS",
                payload: path,
            }),
        [dispatch]
    );

    const switchToPath = useCallback(
        (path: string) =>
            dispatch({
                type: "SET_ACTIVE_TAB",
                payload: path,
            }),
        [dispatch]
    );

    const reorderTabs = useCallback(
        (fromIndex: number, toIndex: number) =>
            dispatch({
                type: "REORDER_TABS",
                payload: { fromIndex, toIndex },
            }),
        [dispatch]
    );

    return {
        query,
        pathname,
        active: tabs?.[active_index] || null,
        active_index,
        tabs,
        push,
        replace,
        closePath,
        closeOthers,
        switchToPath,
        reorderTabs,
    };
};
