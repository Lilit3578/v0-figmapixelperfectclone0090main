import React, { useState } from 'react'
import { Sprint } from '@/hooks/useSprints'
import { useProjects } from '@/hooks/useProjects'
import { formatDuration } from '@/hooks/useTimeFilter'
import { format } from 'date-fns'
import { EditSprintModal } from './EditSprintModal'

interface SprintsTabProps { sprints: Sprint[] }

export const SprintsTab: React.FC<SprintsTabProps> = ({ sprints }) => {
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const { projects } = useProjects()
  const getProjectName = (projectId: string) => projects.find((p) => p.id === projectId)?.name || 'Unknown Project'
  const formatSprintId = (id: string) => `SPRINT-${id.slice(-2).toUpperCase()}`
  if (sprints.length === 0) {
    return (
      <div style={{ alignSelf: 'stretch', flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        <div style={{ color: 'rgba(31, 31, 31, 0.64)', fontSize: 14, fontFamily: 'Be Vietnam Pro', fontWeight: '400', lineHeight: 23.8, wordWrap: 'break-word' }}>No sprints found for this period</div>
      </div>
    )
  }
  return (
    <>
      <div style={{ alignSelf: 'stretch', flex: '1 1 0', overflow: 'auto', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
        {sprints.map((sprint) => (
          <div key={sprint.id} style={{ alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, background: 'white', overflow: 'hidden', borderRadius: 4, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex', cursor: 'pointer' }} onClick={() => setSelectedSprint(sprint)}>
            <div style={{ width: 120, color: 'rgba(31, 31, 31, 0.64)', fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: '400', lineHeight: 15, wordWrap: 'break-word' }}>{formatSprintId(sprint.id)}</div>
            <div style={{ width: 200, color: '#1F1F1F', fontSize: 14, fontFamily: 'Be Vietnam Pro', fontWeight: '400', lineHeight: 23.8, wordWrap: 'break-word' }}>{getProjectName((sprint as any).projectId || (sprint as any).project_id)}</div>
            <div style={{ width: 120, color: '#1F1F1F', fontSize: 14, fontFamily: 'Be Vietnam Pro', fontWeight: '300', lineHeight: 23.8, wordWrap: 'break-word' }}>{formatDuration((sprint as any).duration || (sprint as any).duration_seconds)}</div>
            <div style={{ width: 120, color: '#1F1F1F', fontSize: 14, fontFamily: 'Be Vietnam Pro', fontWeight: '300', lineHeight: 23.8, wordWrap: 'break-word' }}>{format(new Date((sprint as any).endTime || (sprint as any).completed_at), 'EEE dd/MM')}</div>
            <div style={{ flex: '1 1 0', color: '#1F1F1F', fontSize: 14, fontFamily: 'Be Vietnam Pro', fontWeight: '300', lineHeight: 23.8, wordWrap: 'break-word' }}>{(sprint as any).notes || 'No description'}</div>
          </div>
        ))}
      </div>
      {selectedSprint && <EditSprintModal sprint={selectedSprint} onClose={() => setSelectedSprint(null)} />}
    </>
  )
}


