import React, { useState, useRef, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import styled from 'styled-components'
import { handleDrag, useClickOutsideCloseDrawer } from './utils'
import usePrevious from './usePrevious'

const Container = styled(animated.div)`
  position: fixed;
  width: 100%;
  display: flex;
  flex-direction: column;
  bottom: 0px;
  left: 0;
`
const config = {
  mass: 1,
  tension: 400,
  clamp: true,
  friction: 35 /* since we are mostly clamping, want to close pretty quickly */
}
const Handle = styled.div`
  width: 26px;
  height: 3px;
  background: #ccc;
  border-radius: 3px;
`
const DragDrawer = ({
  content,
  clickContent,
  openHeight,
  closedHeight,
  onChange,
  footer,
  topContent,
  scrollProps: { style: scrollStyle = {}, ...scrollProps } = {},
  style = {},
  ...props
}) => {
  const [open, setOpen] = useState(false)
  const refContainer = useRef()
  const refClickContainer = useRef()
  const refScrollContainer = useRef()
  const openY = 0
  const closeY = openHeight - closedHeight

  // For other comps to know when open or closed
  useEffect(() => {
    if (onChange) onChange(open)
  }, [onChange, open])

  // Default behavior
  const [animProps, set] = useSpring(() => ({
    y: closeY,
    immediate: true, // no animation, just following finger
    config
  }))

  // Reset if passed in heights change
  // - Makes this more elegantly responsive, especially for mobile when text drawer is activated
  const prevOpenHeight = usePrevious(openHeight)
  const prevClosedHeight = usePrevious(closedHeight)
  useEffect(() => {
    if (
      prevOpenHeight !== undefined &&
      prevClosedHeight !== undefined &&
      (openHeight !== prevOpenHeight || closedHeight !== prevClosedHeight)
    ) {
      // Reset position
      set({
        y: open ? openY : closeY,
        immediate: true, // no animation, just following finger
        config
      })
    }
  }, [
    openHeight,
    closedHeight,
    prevOpenHeight,
    prevClosedHeight,
    open,
    openY,
    closeY,
    set
  ])

  const dragEvents = useDrag(handleDrag)
  useClickOutsideCloseDrawer(
    open,
    refContainer,
    refScrollContainer,
    set,
    closeY,
    config,
    setOpen
  )

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
        {...dragEvents({
          config,
          refContainer,
          openY,
          closeY,
          set,
          setOpen,
          open,
          refScrollContainer,
          refClickContainer
        })}
        ref={refScrollContainer}
        {...scrollProps}
        style={{
          overflowY: open ? 'scroll' : 'hidden', // don't want to scroll when closed
          flex: 1,
          ...scrollStyle
        }}
      >
        <div ref={refClickContainer} style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              width: '100%',
              top: 0,
              left: 0
            }}
          >
            <Handle style={{ margin: '5px auto' }} />
          </div>
          {clickContent}
        </div>
        {content}
      </div>
      {footer && <div>{footer}</div>}
    </Container>
  )
}

export default DragDrawer
