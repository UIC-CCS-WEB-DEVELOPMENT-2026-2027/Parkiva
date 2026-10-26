export function trapDialogFocus(event) {
  if (event.key !== 'Tab') return
  const controls = [
    ...event.currentTarget.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]',
    ),
  ].filter((node) => node.getClientRects().length)
  if (!controls.length) {
    event.preventDefault()
    return
  }
  if (event.shiftKey && document.activeElement === controls[0]) {
    event.preventDefault()
    controls.at(-1).focus()
  } else if (!event.shiftKey && document.activeElement === controls.at(-1)) {
    event.preventDefault()
    controls[0].focus()
  }
}
