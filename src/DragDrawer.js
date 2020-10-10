import React, { useState, useRef, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import styled from 'styled-components'

const OPEN_NAV_SIZE = 0.75
const Container = styled(animated.div)`
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
`
const dragClassName = 'drag-drawer-container'
const draggingOnHandle = (element) => {
  const len = document.getElementsByClassName(dragClassName).length
  for (let i = 0; i < len; i++) {
    let pullElement = document.getElementsByClassName(dragClassName)[i]
    if (pullElement === element || pullElement.contains(element)) return true
    pullElement = null // clear out
  }
  return false
}

const DragDrawer = ({
  content,
  overflowHeight,
  onChange,
  dragElem,
  style = {},
  ...props
}) => {
  const [open, setOpen] = useState(false)
  const refContainer = useRef()

  const [styleProps, set] = useSpring(() => ({
    y: 0,
    top: overflowHeight,
    config: {
      mass: 1,
      tension: 350,
      friction: 40
    }
  }))

  useEffect(() => {
    set({ top: overflowHeight })
  }, [overflowHeight, set])

  const windowHeight = window.innerHeight

  const useDragBind = useDrag(({ down, movement, cancel, event }) => {
    if (event.persist) {
      event.persist()
      if (event.target && !draggingOnHandle(event.target)) {
        cancel()
      }
    }
    const { top } = refContainer.current.getBoundingClientRect()
    let setTop = overflowHeight
    let setY = movement[1]
    const percentOverflow = (overflowHeight * 100) / windowHeight
    const percentOpened = ((windowHeight - top) / windowHeight) * 100

    // If not down -> if release pull
    if (!down) {
      // If already open and percent opened is less than the opened percentage + 10
      // Else let open
      if (open) {
        if (percentOpened < OPEN_NAV_SIZE * 100 - 10) {
          setY = 0
          setOpen(false)
          if (onChange) onChange(false)
        } else {
          setY = -OPEN_NAV_SIZE * windowHeight
          setTop = 0
        }
        // If not open and open more than 5% of overflow then open it
        // Else stay closed
      } else if (percentOpened > percentOverflow + 5) {
        setY = -OPEN_NAV_SIZE * windowHeight
        setTop = 0
        setOpen(true)
        if (onChange) onChange(true)
      } else {
        setY = 0
      }
    } else {
      // If is pulling and pull to bottom or top more than 2% then cancel
      // If is pulling and open, set top to opened value
      if (open) {
        setTop = OPEN_NAV_SIZE * windowHeight
      }
      if (percentOpened < 0 || percentOpened > OPEN_NAV_SIZE * 100 + 2) {
        cancel()
      }
    }
    set({
      y: setY,
      top: setTop
    })
  })

  return (
    <Container
      {...props}
      ref={refContainer}
      {...useDragBind()}
      style={{
        height: OPEN_NAV_SIZE * windowHeight,
        transform: styleProps.y.interpolate((y) => `translateY(${y}px)`),
        top: styleProps.top.interpolate((px) => `calc(100% - ${px}px)`),
        ...style
      }}
    >
      <div className={dragClassName}>{dragElem}</div>
      <div style={{ overflowY: 'scroll', flex: 1 }}>{content}</div>
    </Container>
  )
}

export default DragDrawer
