import { ObjectId, ObjectID } from 'bson'
import 'reflect-metadata'
import { DatabaseManager } from "../src"
import { User } from "./model"

beforeAll(async () => {
  await DatabaseManager.init(process.env.DATABASE_URL!)

  await new User({
    name: 'Mike',
    email: 'mike@example.org',
    password: 'password'
  }).create()
})

afterAll(async () => {
  const mike = await User.findOne({ email: 'mike@example.org' })
  await mike?.delete()

  await DatabaseManager.close()
})

describe('Entity creation', () => {
  test('should update one object', async () => {
    const user = await User.findOne({
      email: 'mike@example.org'
    })

    user!.name = 'Dr. Mike'

    const update = await user?.update()

    expect(update).toBeTruthy()
  })

  test('should update one object by its id', async () => {
    const user = await User.findOne({
      email: 'mike@example.org'
    })

    const result = await User.update(user!._id, {
      'name': 'Mike Jr.'
    })

    const updated = await User.findOne(result!._id)

    expect(updated).toBeTruthy()
    expect(updated?.name).toBe('Mike Jr.')
  })

  test('should update many objects', async () => {
    const users = await User.createMany([
      { email: 'test1@example.org' },
      { email: 'test2@example.org' },
      { email: 'test3@example.org' }
    ])

    expect(users).toHaveLength(3)

    const count = await User.updateMany({
      email: /^test/,
    }, {
      name: 'John'
    })

    expect(count).toBe(3)

    const deleted = await User.deleteMany({
      email: /^test/
    })

    expect(deleted).toBeTruthy()
  })

  test('should update undefined object', async () => {
    const user = await User.update('11d11cb1bf11cb1fe111c111', {
      name: 'David'
    })

    expect(user).toBeUndefined()
  })
})