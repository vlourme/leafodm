import { classToPlain, plainToClass, plainToClassFromExist, Type } from 'class-transformer';
import { Collection, FindOneOptions, ObjectID, WithoutProjection } from 'mongodb';
import { DatabaseManager } from '../manager';
import { Filter, Properties, PropertySorting } from '../types';

/**
 * Base Entity
 */
export class BaseEntity {
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
   * Take an amount of document
   */
  private static _take?: number

  /**
   * Skip an amount of document
   */
  private static _skip?: number

  /**
   * Sort by field in ASC or DESC
   */
  private static _sort?: { [K in keyof Partial<any>]: -1 | 1 }

  /**
   *
   * @param { object } data
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
  private get repository(): Collection<any> {
    const collection = this.constructor.name.toLowerCase();

    return DatabaseManager.client.db().collection(collection);
  }

  /**
   * Take only a certain amount of document on the next query
   *
   * @param { number | undefined } amount Limit of document
   * @return { this }
   */
  public static take<T extends typeof BaseEntity>(this: T, amount?: number): T {
    this._take = amount;

    return this;
  }

  /**
   * Skip a certain amount of document on the next query
   *
   * @return { this }
   * @param amount
   */
  public static skip<T extends typeof BaseEntity>(this: T, amount?: number): T {
    this._skip = amount;

    return this;
  }

  /**
   * Sort by one or multiple filters in ascending or descending order
   *
   * @return { this }
   */
  public static sortBy<T extends typeof BaseEntity>(this: T, sort: PropertySorting<T>): T {
    this._sort = {};

    for (const [key, value] of Object.entries(sort)) {
      this._sort[key] = value === 'ASC' ? 1 : -1;
    }

    return this;
  }

  /**
   * Return options suitable for `find` method
   *
   * @return { WithoutProjection<FindOneOptions<any>> }
   */
  private static get options(): WithoutProjection<FindOneOptions<any>> {
    // Make options
    const options: WithoutProjection<FindOneOptions<any>> = {
      skip: Number(this._skip) || 0,
      limit: Number(this._take) || 0,
      sort: this._sort || {}
    };

    // Reset modifiers
    this._take = undefined;
    this._skip = undefined;
    this._sort = undefined;

    return options;
  }

  /**
   * Find one object that match the selected criteria
   *
   * @param { string | Filter<T, K> } filter Filter can be an ID as an string or an object as payload filter
   * @returns { T['prototype'] | undefined } Entity class or undefined if not found
   */
  public static async findOne<T extends typeof BaseEntity, K extends keyof T>(this: T, filter: Filter<T, K> | string): Promise<T['prototype'] | undefined> {
    let result: any;

    if (typeof filter === 'string') {
      result = await this.repository.findOne({
        _id: new ObjectID(filter)
      });
    } else {
      if ('_id' in filter && typeof filter._id === 'string') {
        filter._id = new ObjectID(filter._id);
      }

      result = await this.repository.findOne(filter);
    }

    return plainToClassFromExist(new this, result)
  }

  /**
   * Find multiple entities that match criteria
   */
  public static async find<T extends typeof BaseEntity, K extends keyof T>(this: T, filter?: Filter<T, K>): Promise<T['prototype'][]> {
    const query = this.repository.find(filter ?? {}, this.options);

    const result = await query.toArray();

    return plainToClass(this, result);
  }

  /**
   * Save object and return object with generated ID
   */
  public async create(): Promise<this> {
    const data = classToPlain(this, { ignoreDecorators: true });

    const { insertedId } = await this.repository.insertOne(data);
    this._id = insertedId;

    return this;
  }

  /**
   * Update an object statically by its ID
   *
   * @param { string | ObjectID } id ID of the object
   * @param { Properties<T> } data Data
   */
  public static async update<T extends typeof BaseEntity>(this: T, id: string | ObjectID, data: Properties<T>): Promise<T['prototype'] | undefined> {
    // Get object
    const instance = await this.findOne(id)

    // Assign data
    Object.assign(instance, data)

    // Update
    return await instance?.update()
  }

  /**
   * Update the object
   */
  public async update(): Promise<this> {
    const data = classToPlain(this, { ignoreDecorators: true });
    delete data._id;

    await this.repository.updateOne({
      _id: new ObjectID(this._id)
    }, {
      $set: data
    });

    return this;
  }

  /**
   * Delete an object
   *
   * @return { boolean }
   */
  public async delete(): Promise<boolean> {
    const res = await this.repository.deleteOne({
      _id: new ObjectID(this._id)
    });

    return res.deletedCount === 1;
  }

  /**
   * Delete an object by its ID
   *
   * @param { string | ObjectID } id
   * @returns { Promise<boolean> }
   */
  public static async delete<T extends typeof BaseEntity>(this: T, id: string | ObjectID): Promise<boolean> {
    if (typeof id === 'string') {
      id = new ObjectID(id)
    }

    const res = await this.repository.deleteOne({
      _id: id
    })

    return res.deletedCount === 1
  }
}