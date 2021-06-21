import 'reflect-metadata'
import { BaseEntity, DatabaseManager, Relation } from "../src"

class Author extends BaseEntity {
  name: string

  //@Relation('postId', Post)
  posts: Post[]
}

class Post extends BaseEntity {
  title: string

  @Relation('authorId', Author)
  author?: Author
}


beforeAll(async () => {
  await DatabaseManager.init(process.env.DATABASE_URL!)
})

afterAll(async () => {
  await DatabaseManager.close()
})

describe('Entity reading', () => {
  test('Create entity with sub-entity as relation', async () => {
    const post = new Post()
    post.title = 'New post'
    post.author = new Author({ name: 'David' })

    await post.create()

    expect(post._id).toBeTruthy()
    expect(post.author._id).toBeTruthy()
  })

  test('Create entity with nested relation', async () => {
    const post = new Post()
    post.title = 'Another'
    post.author = new Author({ name: 'John' })

    await post.create(true)

    expect(post._id).toBeTruthy()
    expect(post.author).not.toHaveProperty('_id')
    expect(post.author?.name).toBe('John')
  })

  test('Find linked objects', async () => {
    const post = await Post.findOne({ title: 'New post' })

    expect(post?.title).toBe("New post")
    expect(post?.author?.name).toBe('David')
  })
})