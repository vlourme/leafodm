import { ObjectID } from "mongodb";
import { BaseEntity } from "../entity";
import { Filter } from "../types";
import { UpdateOperator } from "./update";

export abstract class DeleteOperator extends UpdateOperator {
  /**
   * Delete an object
   *
   * @param { boolean } relation Delete linked relations (default to false)
   * @return { boolean }
   */
  public async delete(relation = false): Promise<boolean> {
    if (relation) {
      for (const relation of this.constructor.relations) {
        if (relation.property in this && this[relation.property] instanceof BaseEntity) {
          await (<BaseEntity>this[relation.property]).delete()
        }
      }
    }

    return this.constructor.delete(this._id)
  }

  /**
   * Delete an object by its ID
   *
   * Note: this may not work with relations
   *
   * @param { string | ObjectID } id
   * @returns { Promise<boolean> }
   */
  public static async delete<T extends typeof BaseEntity>(this: T, id: string | ObjectID): Promise<boolean> {
    const { deletedCount } = await this.repository.deleteOne(this.transformFilters(id))

    return deletedCount === 1
  }

  /**
   * Delete multiple object once
   *
   * @param { Filter<T> } filter Criteria
   * @returns { Promise<boolean> }
   */
  public static async deleteMany<T extends typeof BaseEntity>(this: T, filter: Filter<T>): Promise<boolean> {
    const { deletedCount } = await this.repository.deleteMany(this.transformFilters(filter))

    return deletedCount !== 0
  }
}