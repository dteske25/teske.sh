const services = [
  {
    name: 'Custom websites',
    description: 'Make it easy for customers to find you, understand what you offer, and get in touch. I can also help keep the site up to date after launch.',
    examples: 'New sites · Redesigns · Ongoing updates',
  },
  {
    name: 'Web and mobile apps',
    description: 'Give your customers a place to book a service, manage an account, or track an order. We can start with the features people will use most.',
    examples: 'Booking apps · Customer portals · New products',
  },
  {
    name: 'Internal tools and integrations',
    description: 'Give your team a better way to handle work that lives in spreadsheets or gets copied between systems.',
    examples: 'Dashboards · Workflow automation · Integrations',
  },
]

export function HomeIntro() {
  return (
    <>
      <section className="home-hero" aria-labelledby="landing-title">
        <div className="hero-copy">
          <p className="eyebrow">Websites, apps, and business tools</p>
          <h1 id="landing-title">AI gets you started.<br /><span>I get it ready for business.</span></h1>
          <p className="intro">I’m Daric Teske. I build software you can count on today and easily update as you grow.</p>
          <div className="hero-actions">
            <a className="home-button" href="#inquiry">Tell me what you need <span aria-hidden="true">↗</span></a>
            <a className="hero-secondary" href="#services">Explore services</a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-browser">
            <div className="art-toolbar"><i /><i /><i /></div>
            <div className="art-content">
              <div className="art-page">
                <i /><i /><i />
                <span />
              </div>
              <div className="art-grid"><i /><i /><i /></div>
            </div>
          </div>
          <div className="art-phone">
            <div className="art-phone-screen"><i /><i /><i /><span /></div>
          </div>
        </div>
      </section>
      <section className="home-services" id="services" aria-labelledby="services-title">
        <h2 id="services-title">What we can build together</h2>
        <div className="service-grid">
          {services.map(service => (
            <article className="service" key={service.name}>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <p className="service-examples">{service.examples}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export function InquiryIntro() {
  return (
    <div className="inquiry-intro">
      <h2>Let’s start with a conversation.</h2>
      <p>Already built something with AI? Show me what you have. Starting from an idea? A few sentences are plenty.</p>
      <p>I’ll follow up by email. If it sounds like a fit, we’ll talk through what you need, what it might cost, and where to start.</p>
    </div>
  )
}
