import { FilterQuery, ObjectID } from 'mongodb';
import { NonFunctionKeys } from 'utility-types';
import { BaseEntity } from '../entity';

/**
 * Remove index signature from type
 *
 * @description This allow us to keep schema-less feature while still offering decent auto-complete of internal class properties
 */
type RemoveIndex<T> = {
  [P in keyof T as string extends P ? never : number extends P ? never : P]: T[P]
};

/**
 * Assign children class properties to a sort order such as ascending or descending.
 *
 * @todo Using RemoveIndex, we can keep a coherent type completion but we lose the possibility to sort a non-defined property
 */
export type PropertySorting<T extends typeof BaseEntity> = Partial<Record<NonFunctionKeys<RemoveIndex<T['prototype']>>, 'ASC' | 'DESC'>>

/**
 * Get properties of T without index signature and methods
 */
export type PropertiesOf<T extends typeof BaseEntity> = Pick<RemoveIndex<T['prototype']>, NonFunctionKeys<RemoveIndex<T['prototype']>>>

/**
 * Assign properties of T as optional and allow unknown keys to be assigned too (schema-less)
 */
export type Properties<T extends typeof BaseEntity> = Partial<PropertiesOf<T>> & { [key: string]: unknown }

/**
 * FilterQuery
 */
export type Filter<T extends typeof BaseEntity, K extends keyof T> = FilterQuery<T[K] | { _id?: string | ObjectID }>