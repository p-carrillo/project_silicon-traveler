import { Post } from '../entities/post.entity';

export interface IPostRepository {
  findFirst(): Promise<Post | null>;
}
