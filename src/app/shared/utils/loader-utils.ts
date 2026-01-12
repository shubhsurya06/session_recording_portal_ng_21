/**
 * Utility function to handle delete loader state for an entity.
 * @param entity The entity object (candidate, batch, etc.)
 * @param loaderKey The property name for the loader (default: 'isDeleteLoader')
 * @param value The boolean value to set
 */
export function setDeleteLoader<T extends object>(entity: T, value: boolean, loaderKey: string = 'isDeleteLoader') {
  if (entity && loaderKey in entity) {
    (entity as any)[loaderKey] = value;
  }
}
