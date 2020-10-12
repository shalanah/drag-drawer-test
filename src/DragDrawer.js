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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #ccc;
  transition: 0.05s;
  :after {
    position: absolute;
    content: '';
    width: 100px;
    height: 8px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background: #fff;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`

const handleDrag = ({
  args: [
    { refScrollContainer, refContainer, openY, closeY, set, setOpen, open }
  ],
  memo,
  vxvy: [vx, vy],
  movement: [mx, my],
  cancel,
  last
}) => {
  if (
    refScrollContainer?.current &&
    refScrollContainer?.current.scrollTop > 0
  ) {
    // Do not go up or down if scroll area isn't at top
    cancel()
  }
  if (!memo) {
    // Get current Y translation
    memo = Number(
      refContainer.current.style.transform.split('(')[1].split('px')[0]
    )
  }
  let immediate = true // will not animate (follows finger)
  let y = clamp(my + memo, openY, closeY)
  let velocity = 0 // default
  let onRest

  // Snapping to open or closed
  if (last) {
    immediate = false // will animate
    velocity = vy
    const threshold = clamp(window.innerHeight * 0.1, 5, 300) // do we really need window height?
    if (open) {
      if (y > openY + threshold) {
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
  set({
    y,
    config: {
      ...config,
      velocity
    },
    immediate,
    onRest
  })
  return memo // start position for memo
}

const DragDrawer = ({
  content,
  openHeight,
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
      onClick={() => {
        if (!open) {
          set({
            y: openY,
            config,
            immediate: false,
            onRest: () => {
              setOpen(true)
            }
          })
        }
      }}
      ref={refContainer}
      style={{
        height: openHeight,
        transform: animProps.y.to((y) => `translateY(${y}px)`),
        ...style
      }}
      {...props}
    >
      <div
        {...dragEvents({
          refContainer,
          openY,
          closeY,
          set,
          setOpen,
          open,
          refScrollContainer
        })}
        ref={refScrollContainer}
        style={{
          scrollBehavior: 'smooth', // for when we need to force back to the top
          overflowY: 'scroll',
          flex: 1
        }}
      >
        <Handle
          style={{ opacity: open ? 0 : 1, pointerEvents: open ? 'none' : '' }}
        />
        {content}
      </div>
      {footer && <div>{footer}</div>}
    </Container>
  )
}

export default DragDrawer
