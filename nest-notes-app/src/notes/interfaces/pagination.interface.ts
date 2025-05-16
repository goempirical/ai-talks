/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  /**
   * Page number (1-based)
   */
  page: number;
  
  /**
   * Number of items per page
   */
  limit: number;
}

/**
 * Interface for paginated results
 */
export interface PaginatedResult<T> {
  /**
   * Array of items for the current page
   */
  items: T[];
  
  /**
   * Total number of items across all pages
   */
  total: number;
  
  /**
   * Current page number
   */
  page: number;
  
  /**
   * Number of items per page
   */
  limit: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Whether there is a next page
   */
  hasNext: boolean;
  
  /**
   * Whether there is a previous page
   */
  hasPrevious: boolean;
}
