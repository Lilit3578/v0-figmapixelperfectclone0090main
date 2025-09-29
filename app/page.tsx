import SprintTracker from "@/components/features/timer/SprintTracker"
import ProtectedRoute from "@/components/shared/ProtectedRoute"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <SprintTracker />
    </ProtectedRoute>
  )
}
