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
})