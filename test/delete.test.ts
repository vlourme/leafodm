import 'reflect-metadata'
import { DatabaseManager } from '../src/manager'
import { User } from './model'

beforeAll(async () => {
  await DatabaseManager.init(process.env.DATABASE_URL!)
})

afterAll(async () => {
  await DatabaseManager.close()
})

describe('Entity deletion', () => {
  test('should delete an object', async () => {
    const user = await new User({
      name: 'Mike',
      email: 'mike@example.org',
      password: 'password'
    }).create()

    const deleted = await user?.delete()

    expect(deleted).toBeTruthy()
  })

  test('should delete an object by its ID', async () => {
    const user = await new User({
      name: 'John',
      email: 'mike@example.org',
      password: 'password'
    }).create()

    const deleted = await User.delete(user!._id)

    expect(deleted).toBeTruthy()
  })

  test('should delete many object by instance', async () => {
    const users = await User.createMany([
      { email: 'test1@example.org' },
      { email: 'test2@example.org' },
      { email: 'test3@example.org' }
    ])

    expect(users).toHaveLength(3)

    const deleted = await User.deleteMany({
      email: /^test/
    })

    expect(deleted).toBeTruthy()
  })
})