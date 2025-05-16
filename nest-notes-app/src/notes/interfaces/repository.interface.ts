import { PaginatedResult, PaginationParams } from './pagination.interface';

/**
 * Generic repository interface that defines common operations
 * for data access across the application
 */
export interface Repository<T> {
  /**
   * Save an entity to the repository
   * @param entity The entity to save
   * @returns The saved entity
   */
  save(entity: T): T;

  /**
   * Find all entities in the repository
   * @returns Array of all entities
   */
  findAll(): T[];

  /**
   * Find entities with pagination
   * @param params Pagination parameters
   * @returns Paginated result of entities
   */
  findWithPagination(params: PaginationParams): PaginatedResult<T>;

  /**
   * Find an entity by its id
   * @param id The id of the entity to find
   * @returns The found entity or null if not found
   */
  findById(id: number): T | null;

  /**
   * Update an entity in the repository
   * @param id The id of the entity to update
   * @param entity The updated entity data
   * @returns The updated entity or null if not found
   */
  update(id: number, entity: Partial<T>): T | null;

  /**
   * Remove an entity from the repository
   * @param id The id of the entity to remove
   * @returns True if removed, false if not found
   */
  remove(id: number): boolean;
  
  /**
   * Count total number of entities in the repository
   * @returns Total count of entities
   */
  count(): number;
}
