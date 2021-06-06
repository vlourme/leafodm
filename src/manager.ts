import { MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';

export class DatabaseManager {
  /**
   * Singleton instance
   */
  private static instance: DatabaseManager

  /**
   * Mongo Client
   */
  public client: MongoClient;

  /**
   * Mongo default config
   */
  private static config: MongoClientOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

  /**
   * Prevent direct calls
   */
  private constructor() { }

  /**
   * Get client instance
   *
   * @return { MongoClient }
   */
  public static get client(): MongoClient {
    if (!DatabaseManager.instance) {
      throw new Error('DatabaseManager instance is not initialized, did you called init()?');
    }

    return DatabaseManager.instance.client;
  }

  /**
   * Initialize instance and connect client
   *
   * @param { string } connectionString By default fetched from config
   */
  public static async init(connectionString: string, config = this.config): Promise<void> {
    this.instance = new this();

    await this.instance.connect(connectionString, config);
  }

  /**
   * Close database connection
   */
  public static async close(): Promise<void> {
    await this.instance.client.close();
  }

  /**
   * Connect client
   *
   * @param { string } url Database Connection URL
   */
  private async connect(url: string, config: MongoClientOptions) {
    this.client = new MongoClient(url, config);

    await this.client.connect();
  }
}
