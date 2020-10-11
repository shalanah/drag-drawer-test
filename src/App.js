import React from 'react'
import styled from 'styled-components'
import DragDrawer from './DragDrawer'

const MainContainer = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
`

const App = () => {
  return (
    <MainContainer>
      <span>here</span>
      <DragDrawer
        style={{ background: '#ccc', zIndex: 100 }}
        closedHeight={110}
        dragElem={<div style={{ padding: '20px', height: 110 }}>Pull here</div>}
        content={
          <div
            style={{
              padding: '0px 20px',
              height: '200vh',
              background:
                'linear-gradient(#ccc, red, orange, yellow, green, cyan, blue, violet, black)'
            }}
          >
            content
          </div>
        }
        footer={<div style={{ height: 60, background: 'blue' }} />}
      />
    </MainContainer>
  )
}

export default App
