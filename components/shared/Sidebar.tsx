"use client"

import React from 'react'
import ProjectDropdown from './ProjectDropdown'
import NotesTextarea from '@/components/features/timer/NotesTextarea'
import TimerControls from '@/components/features/timer/TimerControls'
import TimePeriodNav from './TimePeriodNav'
import { useAuth } from '@/hooks/useAuth'
import { Button } from 'nullab-design-system'
import { LogOut } from 'lucide-react'
import { useTimerContext } from '@/contexts/TimerContext'
import { Project } from '@/hooks/useProjects'
import { TimePeriod } from '@/hooks/useTimeFilter'

interface SidebarProps {
  activeTab: 'timer' | 'insights'
  selectedProject?: Project | null
  onProjectChange?: (project: Project | null) => void
  selectedPeriod?: TimePeriod
  onPeriodChange?: (period: TimePeriod) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  selectedProject: propSelectedProject,
  onProjectChange: propOnProjectChange,
  selectedPeriod = 'today',
  onPeriodChange,
}) => {
  const { signOut } = useAuth()
  const { notes, setNotes, selectedProject: contextSelectedProject, setSelectedProject: contextSetSelectedProject } = useTimerContext()

  const selectedProject = activeTab === 'insights' ? propSelectedProject : contextSelectedProject
  const onProjectChange = activeTab === 'insights' ? propOnProjectChange : contextSetSelectedProject

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <aside className="flex h-full w-25 flex-col items-start gap-4 shrink-0 self-stretch rounded box-border p-4 max-md:w-full max-md:max-w-[600px] max-sm:gap-3 max-sm:p-3">
      <header className="flex justify-between items-center self-stretch rounded">
        <h1 className="text-[#1F1F1F] text-xl italic font-normal leading-8" style={{ fontFamily: 'Instrument Serif, serif' }}>
          sprint tracker
        </h1>
        <Button variant="text" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      <div className="w-[328px] h-px bg-[rgba(31,31,31,0.04)] max-md:w-full" />

      <ProjectDropdown selectedProject={selectedProject} onProjectChange={onProjectChange} isInsightsTab={activeTab === 'insights'} />

      <div className="w-[328px] h-px bg-[rgba(31,31,31,0.04)] max-md:w-full" />

      {activeTab === 'timer' && (
        <>
          <NotesTextarea value={notes} onChange={setNotes} />
          <div className="w-[328px] h-px bg-[rgba(31,31,31,0.04)] max-md:w-full" />
          <TimerControls />
        </>
      )}

      {activeTab === 'insights' && <TimePeriodNav selectedPeriod={selectedPeriod} onPeriodChange={onPeriodChange || (() => {})} />}
      {activeTab === 'insights' && <div className="w-[328px] h-px bg-[rgba(31,31,31,0.04)] max-md:w-full" />}
    </aside>
  )
}

export default Sidebar


