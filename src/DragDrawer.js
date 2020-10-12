import React, { useState, useRef, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import styled from 'styled-components'

const Container = styled(animated.div)`
  position: fixed;
  width: 100%;
  display: flex;
  flex-direction: column;
  bottom: 0px;
  left: 0;
`
const clamp = (num, min, max) => Math.max(Math.min(max, num), min)
const config = {
  mass: 1,
  tension: 400,
  clamp: true,
  friction: 35 /* since we are mostly clamping, want to close pretty quickly */
}
const Handle = styled.div`
  width: 24px;
  height: 3px;
  background: #e7e8e9;
  border-radius: 3px;
`

const handleDrag = ({
  args: [
    {
      refScrollContainer,
      refContainer,
      openY,
      closeY,
      set,
      setOpen,
      open,
      refClickContainer
    }
  ],
  memo,
  vxvy: [vx, vy],
  movement: [mx, my],
  cancel,
  last,
  event
}) => {
  if (
    refScrollContainer?.current &&
    refScrollContainer?.current.scrollTop > 20
  ) {
    // Do not go up or down if scroll area isn't at top
    if (event.persist) event.persist() // allow to access event later however
    cancel()
  }
  if (!memo) {
    // Get current Y translation
    memo = {
      y0: Number(refContainer.current.style.transform.match(/[\d|.]+/i))
    } // get number in transform y
  }
  memo.dragged = memo.dragged || my !== 0
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

const DragDrawer = ({
  content,
  clickContent,
  openHeight,
  closedHeight,
  onChange,
  footer,
  topContent,
  style = {},
  ...props
}) => {
  const [open, setOpen] = useState(false)
  const refContainer = useRef()
  const refClickContainer = useRef()
  const refScrollContainer = useRef()
  const isDragging = useRef(false)
  const openY = 0
  const closeY = openHeight - closedHeight
  // Default behavior
  const [animProps, set] = useSpring(() => ({
    y: openHeight - closedHeight,
    immediate: true, // no animation, just following finger
    config
  }))
  const dragEvents = useDrag(handleDrag)

  // Click outside when open will close drawer
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
  }, [open, refContainer, refScrollContainer, closeY, set])
  return (
    <Container
      ref={refContainer}
      style={{
        height: openHeight,
        transform: animProps.y.to((y) => `translateY(${y}px)`),
        ...style
      }}
      {...props}
    >
      <div
        {...dragEvents(
          {
            refContainer,
            openY,
            closeY,
            set,
            setOpen,
            open,
            refScrollContainer,
            refClickContainer
          },
          { delay: true }
        )}
        ref={refScrollContainer}
        style={{
          overflowY: 'scroll',
          flex: 1
        }}
      >
        <div style={{ display: 'flex' }}>
          <Handle style={{ margin: '5px auto' }} />
        </div>
        <div ref={refClickContainer}>{clickContent}</div>
        {content}
      </div>
      {footer && <div>{footer}</div>}
    </Container>
  )
}

export default DragDrawer
