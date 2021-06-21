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
  test('Find linked objects', async () => {
    const post = await Post.findOne("60cf00485deec81274d9314c")

    expect(post?.title).toBe("Another post")

    expect(post?.author?.name).toBe('John Doe')
  })
})