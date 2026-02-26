import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ProjectConnection {
  id: string           // local identifier for this connection
  name: string         // human-readable name the user gives it
  url: string          // http://localhost:3000 or https://my-app.com
  serviceRoleKey: string  // the service_role key
  projectId: string    // betterbase project ID
  addedAt: string      // ISO timestamp
  lastConnectedAt?: string
}

interface ConnectionStore {
  connections: ProjectConnection[]
  activeConnectionId: string | null
  addConnection: (conn: Omit<ProjectConnection, "id" | "addedAt">) => void
  removeConnection: (id: string) => void
  setActive: (id: string) => void
  getActive: () => ProjectConnection | null
  updateLastConnected: (id: string) => void
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set, get) => ({
      connections: [],
      activeConnectionId: null,

      addConnection: (conn) => {
        const id = Math.random().toString(36).slice(2, 10)
        set(state => ({
          connections: [...state.connections, {
            ...conn,
            id,
            addedAt: new Date().toISOString(),
          }],
          activeConnectionId: id,
        }))
      },

      removeConnection: (id) => set(state => ({
        connections: state.connections.filter(c => c.id !== id),
        activeConnectionId: state.activeConnectionId === id
          ? state.connections[0]?.id ?? null
          : state.activeConnectionId,
      })),

      setActive: (id) => set({ activeConnectionId: id }),

      getActive: () => {
        const { connections, activeConnectionId } = get()
        return connections.find(c => c.id === activeConnectionId) ?? null
      },

      updateLastConnected: (id) => set(state => ({
        connections: state.connections.map(c =>
          c.id === id
            ? { ...c, lastConnectedAt: new Date().toISOString() }
            : c
        ),
      })),
    }),
    {
      name: "betterbase-connections",
    }
  )
)
