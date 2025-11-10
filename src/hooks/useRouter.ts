import { useTabRouter } from "./useTabRouter";

/**
 * useRouter hook - Similar to Next.js useRouter
 * Provides router methods and current route information
 */
export const useRouter = () => {
    const router = useTabRouter();

    return {
        // Route information
        pathname: router.pathname,
        query: router.query,
        asPath: router.pathname, // Alias for pathname (Next.js compatibility)

        // Navigation methods
        push: router.push,
        replace: router.replace,
        back: () => {
            // Go back to previous tab
            if (router.active_index > 0) {
                router.switchToPath(router.tabs[router.active_index - 1]?.path || "/");
            }
        },
        reload: () => {
            // Reload current tab (switch to same path)
            if (router.active?.path) {
                router.switchToPath(router.active.path);
            }
        },
        prefetch: () => {
            // Reserved for future use - prefetch functionality
            // Could preload tab data here
        },

        // Tab-specific methods
        closePath: router.closePath,
        closeOthers: router.closeOthers,
        switchToPath: router.switchToPath,
        reorderTabs: router.reorderTabs,

        // Additional state
        active: router.active,
        active_index: router.active_index,
        tabs: router.tabs,
    };
};

export type UseRouterReturn = ReturnType<typeof useRouter>;

