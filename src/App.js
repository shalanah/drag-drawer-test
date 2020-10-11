import React from 'react'
import styled from 'styled-components'
import DragDrawer from './DragDrawer'

const MainContainer = styled.div`
  height: 100%;
  overflow: hidden;
  background: #efefef;
  padding: 20px;
`

const App = () => {
  return (
    <MainContainer>
      <span>App content</span>
      <DragDrawer
        style={{ background: '#fff', zIndex: 100 }}
        closedHeight={110}
        dragElem={<div style={{ padding: '20px', height: 110 }}>Pull here</div>}
        content={
          <div
            style={{
              padding: '0px 20px',
              height: '200vh',
              background:
                'linear-gradient(#fff, red, orange, yellow, green, cyan, blue)'
            }}
          >
            Scrollable content
          </div>
        }
        footer={
          <div style={{ height: 60, padding: '20px' }}>Footer buttons</div>
        }
      />
    </MainContainer>
  )
}

export default App
