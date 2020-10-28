import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import DragDrawer from './DragDrawer'

const MainContainer = styled.div`
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
  padding: 20px;
`
const DragDrawerTop = ({ style }) => {
  return (
    <div
      style={{
        padding: '20px',
        background: '#fff',
        ...style
      }}
    >
      Click content
      <input
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
        onTouchStart={(e) => {
          e.stopPropagation()
        }}
        type={'number'}
        min={0}
        max={20}
        step={1}
      />
    </div>
  )
}
const DragDrawerContent = () => {
  return (
    <div
      style={{
        padding: '20px',
        height: '200vh',
        background:
          'linear-gradient(#fff,  red, orange, yellow, green, cyan, blue)'
      }}
    >
      Scrollable content
    </div>
  )
}
const DragDrawerFooter = () => {
  return <div style={{ height: 60, padding: '20px' }}>Footer buttons</div>
}

const App = () => {
  const [winHeight, setWinHeight] = useState(window.innerHeight)
  const [drawerOpen, setMobileDrawer] = useState(false)
  useEffect(() => {
    const handleResize = (e) => {
      setWinHeight(window.innerHeight)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setWinHeight, drawerOpen])
  const closedHeight = 200
  const openHeight = Math.max(winHeight - 200, winHeight * 0.75)
  return (
    <>
      <MainContainer>Main content</MainContainer>
      <DragDrawer
        onChange={(open) => {
          setMobileDrawer(open)
        }}
        style={{ zIndex: 100, background: 'white' }}
        openHeight={openHeight}
        closedHeight={closedHeight}
        footer={<DragDrawerFooter />}
        clickContent={<DragDrawerTop style={{ height: closedHeight }} />} // Top clickable area
        content={<DragDrawerContent />}
      />
    </>
  )
}

export default App
