import { StrictMode, useState } from 'react'
import type { FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { Admin } from './admin'
import { projectTypes, timings } from './intake'
import './index.css'

function IntakeForm() {
  const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle')
  const [error, setError] = useState('')
  const [inquiryId] = useState(() => crypto.randomUUID())

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'busy') return
    const form = event.currentTarget
    setState('busy')
    setError('')
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), inquiryId }),
      })
      if (response.status !== 201) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message ?? 'Please try again in a moment.')
      }
      form.reset()
      setState('sent')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try again.')
      setState('idle')
    }
  }

  return (
    <section className="panel" aria-labelledby="inquiry-title">
      <h2 id="inquiry-title">Tell me about your project</h2>
      <p className="muted">An early idea is fine. Start with what you want to improve or build.</p>
      {state === 'sent' ? <p className="success" role="status">Thanks for reaching out. I’ll review your inquiry and follow up by email.</p> : (
        <form onSubmit={submit}>
          <div className="form-grid">
            <label>Name<input name="name" autoComplete="name" maxLength={120} required /></label>
            <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
            <label>Company <span className="muted">(optional)</span><input name="company" autoComplete="organization" maxLength={160} /></label>
            <label>Project type
              <select name="projectType" defaultValue="" required>
                <option value="" disabled>Choose a project type</option>
                {projectTypes.map(option => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="full">What are you trying to accomplish?
              <textarea name="goal" maxLength={3000} required placeholder="What do you do today, who would use this, and what would you like to change?" />
            </label>
            <label className="full">Timing <span className="muted">(optional)</span>
              <select name="timing" defaultValue="">
                <option value="">Select timing</option>
                {timings.map(option => <option key={option}>{option}</option>)}
              </select>
            </label>
            <div className="trap" aria-hidden="true">
              <label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="actions"><button type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Send inquiry'}</button></div>
        </form>
      )}
    </section>
  )
}

function App() {
  const admin = location.pathname === '/admin' || location.pathname === '/admin/'
  return (
    <div className="page">
      <header><a className="wordmark" href="/" aria-label="Teske.sh home">teske<span>.sh</span></a></header>
      {admin ? <Admin /> : (
        <main className="landing">
          <section aria-labelledby="landing-title">
            <p className="eyebrow">SOFTWARE CONSULTING</p>
            <h1 id="landing-title">Custom websites, apps, and <span>business software.</span></h1>
            <p className="intro">I’m Daric Teske. I help businesses build a website, launch a product, or simplify how their team works.</p>
            <ul className="examples">
              <li><div><strong>Custom websites</strong><p>Launch a new business site, redesign an existing one, or get help keeping it up to date.</p></div></li>
              <li><div><strong>Web and mobile apps</strong><p>Give customers an app to book, buy, or track their work.</p></div></li>
              <li><div><strong>Internal tools and integrations</strong><p>Replace spreadsheets, connect your systems, and reduce manual work.</p></div></li>
            </ul>
          </section>
          <IntakeForm />
        </main>
      )}
      <footer><span>teske.sh</span><span>Daric Teske</span></footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
