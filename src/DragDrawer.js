import React, { useState, useRef, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import styled from 'styled-components'

const NAV_PERCENT = 0.75
const Container = styled(animated.div)`
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
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
  overflowHeight,
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

  const [styleProps, set] = useSpring(() => ({
    y: 0,
    config: {
      mass: 1,
      tension: 350,
      friction: 40
    }
  }))
  useEffect(() => {
    set({ top: overflowHeight })
  }, [overflowHeight, set])

  const y0 = useRef()
  const useDragBind = useDrag(
    ({ first, last, movement: [mx, my], cancel, event }) => {
      // Could check if you really only want to drag on drag elem
      // if (event.persist) {
      //   event.persist()
      //   if (event.target && !draggingOnHandle(event.target)) {
      //     cancel()
      //   }
      // }
      if (first)
        y0.current = Number(
          refContainer.current.style.transform.split('(')[1].split('px')[0]
        )
      const openY = -(openHeight - overflowHeight)
      const closeY = 0
      const max = overflowHeight - 10 // near bottom of screen
      const min = openY - 10
      let y = clamp(my + y0.current, min, max)
      if (last) {
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
      set({ y })
    }
  )

  return (
    <Container
      {...props}
      ref={refContainer}
      {...useDragBind()}
      style={{
        top: windowHeight - overflowHeight,
        height: openHeight,
        transform: styleProps.y.to((y) => `translateY(${y}px)`),
        ...style
      }}
    >
      <div className={dragClassName}>{dragElem}</div>
      <div style={{ overflowY: 'scroll', flex: 1 }}>{content}</div>
      {footer && <div>{footer}</div>}
    </Container>
  )
}

export default DragDrawer
