import { classToPlain } from "class-transformer";
import { ObjectID } from "mongodb";
import { Relation } from "../decorators";
import { BaseEntity } from "../entity";
import { Filter, Properties } from "../types";
import { ReadOperator } from "./read";

export abstract class UpdateOperator extends ReadOperator {
  /**
   * Update an object statically by its ID
   *
   * Note: This method may have problems with relations
   *
   * @param { string | ObjectID } id ID of the object
   * @param { Properties<T> } data Data
   */
  public static async update<T extends typeof BaseEntity>(this: T, id: string | ObjectID, data: Properties<T>): Promise<T['prototype'] | undefined> {
    // Get object
    const instance = await this.findOne(id)

    // Check response
    if (!instance) {
      return undefined
    }

    // Assign data
    Object.assign(instance, data)

    // Update
    return await instance.update()
  }

  /**
   * Update the object
   *
   * @param { boolean } relation Update linked relations
   * @param { boolean } upsert Insert object if it does not exists
   */
  public async update(relation = true, upsert = true): Promise<this> {
    let data = classToPlain(this, { ignoreDecorators: true });
    delete data._id;

    if (relation) {
      data = await this.handleRelation(data, async (entity) => await entity.update(true, upsert))
    } else {
      data = this.disableRelation(data)
    }

    await this.constructor.repository.updateOne({
      _id: new ObjectID(this._id)
    }, {
      $set: data
    }, {
      upsert
    });

    return this;
  }

  /**
   * Update many document following criteria
   *
   * @param { Filter<T> } filter Criteria
   * @param { Properties<T> } data Update data
   * @returns { Promise<number> } Number of affected documents
   */
  public static async updateMany<T extends typeof BaseEntity>(this: T, filter: Filter<T>, data: Properties<T>): Promise<number> {
    const { modifiedCount } = await this.repository.updateMany(filter, {
      $set: data
    })

    return modifiedCount
  }
}