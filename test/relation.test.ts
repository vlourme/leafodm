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

  test('Create entity with disabled relation', async () => {
    const post = new Post()
    post.title = 'Another'
    post.author = new Author({ name: 'Michael' })

    await post.create(false)

    const find = await Author.findOne({ name: 'Michael' })

    expect(find).toBeUndefined()
  })

  test('Find linked objects', async () => {
    const post = await Post.findOne({ title: 'New post' })

    expect(post?.title).toBe("New post")
    expect(post?.author?.name).toBe('David')
  })

  test('Find without relation', async () => {
    const post = await Post.findOne({ title: 'New post' }, false)

    expect(post?.title).toBe("New post")
    expect(post?.author).toBeUndefined()
  })

  test('Find undefined object', async () => {
    const post = await Post.findOne({ title: 'This does not exist' })

    expect(post).toBeUndefined()
  })

  test('Update linked object', async () => {
    const post = await Post.findOne({ title: 'New post' })

    post!.author!.name = 'Mike'

    await post?.update()

    const find = await Post.findOne({ title: 'New post' })
    expect(find?.author?.name).toBe('Mike')
  })

  test('Update linked object without relation', async () => {
    const post = await Post.findOne({ title: 'New post' })

    post!.author!.name = 'Dave'

    await post?.update(false)

    const bad = await Author.findOne({ name: 'Dave' })
    expect(bad).toBeUndefined()

    const valid = await Author.findOne({ name: 'Mike' })
    expect(valid?.name).toBe('Mike')
  })

  // test('Delete with relations', async () => {
  //   const post = await Post.findOne({ title: 'New post' })
  // })
})