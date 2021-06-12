import 'reflect-metadata'
import { DatabaseManager } from "../src"
import { User } from "./model"

beforeAll(async () => {
  await DatabaseManager.init(process.env.DATABASE_URL!)
})

afterAll(async () => {
  const john = await User.findOne({ email: 'john.doe@example.org' })
  await john?.delete()

  const mike = await User.findOne({ email: 'mike@example.org' })
  await mike?.delete()

  await DatabaseManager.close()
})

describe('Entity creation', () => {
  test('should create object with already existing data', async () => {
    const data = {
      name: 'John Doe',
      email: 'john.doe@example.org'
    }

    const user = new User(data)

    user.password = 'abcd1234'

    const created = await user.create()

    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('john.doe@example.org')
    expect(user.password).toBe('abcd1234')
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
})