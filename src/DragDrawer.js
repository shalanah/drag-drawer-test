import React, { useState, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import styled from 'styled-components'

const NAV_PERCENT = 0.8
const Container = styled(animated.div)`
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
  bottom: 0px;
`

const clamp = (num, min, max) => Math.max(Math.min(max, num), min)
const dragClassName = 'drag-drawer-container'
const draggingOnHandle = (element) => {
  let dragElems = document.getElementsByClassName(dragClassName)
  let isDragging = false
  const len = dragElems.length
  for (let i = 0; i < len; i++) {
    let dragElem = dragElems[i]
    isDragging = dragElem === element || dragElem.contains(element)
    dragElem = null // release to be overly cautious
    if (isDragging) break
  }
  dragElems = null // release to be overly cautious
  return isDragging
}

const handleDrag = ({
  refContainer,
  openHeight,
  closedHeight,
  set,
  windowHeight,
  setOpen,
  open,
  config,
  y0,
  // args
  event,
  vxvy: [vx, vy],
  movement: [mx, my],
  cancel,
  first,
  last,
  refScrollContainer
}) => {
  if (
    refScrollContainer?.current &&
    refScrollContainer?.current.scrollTop !== 0
  ) {
    // Do not go up or down if scroll area isn't at top
    cancel()
  }
  if (event.persist) {
    event.persist()
    if (event.target && !draggingOnHandle(event.target)) {
      cancel()
    }
  }
  if (first)
    y0.current = Number(
      refContainer.current.style.transform.split('(')[1].split('px')[0]
    )
  const openY = 0
  const closeY = openHeight - closedHeight
  const min = openY
  const max = openHeight - 20 // don't want to go below screen
  let immediate = true
  let y = clamp(my + y0.current, min, max)
  let velocity = 0
  // Snapping to open or closed
  if (last) {
    immediate = false // will animate
    velocity = vy
    const threshold = clamp(windowHeight * 0.1, 5, 300)
    if (open) {
      if (y > openY + threshold) {
        setOpen(false)
        y = closeY
      } else {
        y = openY
      }
    } else {
      if (y < closeY - threshold) {
        setOpen(true)
        y = openY
      } else y = closeY
    }
  }
  set({
    y,
    config: {
      ...config,
      velocity,
      clamp: y < closeY
    },
    immediate
  })
}

const DragDrawer = ({
  content,
  closedHeight,
  onChange,
  dragElem,
  footer,
  style = {},
  ...props
}) => {
  const [open, setOpen] = useState(false)
  const refContainer = useRef()
  const refScrollContainer = useRef()
  const windowHeight = window.innerHeight
  const openHeight = windowHeight * NAV_PERCENT

  const config = {
    mass: 1,
    tension: 400,
    friction: 35 /* since we are mostly clamping, want to close pretty quickly */
  }
  const [animProps, set] = useSpring(() => ({
    y: openHeight - closedHeight,
    immediate: true,
    config
  }))

  const y0 = useRef()
  const dragEvents = useDrag((useDragArgs) =>
    handleDrag({
      ...useDragArgs,
      refContainer,
      openHeight,
      closedHeight,
      set,
      windowHeight,
      setOpen,
      y0,
      open,
      config,
      refScrollContainer
    })
  )

  return (
    <Container
      ref={refContainer}
      style={{
        height: openHeight,
        transform: animProps.y.to((y) => `translateY(${y}px)`),
        ...style
      }}
      {...dragEvents()}
      {...props}
    >
      <div className={dragClassName}>{dragElem}</div>
      <div
        ref={refScrollContainer}
        className={dragClassName}
        style={{ overflowY: 'scroll', flex: 1 }}
        onPointerMove={(e) => {
          e.preventDefault() // try to stop safari bounce
        }}
      >
        {content}
      </div>
      {footer && <div>{footer}</div>}
    </Container>
  )
}

export default DragDrawer
