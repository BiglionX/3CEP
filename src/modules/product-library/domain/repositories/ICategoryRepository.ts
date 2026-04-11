import { Category } from '../entities';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByPath(path: string): Promise<Category | null>;
  findRootCategories(): Promise<Category[]>;
  findChildren(parentId: string): Promise<Category[]>;
  create(category: Category): Promise<Category>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
