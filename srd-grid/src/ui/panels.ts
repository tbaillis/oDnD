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
}

export function appendLogLine(text: string) {
  const el = document.getElementById('combat-log')
  if (!el) return
  const line = document.createElement('div')
  line.textContent = text
  el.appendChild(line)
}

export function updateActionHUD(text: string) {
  const hud = document.getElementById('action-hud')
  if (hud) hud.textContent = text
}
