import Dexie, { Table } from 'dexie'

export interface Note {
  id: string
  text: string
  tags: string[]
  createdAt: string // ISO
  updatedAt?: string // ISO
}

class NotesDB extends Dexie {
  notes!: Table<Note, string>
  constructor(){
    super('kindredEcho')
    this.version(1).stores({
      notes: 'id, createdAt'
    })
  }
}

export const db = new NotesDB()
