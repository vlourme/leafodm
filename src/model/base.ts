import { Type } from "class-transformer";
import { Collection } from "mongodb";
import { DatabaseManager } from "..";

export abstract class BaseModel {
  /**
   * Object ID
   */
  @Type(() => String)
  _id: string;

  /**
   * Allow schema-less
   */
  [key: string]: unknown

  /**
   * Initialize a new model
   *
   * @param { object } data Set existing data
   */
  constructor(data?: Record<string, unknown>) {
    Object.assign(this, data)
  }

  /**
   * Get repository from collection
   *
   * @static
   */
  protected static get repository(): Collection<any> {
    const collection = this.name.toLowerCase();

    return DatabaseManager.client.db().collection(collection);
  }

  /**
   * Get repository from instance name
   *
   * @instance
   */
  protected get repository(): Collection<any> {
    const collection = this.constructor.name.toLowerCase();

    return DatabaseManager.client.db().collection(collection);
  }
}