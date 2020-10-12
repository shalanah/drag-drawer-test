import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import DragDrawer from './DragDrawer'

const MainContainer = styled.div`
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
  padding: 20px;
`
const closedHeight = 120
const DragDrawerTop = () => {
  return (
    <div
      style={{
        padding: '20px',
        height: closedHeight,
        background: '#fff'
      }}
    >
      Click content
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
  useEffect(() => {
    const handleResize = () => {
      setWinHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setWinHeight])
  return (
    <>
      <MainContainer>
        <span>App content</span>
      </MainContainer>
      <DragDrawer
        style={{ background: '#fff', zIndex: 100 }}
        openHeight={winHeight - 200}
        closedHeight={closedHeight}
        clickContent={<DragDrawerTop />} // Top clickable area
        content={<DragDrawerContent />}
        footer={<DragDrawerFooter />}
      />
    </>
  )
}

export default App
