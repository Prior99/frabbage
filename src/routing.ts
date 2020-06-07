import * as React from "react";

/**
 * Used to create an URL.
 */
export type PathFactory = (...args: any[]) => string;

export interface Route<TProps> {
    /** A factory for creating a path to a specific entity. */
    path: PathFactory;
    /** A pattern compatible with react-router. */
    pattern: string;
    component: React.ComponentClass<RouteProps<TProps>>;
}

/**
 * Singleton list of all routes.
 * Populated from the pages directory.
 */
// eslint:ignore-line
const routes: Route<any>[] = [];

/**
 * Call this function to register a new route.
 */
export function addRoute<TProps>(route: Route<TProps>): Route<TProps> {
    routes.push(route);
    return route;
}

/**
 * Returns all route registered with [[addRoute]].
 */
export function getRoutes(): Route<unknown>[] {
    return routes;
}

export interface RouteProps<T> {
    readonly match: {
        readonly params: T;
        readonly url: string;
    };
}

