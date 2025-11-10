import React, { MouseEvent, ReactNode, useCallback, useMemo } from "react";
import { useTabRouter } from "../hooks/useTabRouter";
import { Tab } from "../types";

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> {
    href: string | { path: string; params?: Record<string, string | number> };
    replace?: boolean;
    children: ReactNode;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
    prefetch?: boolean; // Reserved for future use
    scroll?: boolean; // Reserved for future use
}

/**
 * Link component similar to Next.js Link
 * 
 * Features:
 * - If target="_blank", uses push (opens new tab in router, not browser)
 * - If replace={true}, uses replace (replaces current tab)
 * - Otherwise, uses push (opens new tab if path doesn't exist, or switches to existing tab)
 * - Supports query params in href string or as object
 * - Supports hash in href
 * - Supports relative and absolute paths
 * - All standard anchor tag props are supported (except target is handled internally)
 * - All navigation happens within the router - no browser tabs are opened
 */
export const Link: React.FC<LinkProps> = ({
    href,
    replace = false,
    children,
    onClick,
    target,
    prefetch,
    scroll,
    className,
    style,
    ...rest
}) => {
    const { push, replace: replaceTab, switchToPath, pathname, tabs } = useTabRouter();

    // Parse href to extract path, query params, and hash
    const parsedHref = useMemo(() => {
        if (typeof href === "object") {
            // Object format: { path: "/users", params: { id: "123" } }
            return {
                path: href.path,
                params: href.params || {},
                hash: "",
            };
        }

        // String format: "/users?id=123#section"
        // Handle relative paths manually to avoid URL constructor issues
        let path = href;
        let hash = "";
        let searchString = "";

        // Extract hash first (it comes last)
        const hashIndex = href.indexOf("#");
        if (hashIndex !== -1) {
            hash = href.substring(hashIndex);
            path = href.substring(0, hashIndex);
        }

        // Extract query string
        const queryIndex = path.indexOf("?");
        if (queryIndex !== -1) {
            searchString = path.substring(queryIndex + 1);
            path = path.substring(0, queryIndex);
        }

        // Parse query params
        const params: Record<string, string | number> = {};
        if (searchString) {
            const urlParams = new URLSearchParams(searchString);
            urlParams.forEach((value, key) => {
                // Try to parse as number if possible
                const numValue = Number(value);
                params[key] = isNaN(numValue) ? value : numValue;
            });
        }

        return { path, params, hash };
    }, [href]);

    // Check if tab already exists
    const tabExists = useMemo(() => {
        return tabs.some((tab) => tab.path === parsedHref.path);
    }, [tabs, parsedHref.path]);

    // Determine if we should switch to existing tab or navigate
    const shouldSwitchToExisting = useMemo(() => {
        return tabExists && !replace && target !== "_blank";
    }, [tabExists, replace, target]);

    const handleClick = useCallback(
        (e: MouseEvent<HTMLAnchorElement>) => {
            // Call user's onClick handler first
            if (onClick) {
                onClick(e);
            }

            // If default prevented or modifier keys, let browser handle it
            if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
            }

            // Always prevent default navigation - we handle everything with the router
            e.preventDefault();

            // If target="_blank", use push to open new tab in router (not browser tab)
            if (target === "_blank") {
                push({
                    path: parsedHref.path,
                    params: parsedHref.params,
                });
                return;
            }

            // If tab exists and we're not replacing, switch to it
            if (shouldSwitchToExisting) {
                switchToPath(parsedHref.path);
                return;
            }

            // Navigate using push or replace
            if (replace) {
                replaceTab({
                    path: parsedHref.path,
                    params: parsedHref.params,
                });
            } else {
                push({
                    path: parsedHref.path,
                    params: parsedHref.params,
                });
            }

            // Handle hash scrolling if present
            if (parsedHref.hash && typeof window !== "undefined") {
                // Small delay to ensure tab is active
                setTimeout(() => {
                    const element = document.querySelector(parsedHref.hash);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                    }
                }, 100);
            }
        },
        [
            onClick,
            target,
            shouldSwitchToExisting,
            replace,
            push,
            replaceTab,
            switchToPath,
            parsedHref,
        ]
    );

    // Build the href attribute for the anchor tag
    const hrefString = useMemo(() => {
        if (typeof href === "object") {
            const path = href.path;
            const params = href.params || {};
            const queryString = Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                .join("&");
            return queryString ? `${path}?${queryString}` : path;
        }
        return href;
    }, [href]);

    // Determine if link is active
    const isActive = useMemo(() => {
        return pathname === parsedHref.path;
    }, [pathname, parsedHref.path]);

    return (
        <a
            href={hrefString}
            onClick={handleClick}
            className={className}
            style={style}
            aria-current={isActive ? "page" : undefined}
            {...rest}
        >
            {children}
        </a>
    );
};

Link.displayName = "Link";

