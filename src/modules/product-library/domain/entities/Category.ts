export interface CategoryProps {
  id?: string;
  parentId?: string | null;
  name: string;
  level: number;
  path?: string;
  createdAt?: Date;
}

export class Category {
  public readonly id: string;
  public parentId: string | null;
  public name: string;
  public level: number;
  public path: string;
  public readonly createdAt: Date;

  constructor(props: CategoryProps) {
    this.id = props.id || crypto.randomUUID();
    this.parentId = props.parentId ?? null;
    this.name = props.name;
    this.level = props.level;
    this.path = props.path || `/${props.name}`;
    this.createdAt = props.createdAt || new Date();
  }

  public updateName(name: string): void {
    this.name = name;
    // Path should be recalculated by service
  }

  public isRoot(): boolean {
    return this.parentId === null;
  }
}
