"use client"

import React from 'react'
import { TimePeriod } from '@/hooks/useTimeFilter'
import { Project } from '@/hooks/useProjects'
import { InsightsPage } from './InsightsPage'

interface InsightsPanelProps { selectedPeriod: TimePeriod; selectedProject: Project | null }

const InsightsPanel: React.FC<InsightsPanelProps> = ({ selectedPeriod, selectedProject }) => {
  return <InsightsPage selectedPeriod={selectedPeriod} selectedProject={selectedProject} />
}

export default InsightsPanel


