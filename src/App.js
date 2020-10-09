import React from 'react'
import styled from 'styled-components'
import DragDrawer from './DragDrawer'

const MainContainer = styled.div`
  position: relative;
  height: 100vh;
  overflow: hidden;
`

const App = () => {
  return (
    <MainContainer>
      <span>here</span>
      <DragDrawer overflowHeight={200}>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            bottom: 0,
            top: 0,
            background: '#ccc',
            overflow: 'hidden'
          }}
        >
          <div data-pull style={{ padding: '20px' }}>
            Pull here
          </div>
          <div
            style={{
              height: '100%',
              padding: '20px',
              overflow: 'auto',
              background: '#ccc'
            }}
          >
            <div
              style={{
                height: '200vh',
                background:
                  'linear-gradient(#ccc, red, orange, yellow, green, cyan, blue, violet, black)'
              }}
            >
              content
            </div>
          </div>
        </div>
      </DragDrawer>
    </MainContainer>
  )
}

export default App
