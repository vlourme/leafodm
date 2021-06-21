import { ObjectID } from "mongodb";
import { BaseEntity } from "../entity";
import { Filter } from "../types";
import { UpdateOperator } from "./update";

export abstract class DeleteOperator extends UpdateOperator {
  /**
   * Delete an object
   *
   * @return { boolean }
   */
  public async delete(): Promise<boolean> {
    return this.constructor.delete(this._id)
  }

  /**
   * Delete an object by its ID
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