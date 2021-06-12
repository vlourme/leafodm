import 'reflect-metadata'
import { DatabaseManager } from "../src"
import { User } from "./model"

beforeAll(async () => {
  await DatabaseManager.init(process.env.DATABASE_URL!)

  await new User({
    name: 'John Doe',
    email: 'john.doe@example.org',
    password: 'password'
  }).create()

  await new User({
    name: 'Mike',
    email: 'mike@example.org',
    password: 'password'
  }).create()
})

afterAll(async () => {
  const john = await User.findOne({ email: 'john.doe@example.org' })
  await john?.delete()

  const mike = await User.findOne({ email: 'mike@example.org' })
  await mike?.delete()

  await DatabaseManager.close()
})


describe('Entity reading', () => {
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

  test('should get all object with ASC order', async () => {
    const users = await User.sortBy({
      name: 'ASC',

    }).find()

    expect(users.length).toBe(2)
    expect(users[0].email).toBe('john.doe@example.org')
  })

  test('should get all object with DESC order', async () => {
    const users = await User.sortBy({
      name: 'DESC',
    }).find()

    expect(users.length).toBe(2)
    expect(users[0].email).toBe('mike@example.org')
  })

  test('should get all objects with filter', async () => {
    const users = await User.find({
      email: 'mike@example.org'
    })

    expect(users[0].name).toBe('Mike')
  })

  test('should get object with using nested ID', async () => {
    const res = await User.findOne({
      email: 'mike@example.org'
    })

    const user = await User.findOne({
      _id: res!._id
    })

    expect(user?.name).toBe('Mike')
  })

  test('should count objects', async () => {
    const count = await User.count()

    expect(count).toBe(2)
  })

  test('should get one object', async () => {
    const user = await User.findOne({
      email: 'john.doe@example.org'
    })

    expect(user).toBeTruthy()
    expect(user?.name).toBe('John Doe')
    expect(user).toBeInstanceOf(User)
  })
})