import { ActivatedRoute } from '@angular/router';
import { ApplicationMode } from '../models/other/application-mode-enum'; // Adjust path as needed

export class RouteDataUtil {
  /**
   * Traverses up the ActivatedRoute tree to find the 'mode' property in the route data.
   * @param route The starting ActivatedRoute.
   * @param maxDepth The maximum number of parent levels to traverse.
   * @returns The ApplicationMode if found, otherwise undefined.
   */
  public static getApplicationModeFromRoute(route: ActivatedRoute | null, maxDepth: number = 10): ApplicationMode | undefined {
    let currentRoute = route;
    let iterations = 0;

    while (currentRoute && iterations <= maxDepth) {
      const routeData = currentRoute.snapshot.data;
      if (routeData && routeData.mode) {
        // Ensure the mode is a valid ApplicationMode enum member if necessary
        // For now, assuming it's correctly typed if present
        return routeData.mode as ApplicationMode;
      }
      if (!currentRoute.parent) {
        break;
      }
      currentRoute = currentRoute.parent;
      iterations++;
    }
    return undefined;
  }
}
