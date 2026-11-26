import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { leadStatuses, projectStatuses } from './intake'
import type { Inquiry } from './intake'

interface Page {
  items: Inquiry[]
  hasNext: boolean
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch('/api/admin/inquiries' + path, init)
  const body = await response.json().catch(() => null)
  if (!response.ok || !body || response.redirected) {
    throw new Error(body?.message ?? 'The portal could not load. Refresh the page to sign in again.')
  }
  return body as T
}

function InquiryCard({ item, onSave }: { item: Inquiry; onSave: (updated: Inquiry) => void }) {
  const [projectName, setProjectName] = useState(item.project_name ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setSaving(true)
    setMessage('')
    setSaveError('')
    try {
      const updated = await adminRequest<Inquiry>('/' + item.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadStatus: fields.get('leadStatus'),
          projectName,
          projectStatus: projectName.trim() ? fields.get('projectStatus') : '',
          notes: fields.get('notes'),
          version: item.revision,
        }),
      })
      setProjectName(updated.project_name ?? '')
      onSave(updated)
      setMessage('Saved.')
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'Changes could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="panel inquiry">
      <h2>{item.project_name ?? item.name}</h2>
      <p className="muted">{item.project_type} · {new Date(item.created_at).toLocaleDateString()}</p>
      <p>{item.project_name && <>{item.name} · </>}<a href={'mailto:' + encodeURIComponent(item.email).replace('%40', '@')}>{item.email}</a>{item.company && <> · {item.company}</>}</p>
      <p className="goal">{item.goal}</p>
      {(item.timing || item.budget) && <p className="muted">{[item.timing, item.budget].filter(Boolean).join(' · ')}</p>}
      <form onSubmit={save}>
        <fieldset disabled={saving} className="form-grid">
          <label>Lead status<select name="leadStatus" defaultValue={item.lead_status}>
            {leadStatuses.map(status => <option key={status}>{status}</option>)}
          </select></label>
          <label>Project name<input value={projectName} onChange={event => setProjectName(event.target.value)} maxLength={160} placeholder="Name this project when it moves forward" /></label>
          {projectName.trim() && <label>Project status<select name="projectStatus" defaultValue={item.project_status ?? 'Planned'}>
            {projectStatuses.map(status => <option key={status}>{status}</option>)}
          </select></label>}
          <label className="full">Private notes<textarea name="notes" defaultValue={item.notes} maxLength={3000} /></label>
        </fieldset>
        {saveError && <p className="error" role="alert">{saveError}</p>}
        <div className="actions"><button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button><span role="status">{message}</span></div>
      </form>
    </article>
  )
}

export function Admin() {
  const [view, setView] = useState<'leads' | 'projects'>('leads')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Page | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    adminRequest<Page>('?view=' + view + '&page=' + page, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setData(result) })
      .catch(cause => { if (!controller.signal.aborted) setError(cause.message) })
    return () => controller.abort()
  }, [view, page])

  function navigate(nextView: typeof view, nextPage: number) {
    if (nextView === view && nextPage === page) return
    setData(null)
    setError('')
    setView(nextView)
    setPage(nextPage)
  }

  function applyUpdate(updated: Inquiry) {
    setData(current => current && ({
      ...current,
      items: current.items.flatMap(item => {
        if (item.id !== updated.id) return [item]
        return view === 'projects' && !updated.project_name ? [] : [updated]
      }),
    }))
  }

  return (
    <main className="admin">
      <h1>Consulting portal</h1>
      <nav className="actions" aria-label="Portal views">
        <button type="button" aria-pressed={view === 'leads'} onClick={() => navigate('leads', 1)}>Leads</button>
        <button type="button" aria-pressed={view === 'projects'} onClick={() => navigate('projects', 1)}>Projects</button>
      </nav>
      {error && <p role="alert" className="error">{error}</p>}
      {!data && !error && <p role="status">Loading…</p>}
      {data && (
        <>
          {data.items.length === 0 && <p>{view === 'leads' ? 'No inquiries yet.' : 'No projects on this page. Open a lead and add a project name to start one.'}</p>}
          <div className="inquiries">{data.items.map(item => <InquiryCard key={item.id} item={item} onSave={applyUpdate} />)}</div>
          {(page > 1 || data.hasNext) && <div className="actions pagination">
            <button type="button" disabled={page === 1} onClick={() => navigate(view, page - 1)}>Previous</button>
            <span>Page {page}</span>
            <button type="button" disabled={!data.hasNext} onClick={() => navigate(view, page + 1)}>Next</button>
          </div>}
        </>
      )}
    </main>
  )
}
