import { plainToClass, plainToClassFromExist } from "class-transformer";
import { BaseEntity } from "../entity";
import { Filter } from "../types";
import { CreateOperator } from "./create";

export abstract class ReadOperator extends CreateOperator {
  /**
   * Find one object that match the selected criteria
   *
   * @param { string | Filter<T, K> } filter Filter can be an ID as an string or an object as payload filter
   * @param { boolean } relations Enable relations
   * @returns { T['prototype'] | undefined } Entity class or undefined if not found
   */
  public static async findOne<T extends typeof BaseEntity>(this: T, filter: Filter<T> | string, relations = true): Promise<T['prototype'] | undefined> {
    const payload = this.transformFilters(filter)

    if (relations && this.relations.length > 0) {
      const result = await this.lookup(payload)

      return result ? result[0] : undefined
    } else {
      const result = await this.repository.findOne(payload)

      return plainToClassFromExist(new this, result)
    }
  }

  /**
   * Find multiple entities that match criteria
   */
  public static async find<T extends typeof BaseEntity>(this: T, filter?: Filter<T>): Promise<T['prototype'][]> {
    const query = this.repository.find(filter ?? {}, this.options);

    const result = await query.toArray();

    return plainToClass(this, result);
  }

  /**
   * Count number of document that matches the criteria
   *
   * @param { Filter<T> } filter Criteria
   * @returns { Promise<number> } Number of document
   */
  public static async count<T extends typeof BaseEntity>(this: T, filter?: Filter<T>): Promise<number> {
    return await this.repository.countDocuments(filter)
  }

  /**
   * Execute a lookup aggregation to fetch relations
   *
   * @param { Filter<T> } filter
   * @returns { Promise<T['prototype'][] | undefined> }
   */
  protected static async lookup<T extends typeof BaseEntity>(this: T, filter?: Filter<T>): Promise<T['prototype'][] | undefined> {
    const lookups: Record<string, any>[] = []

    for (const relation of this.relations) {
      if (relation.isObjectId) {
        lookups.push({
          $set: {
            [relation.localKey]: {
              $toObjectId: '$' + relation.localKey
            }
          }
        })
      }

      lookups.push({
        $lookup: {
          from: relation.fieldName,
          localField: relation.localKey,
          foreignField: relation.foreignKey,
          as: relation.fieldName
        }
      })
    }

    const aggregation = this.repository.aggregate([
      {
        $match: filter
      },
      ...lookups
    ])

    const result = await aggregation.toArray()

    for (let i = 0; i < result.length; i++) {
      const object = result[i]

      for (const relation of this.relations) {
        if (relation.relation === 'one' && relation.fieldName in object && Array.isArray(object[relation.fieldName])) {
          object[relation.fieldName] = plainToClass(relation.type, object[relation.fieldName][0])
        }
      }

      result[i] = plainToClassFromExist(new this, object)
    }

    return result
  }
}