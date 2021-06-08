import { plainToClass, plainToClassFromExist } from "class-transformer";
import { ObjectID } from "mongodb";
import { BaseEntity } from "../entity";
import { Filter } from "../types";
import { CreateOperator } from "./create";

export abstract class ReadOperator extends CreateOperator {
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
}