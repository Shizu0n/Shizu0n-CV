import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import type { FormData } from '../types'

const CONTACT_EMAIL = 'paulosvtatibana@gmail.com'
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'

type SendStatus = 'idle' | 'sending' | 'success' | 'error'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const useContactForm = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target

    setFormData(previous => ({
      ...previous,
      [name]: value,
    }))

    if (sendStatus !== 'idle' || errorMessage) {
      setSendStatus('idle')
      setErrorMessage('')
    }
  }

  const resetStatusLater = (milliseconds: number) => {
    window.setTimeout(() => {
      setSendStatus('idle')
      setErrorMessage('')
    }, milliseconds)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = formData.name.trim()
    const email = formData.email.trim()
    const subject = formData.subject.trim()
    const message = formData.message.trim()

    if (!name || !email || !message) {
      setSendStatus('error')
      setErrorMessage('Add your name, email, and message before sending.')
      resetStatusLater(3500)
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      setSendStatus('error')
      setErrorMessage('Your email looks incomplete. Double-check it and try again.')
      resetStatusLater(3500)
      return
    }

    const isEmailJSConfigured =
      EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' &&
      EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
      EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'

    if (isEmailJSConfigured && formRef.current) {
      setSendStatus('sending')
      setErrorMessage('')

      try {
        await emailjs.sendForm(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          formRef.current,
          EMAILJS_PUBLIC_KEY,
        )

        setSendStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        resetStatusLater(3200)
        return
      } catch {
        setSendStatus('error')
        setErrorMessage('Message failed to send. Try again or use the direct email link.')
        resetStatusLater(5000)
        return
      }
    }

    const finalSubject = subject || 'Contact via portfolio'
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent via portfolio`,
    )
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(finalSubject)}&body=${body}`
    window.location.href = mailto
  }

  return {
    formRef,
    formData,
    sendStatus,
    errorMessage,
    handleInputChange,
    handleSubmit,
  }
}
