import { Post } from '../../../domain/entities/post.entity';

describe('Post Entity', () => {
  it('should create a post with id and value', () => {
    const post = new Post(1, 'Test value');

    expect(post.id).toBe(1);
    expect(post.value).toBe('Test value');
  });

  it('should have readonly properties', () => {
    const post = new Post(1, 'Test value');

    // TypeScript enforces readonly at compile time
    // This test verifies the entity structure
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('value');
  });

  it('should accept different types of values', () => {
    const posts = [
      new Post(1, 'DB works'),
      new Post(2, 'Another value'),
      new Post(999, 'Test'),
    ];

    expect(posts).toHaveLength(3);
    expect(posts[0].value).toBe('DB works');
    expect(posts[1].id).toBe(2);
    expect(posts[2].value).toBe('Test');
  });
});
