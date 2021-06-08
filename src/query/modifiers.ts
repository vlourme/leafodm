import { FindOneOptions, WithoutProjection } from "mongodb";
import { BaseEntity } from "../entity";
import { BaseModel } from "../model";
import { PropertySorting } from "../types";

export abstract class ModifierBuilder extends BaseModel {
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
  private static _sort?: Record<string, number>

  /**
   * Get every properties that starts with an underscore (modifiers)
   *
   * @returns { string[] }
   */
  private static getProperties<T extends typeof ModifierBuilder>(this: T): string[] {
    return Object.getOwnPropertyNames(this).filter(value => value.startsWith('_'))
  }

  /**
   * Take only a certain amount of document on the next query
   *
   * @param { number | undefined } amount Limit of document
   * @return { this }
   */
  public static take<T extends typeof ModifierBuilder>(this: T, amount?: number): T {
    this._take = amount;

    return this;
  }

  /**
   * Skip a certain amount of document on the next query
   *
   * @return { this }
   * @param amount
   */
  public static skip<T extends typeof ModifierBuilder>(this: T, amount?: number): T {
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
  protected static get options(): WithoutProjection<FindOneOptions<any>> {
    // Make options
    const options: WithoutProjection<FindOneOptions<any>> = {
      skip: Number(this._skip) || 0,
      limit: Number(this._take) || 0,
      sort: this._sort || {},
    };

    // Reset modifiers
    this.reset()

    return options;
  }

  /**
   * Reset properties
   */
  private static reset() {
    const properties = this.getProperties()

    for (const property of properties) {
      this[property] = undefined
    }
  }
}