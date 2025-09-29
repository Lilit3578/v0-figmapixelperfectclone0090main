import React, { useState, useEffect } from 'react'
import { Sprint, useSprints } from '@/hooks/useSprints'
import { useProjects } from '@/hooks/useProjects'
import { formatDuration } from '@/hooks/useTimeFilter'
import { Button } from 'nullab-design-system'
import { useToast } from '@/hooks/use-toast'

interface EditSprintModalProps { sprint: Sprint; onClose: () => void }

export const EditSprintModal: React.FC<EditSprintModalProps> = ({ sprint, onClose }) => {
  const [projectId, setProjectId] = useState((sprint as any).projectId || (sprint as any).project_id)
  const [duration, setDuration] = useState(formatDuration((sprint as any).duration || (sprint as any).duration_seconds))
  const [notes, setNotes] = useState((sprint as any).notes || '')
  const [showDeleteNotification, setShowDeleteNotification] = useState(false)
  const { projects } = useProjects()
  const { updateSprint, deleteSprint } = useSprints()
  const { toast } = useToast()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') { onClose() } }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const parseDuration = (durationStr: string): number => {
    const hourMatch = durationStr.match(/(\d+)h/)
    const minuteMatch = durationStr.match(/(\d+)m/)
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
    return hours * 3600 + minutes * 60
  }

  const handleSave = async () => {
    const durationSeconds = parseDuration(duration)
    if (durationSeconds <= 0) {
      toast({ title: 'Invalid Duration', description: 'Duration must be greater than 0', variant: 'destructive' })
      return
    }
    const success = await updateSprint(sprint.id, { duration_seconds: durationSeconds, notes: notes.trim() || undefined })
    if (success) { onClose() }
  }

  const handleDelete = async () => {
    const success = await deleteSprint(sprint.id)
    if (success) {
      setShowDeleteNotification(true)
      setTimeout(() => { setShowDeleteNotification(false); onClose() }, 3000)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#1F1F1F] text-xl font-normal" style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic' }}>sprint //</h2>
            <button onClick={onClose} className="text-[rgba(31,31,31,0.64)] hover:text-[#1F1F1F] text-xl">×</button>
          </div>
          <div className="space-y-4">
            <div>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-4 py-2 bg-white border border-[rgba(31,31,31,0.12)] rounded" style={{ fontFamily: 'Be Vietnam Pro', fontSize: '14px', lineHeight: '23.80px' }}>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 1h 30m" className="w-full px-4 py-2 bg-white border border-[rgba(31,31,31,0.12)] rounded" style={{ fontFamily: 'Be Vietnam Pro', fontSize: '14px', lineHeight: '23.80px' }} />
            </div>
            <div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about what you worked on..." className="w-full px-4 py-2 bg-white border border-[rgba(31,31,31,0.12)] rounded resize-none" rows={3} style={{ fontFamily: 'Be Vietnam Pro', fontSize: '14px', lineHeight: '23.80px' }} />
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <Button variant="primary" onClick={handleSave} className="w-full rounded-[100px] py-3 font-mono text-xs font-medium uppercase">SAVE CHANGES</Button>
            <Button variant="secondary" onClick={handleDelete} className="w-full rounded-[100px] py-3 font-mono text-xs font-medium uppercase">DELETE SPRINT</Button>
          </div>
        </div>
      </div>
      {showDeleteNotification && (
        <div className="fixed bottom-6 right-6 bg-[#1F1F1F] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <span style={{ fontFamily: 'Be Vietnam Pro', fontSize: '14px', lineHeight: '23.80px' }}>sprint-{sprint.id.slice(-2)} has been deleted</span>
          <button onClick={() => setShowDeleteNotification(false)} className="bg-white text-[#1F1F1F] px-3 py-1 rounded text-sm font-medium" style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>UNDO</button>
          <button onClick={() => setShowDeleteNotification(false)} className="text-white hover:text-[rgba(255,255,255,0.8)]">×</button>
        </div>
      )}
    </>
  )
}


