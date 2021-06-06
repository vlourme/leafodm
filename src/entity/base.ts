import { ObjectID, WithoutProjection, FindOneOptions, Collection } from 'mongodb';
import { classToPlain, plainToClass, Type } from 'class-transformer';
import { DatabaseManager } from '../manager';
import { Filter } from '../typings/query';

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
   * Force schema-less structure
   */
  [key: string]: any;

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
  public static sortBy<T extends typeof BaseEntity>(this: T, sort: { [K in keyof Partial<T['prototype']>]: ('ASC' | 'DESC') }): T {
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

    return plainToClass(this, result);
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
   * Update the object
   */
  public async update(): Promise<this> {
    const data = classToPlain(this, { ignoreDecorators: true });

    if ('_id' in data) {
      delete data._id;
    }

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

    return res.deletedCount == 1;
  }
}
