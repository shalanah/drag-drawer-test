import { useEffect } from 'react'
const clamp = (num, min, max) => Math.max(Math.min(max, num), min)

export const handleDrag = ({
  args: [
    {
      refScrollContainer,
      refContainer,
      openY,
      closeY,
      set,
      setOpen,
      open,
      refClickContainer,
      config
    }
  ],
  memo,
  vxvy: [vx, vy],
  movement: [mx, my],
  cancel,
  last,
  event
}) => {
  console.log('here')
  if (
    refScrollContainer?.current &&
    refScrollContainer?.current.scrollTop > 10
  ) {
    // Do not go up or down if scroll area isn't at top
    if (event.persist) event.persist() // allow to access event later however
    cancel()
  }

  // Get current Y translation but mostly on start
  if (!memo) {
    memo = {
      y0: Number(refContainer.current.style.transform.match(/[\d|.]+/i))
    }
  }
  memo.dragged = memo.dragged || my !== 0

  if (refScrollContainer.current.scrollTop < 0) {
    // Prevent iOS weird scroll bounce when moving down
    refScrollContainer.current.scrollTop = 0
    refScrollContainer.current.overflowY = 'hidden'
  }

  let immediate = true // will not animate (follows finger)
  let y = clamp(my + memo.y0, openY, closeY)
  let velocity = 0 // default
  let onRest

  // Snapping to open or closed
  if (last) {
    immediate = false // will animate
    velocity = vy
    if (
      !memo.dragged &&
      refClickContainer?.current &&
      event.target &&
      refClickContainer.current.contains(event.target)
    ) {
      // This is a click!!!
      if (open) {
        refScrollContainer.current.scrollTop = 0 // just in case
        onRest = () => setOpen(false)
        y = closeY
      } else {
        onRest = () => setOpen(true)
        y = openY
      }
    } else {
      // Animate back to closed or open
      const threshold = clamp(Math.abs(closeY - openY) * 0.05, 5, 300)
      if (open) {
        if (y > openY + threshold) {
          refScrollContainer.current.scrollTop = 0 // just in case
          onRest = () => setOpen(false)
          y = closeY
        } else {
          y = openY
        }
      } else {
        if (y < closeY - threshold) {
          onRest = () => setOpen(true)
          y = openY
        } else y = closeY
      }
    }
  }
  set({
    y,
    config: {
      ...config,
      velocity
    },
    immediate,
    onRest
  })

  return memo // Data we want to hold onto
}

// Close when we click outside of drawer
export const useClickOutsideCloseDrawer = (
  open,
  refContainer,
  refScrollContainer,
  set,
  closeY,
  config,
  setOpen
) => {
  useEffect(() => {
    const closeDrawer = (e) => {
      if (open && refContainer && !refContainer.current.contains(e.target)) {
        if (refScrollContainer?.current) {
          refScrollContainer.current.scrollTop = 0
        }
        set({
          y: closeY,
          config,
          immediate: false,
          onRest: () => {
            setOpen(false)
          }
        })
      }
    }
    window.addEventListener('click', closeDrawer)
    return () => {
      window.removeEventListener('click', closeDrawer)
    }
  }, [open, refContainer, refScrollContainer, closeY, set, config, setOpen])
}
