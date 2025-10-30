import Dexie, { Table } from 'dexie';

export interface Reflection {
  id?: number;
  date: string;
  text: string;
  echo: string;
}

export class ReflectionsDatabase extends Dexie {
  reflections!: Table<Reflection, number>;

  constructor() {
    super('ReflectionsDatabase');
    this.version(1).stores({
      reflections: '++id,date,text,echo',
    });
  }
}

export const reflectionsDB = new ReflectionsDatabase();
