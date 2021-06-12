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
    const { deletedCount } = await this.repository.deleteOne({
      _id: new ObjectID(this._id)
    });

    return deletedCount === 1;
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

    const { deletedCount } = await this.repository.deleteOne({
      _id: id
    })

    return deletedCount === 1
  }

  /**
   * Delete multiple object once
   *
   * @param { Filter<T> } filter Criteria
   * @returns { Promise<boolean> }
   */
  public static async deleteMany<T extends typeof BaseEntity>(this: T, filter: Filter<T>): Promise<boolean> {
    const { deletedCount } = await this.repository.deleteMany(filter)

    return (deletedCount || 0) > 0
  }
}