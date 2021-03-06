import BaseDictionary from './base';
import { create } from './dictionaries';

export { Dictionaries } from './dictionaries';
export const createDictionary = create;
export const dictionaries = create();
export const Base = BaseDictionary;
