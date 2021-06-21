import { Type } from "class-transformer";
import { Collection, ObjectID } from "mongodb";
import { DatabaseManager, Filter } from "..";
import { BaseEntity } from "../entity";
import { IRelation } from "../interfaces/relation";

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
   * Constructor definition for self accessing
   */
  ['constructor']: typeof BaseEntity

  /**
   * Relations
   */
  public static relations: IRelation[] = []

  /**
   * Initialize a new model
   *
   * @param { object } data Set existing data
   */
  constructor(data?: Record<string, unknown>) {
    Object.assign(this, data)
  }

  /**
   * Get database name from function or transform another function name to database
   * @param { string } name Function Name
   * @returns { string }
   */
  public static getDatabaseName(name: string = this.name): string {
    return name.toLowerCase()
  }

  /**
   * Get repository from collection
   *
   * @static
   */
  protected static get repository(): Collection<any> {
    return DatabaseManager.client.db().collection(this.getDatabaseName());
  }

  /**
   * Clean and sanitize filters inputs
   *
   * @param { Filter<T> | ObjectID | string } filter Criteria
   * @returns { Filter<T> }
   */
  protected static transformFilters<T extends typeof BaseEntity>(filter: Filter<T> | string | ObjectID): Filter<T> {
    let ret: Filter<T>

    if (typeof filter == 'string' || filter instanceof ObjectID) {
      ret = {
        _id: filter
      }
    } else {
      ret = filter
    }

    if ('_id' in ret && typeof ret._id === 'string') {
      ret._id = new ObjectID(ret._id)
    }

    return ret
  }
}