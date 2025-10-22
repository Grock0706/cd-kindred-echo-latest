import Dexie from 'dexie'

export type Note = {
  id: string
  text: string
  tags?: string[]
  createdAt: string
}

export const db = new Dexie('kindred_echo_db') as Dexie & { notes: Dexie.Table<Note, string> }

db.version(1).stores({
  notes: 'id, createdAt'
})

// Provide a small helper to seed (optional)
export async function seedDemo(){
  const count = await db.notes.count()
  if(count === 0){
    await db.notes.add({ id: crypto.randomUUID(), text: 'Welcome to Kindred Echo — your first reflection', tags: ['intro'], createdAt: new Date().toISOString() })
  }
}

export default db
