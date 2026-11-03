import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function App() {
  return (
    <div className="page">
      <header><a className="wordmark" href="/" aria-label="teske.sh home">teske<span>.sh</span></a><span className="status"><span aria-hidden="true" />In the works</span></header>
      <main>
        <p className="eyebrow">A NEW CHAPTER</p>
        <h1>Coming<br /><span>soon.</span><span className="cursor" aria-hidden="true">_</span></h1>
        <p className="intro">A new home on the web.<br />A little more time, and a lot more to come.</p>
        <div className="terminal" aria-hidden="true"><span>~</span> teske.sh <span className="prompt">$</span> <span className="command">building what's next</span></div>
      </main>
      <footer><span>teske.sh</span><span>See you soon <span aria-hidden="true">↗</span></span></footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
