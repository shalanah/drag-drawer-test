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
  const len = dragElems.length
  for (let i = 0; i < len; i++) {
    let dragElem = dragElems[i]
    if (dragElem === element || dragElem.contains(element)) {
      // release elements from memory for good measure (possibly not needed)
      dragElems = null
      dragElem = null
      return true // is the drag element or a child of the drag element
    }
    dragElem = null
  }
  // release elements from memory for good measure (possibly not needed)
  dragElems = null
  return false
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
  const windowHeight = window.innerHeight
  const openHeight = windowHeight * NAV_PERCENT

  const config = { mass: 1, tension: 130, friction: 24 }
  const [animProps, set] = useSpring(() => ({
    y: openHeight - closedHeight,
    immediate: true,
    config
  }))

  const y0 = useRef()
  const dragEvents = useDrag(
    ({ first, last, movement: [mx, my], cancel, event, vxvy: [vx, vy] }) => {
      // Could check if you really only want to drag on drag elem
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
          clamp: true //y > closeY
        },
        immediate
      })
    }
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
      <div style={{ overflowY: 'scroll', flex: 1 }}>{content}</div>
      {footer && <div>{footer}</div>}
    </Container>
  )
}

export default DragDrawer
