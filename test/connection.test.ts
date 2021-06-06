import { DatabaseManager } from "../src/manager"
import { MongoClient } from "mongodb"

describe('Database Manager', () => {
  test('should be not instanced yet', () => {
    expect(() => DatabaseManager.client).toThrow()
  })

  test('should connect and create an instance', async () => {
    await DatabaseManager.init(process.env.DATABASE_URL!)

    expect(DatabaseManager.client).toBeInstanceOf(MongoClient)
    expect(DatabaseManager.client).not.toBeNull()
    expect(DatabaseManager.client.isConnected()).toBeTruthy()
  })

  test('should disconnect', async () => {
    await DatabaseManager.close()

    expect(DatabaseManager.client.isConnected()).toBeFalsy()
  })
})