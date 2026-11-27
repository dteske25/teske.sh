export const projectTypes = [
  'Custom website',
  'Web or mobile app',
  'Internal tool or dashboard',
  'Workflow automation or integration',
  'Improve existing software',
  'Other or still figuring it out',
] as const

export const timings = ['As soon as possible', 'In the next 1–3 months', 'More than 3 months out', 'Just exploring'] as const
export const budgets = ['Under $5,000', '$5,000 to under $15,000', '$15,000 to under $50,000', '$50,000 or more', 'Still working it out'] as const
export const leadStatuses = ['New', 'Contacted', 'Closed'] as const
export const projectStatuses = ['Planned', 'In progress', 'On hold', 'Complete'] as const

export interface Inquiry {
  id: string
  name: string
  email: string
  company: string
  project_type: string
  goal: string
  timing: string
  budget: string
  created_at: string
  lead_status: typeof leadStatuses[number]
  project_name: string | null
  project_status: typeof projectStatuses[number] | null
  notes: string
  updated_at: string
  revision: number
}
