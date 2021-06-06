import { BaseEntity } from '../src/entity/base'
import { DatabaseManager } from '../src/manager'

class User extends BaseEntity {
  name: string
  email: string
  password: string
}

beforeAll(async () => {
  await DatabaseManager.init(process.env.DATABASE_URL!)
})

afterAll(async () => {
  await DatabaseManager.close()
})

describe('Entity', () => {
  test('should create an object', async () => {
    const user = new User()
    user.name = 'John Doe'
    user.email = 'john.doe@example.org'
    user.password = 'abcd1234'

    const created = await user.create()

    expect(created._id).toBeTruthy()
  })

  test('should create another object', async () => {
    const user = new User()
    user.name = 'Mike'
    user.email = 'mike@example.org'
    user.password = 'abcd0001'

    const created = await user.create()

    expect(created._id).toBeTruthy()
  })

  test('should get all object', async () => {
    const users = await User.find()

    expect(users).toBeTruthy()
    expect(users.length).toBe(2)
  })

  test('should get all object with limit', async () => {
    const users = await User.take(1).find()

    expect(users).toBeTruthy()
    expect(users.length).toBe(1)
  })

  test('should get all object with skip', async () => {
    const users = await User.skip(1).find()

    expect(users).toBeTruthy()
    expect(users.length).toBe(1)
  })

  test('should get all object with DESC order', async () => {
    const users = await User.sortBy({
      name: 'DESC'
    }).find()

    expect(users).toBeTruthy()
    expect(users.length).toBe(2)
    expect(users[0].email).toBe('mike@example.org')
  })

  test('should get all objects with filter', async () => {
    const users = await User.find({
      email: 'mike@example.org'
    })

    expect(users).toBeTruthy()
    expect(users[0].name).toBe('Mike')
  })

  test('should get one object', async () => {
    const user = await User.findOne({
      email: 'john.doe@example.org'
    })

    expect(user).toBeTruthy()
    expect(user?.name).toBe('John Doe')
  })

  test('should update one object', async () => {
    const user = await User.findOne({
      email: 'mike@example.org'
    })

    user!.name = 'Dr. Mike'

    const update = await user?.update()

    expect(update).toBeTruthy()
  })

  test('should delete an object', async () => {
    const user = await User.findOne({
      email: 'mike@example.org'
    })

    const deleted = await user?.delete()

    expect(deleted).toBeTruthy()
  })

  test('should delete another object', async () => {
    const user = await User.findOne({
      email: 'john.doe@example.org'
    })

    const deleted = await user?.delete()

    expect(deleted).toBeTruthy()
  })
})