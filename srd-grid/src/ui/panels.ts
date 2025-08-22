export function initUIPanels(root: HTMLElement) {
  // Placeholder for future UI panels
  const log = document.createElement('div')
  log.id = 'combat-log'
  log.style.position = 'absolute'
  log.style.bottom = '8px'
  log.style.left = '8px'
  log.style.padding = '6px 8px'
  log.style.background = 'rgba(0,0,0,0.4)'
  log.style.color = '#ddd'
  log.style.maxHeight = '45%'
  log.style.overflowY = 'auto'
  log.textContent = 'SRD Grid ready.'
  root.appendChild(log)

  const hud = document.createElement('div')
  hud.id = 'action-hud'
  hud.style.position = 'absolute'
  hud.style.top = '8px'
  hud.style.right = '8px'
  hud.style.padding = '6px 8px'
  hud.style.background = 'rgba(0,0,0,0.4)'
  hud.style.color = '#ddd'
  hud.textContent = 'Actions: —'
  root.appendChild(hud)

  // Optional: small hint area for extra toggles
  const hint = document.createElement('div')
  hint.id = 'hint-hud'
  hint.style.position = 'absolute'
  hint.style.top = '40px'
  hint.style.right = '8px'
  hint.style.padding = '4px 6px'
  hint.style.background = 'rgba(0,0,0,0.3)'
  hint.style.color = '#bbb'
  hint.style.fontSize = '12px'
  hint.textContent = ''
  root.appendChild(hint)
}

export function appendLogLine(text: string) {
  const el = document.getElementById('combat-log')
  if (!el) return
  const line = document.createElement('div')
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  line.textContent = `[${hh}:${mm}:${ss}] ${text}`
  el.appendChild(line)
  el.scrollTop = el.scrollHeight
}

export function updateActionHUD(text: string) {
  const hud = document.getElementById('action-hud')
  if (hud) hud.textContent = text
}
