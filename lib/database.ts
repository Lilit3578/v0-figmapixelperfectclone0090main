import { MongoClient, type Db, type Collection } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const client = new MongoClient(uri)

let cachedDb: Db | null = null

async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  await client.connect()
  const db = client.db("sprint-tracker")
  cachedDb = db
  return db
}

export interface User {
  id: string
  email: string
  createdAt: Date
}

export interface Project {
  id: string
  userId: string
  name: string
  createdAt: Date
}

export interface Sprint {
  id: string
  userId: string
  projectId: string
  duration: number
  startTime: Date
  endTime: Date
  notes?: string
  timerMode: "stopwatch" | "countdown"
}

export async function createUser(userData: Omit<User, "createdAt">): Promise<User> {
  const db = await connectToDatabase()
  const users: Collection<User> = db.collection("users")

  const user: User = {
    ...userData,
    createdAt: new Date(),
  }

  await users.insertOne(user)
  return user
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await connectToDatabase()
  const users: Collection<User> = db.collection("users")

  return await users.findOne({ email })
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await connectToDatabase()
  const users: Collection<User> = db.collection("users")

  return await users.findOne({ id })
}

export async function createProject(projectData: Omit<Project, "createdAt">): Promise<Project> {
  const db = await connectToDatabase()
  const projects: Collection<Project> = db.collection("projects")

  const project: Project = {
    ...projectData,
    createdAt: new Date(),
  }

  await projects.insertOne(project)
  return project
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const db = await connectToDatabase()
  const projects: Collection<Project> = db.collection("projects")

  return await projects.find({ userId }).toArray()
}

export async function createSprint(sprintData: Sprint): Promise<Sprint> {
  const db = await connectToDatabase()
  const sprints: Collection<Sprint> = db.collection("sprints")

  await sprints.insertOne(sprintData)
  return sprintData
}

export async function getSprintsByUserId(userId: string): Promise<Sprint[]> {
  const db = await connectToDatabase()
  const sprints: Collection<Sprint> = db.collection("sprints")

  return await sprints.find({ userId }).toArray()
}
