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

    const find = await Post.findOne({ title: 'New post' })

    expect(find?._id).toBeTruthy()
    expect(find?.title).toBe('New post')
    expect(find?.author?._id).toBeTruthy()
    expect(find?.author?.name).toBe('David')
  })

  test('Create entity with nested relation', async () => {
    const post = new Post()
    post.title = 'Another'
    post.author = new Author({ name: 'John' })

    await post.create(true)

    const find = await Post.findOne({ title: 'Another' }, false)

    expect(find?._id).toBeTruthy()
    expect(find?.author).not.toHaveProperty('_id')
    expect(find?.author?.name).toBe('John')
  })

  test('Find linked objects', async () => {
    const post = await Post.findOne({ title: 'New post' })

    expect(post?.title).toBe("New post")
    expect(post?.author?.name).toBe('David')
  })

  test('Find undefined object', async () => {
    const post = await Post.findOne({ title: 'This does not exist' })

    expect(post).toBeUndefined()
  })

  test('Find linked objects nested', async () => {
    const post = await Post.findOne({ title: 'Another' }, false)

    expect(post?.title).toBe("Another")
    expect(post?.author?.name).toBe('John')
    expect(post?.author).not.toHaveProperty('_id')
  })

  test('Update linked object', async () => {
    const post = await Post.findOne({ title: 'New post' })

    post!.author!.name = 'Mike'

    await post?.update()

    const find = await Post.findOne({ title: 'New post' })
    expect(find?.author?.name).toBe('Mike')
  })

  test('Update with nested relation', async () => {
    const post = await Post.findOne({ title: 'Another' }, false)

    post!.author!.name = 'Dave'

    await post?.update(false, true)

    const find = await Post.findOne({ title: 'Another' }, false)
    expect(find?.author).not.toHaveProperty('_id')
    expect(find?.author?.name).toBe('Dave')
  })
})