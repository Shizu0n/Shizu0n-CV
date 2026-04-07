import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useContactForm } from '../hooks/useContactForm'

const CONTACT_EMAIL = 'paulosvtatibana@gmail.com'
const LINKEDIN_URL = 'https://www.linkedin.com/in/paulo-shizuo/'
const GITHUB_URL = 'https://github.com/Shizu0n'

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function ContactSection() {
  const {
    formRef,
    formData,
    sendStatus,
    errorMessage,
    handleInputChange,
    handleSubmit,
  } = useContactForm()

  const [emailCopied, setEmailCopied] = useState(false)

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setEmailCopied(true)
      window.setTimeout(() => setEmailCopied(false), 1600)
    } catch {
      window.location.href = `mailto:${CONTACT_EMAIL}`
    }
  }

  const statusMessage =
    sendStatus === 'success'
      ? 'Message sent. I will get back to you soon.'
      : sendStatus === 'sending'
        ? 'Sending your message...'
        : errorMessage

  return (
    <section id="contact" className="contact-section">
      <div className="contact-shell">
        <motion.div
          className="contact-copy"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={itemVariants}
        >
          <p className="section-kicker">Act 05 / Contact</p>
          <h2 className="section-title">
            If the brief needs clarity, polish, and working code, let&apos;s talk.
          </h2>
          <p className="section-body">
            Available for internships, freelance collaborations, and product-minded builds that need both design restraint and implementation depth.
          </p>

          <div className="contact-links">
            <button
              type="button"
              className="contact-link-button"
              onClick={handleEmailClick}
            >
              {emailCopied ? 'Email copied' : CONTACT_EMAIL}
            </button>

            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              LinkedIn &rarr;
            </a>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              GitHub &rarr;
            </a>
          </div>
        </motion.div>

        <motion.div
          className="contact-form-panel"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          <form ref={formRef} className="contact-form" noValidate onSubmit={handleSubmit}>
            <label className="contact-field" htmlFor="contact-name">
              <span className="contact-field-label">Name</span>
              <input
                id="contact-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                autoComplete="name"
                className="contact-input"
                required
              />
            </label>

            <label className="contact-field" htmlFor="contact-email">
              <span className="contact-field-label">Email</span>
              <input
                id="contact-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                autoComplete="email"
                className="contact-input"
                spellCheck={false}
                required
              />
            </label>

            <label className="contact-field" htmlFor="contact-subject">
              <span className="contact-field-label">Subject</span>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Project, internship, or collaboration"
                autoComplete="off"
                className="contact-input"
              />
            </label>

            <label className="contact-field" htmlFor="contact-message">
              <span className="contact-field-label">Message</span>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell me about the brief and what you need help building."
                className="contact-input contact-textarea"
                rows={5}
                autoComplete="off"
                required
              />
            </label>

            <button
              type="submit"
              className="contact-submit-btn"
              disabled={sendStatus === 'sending'}
            >
              {sendStatus === 'sending' ? 'Sending...' : 'Send message'}
            </button>

            {statusMessage ? (
              <p
                className={`contact-status ${sendStatus === 'error' ? 'is-error' : ''}`}
                aria-live="polite"
              >
                {statusMessage}
              </p>
            ) : null}
          </form>
        </motion.div>
      </div>
    </section>
  )
}
