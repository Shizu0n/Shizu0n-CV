// Which project case is open, for the chat bot: it then offers questions about that project.
export const BOT_CONTEXT_EVENT = 'bot:context'

let openCase: string | null = null

export const getOpenCase = () => openCase

export function setOpenCase(id: string | null) {
  openCase = id
  dispatchEvent(new CustomEvent(BOT_CONTEXT_EVENT, { detail: id }))
}
