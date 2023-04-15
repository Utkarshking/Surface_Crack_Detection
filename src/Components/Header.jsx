import React from 'react'
import "../App.css"
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
function Header() {
  return (
    <div>
        <Navbar bg="primary" expand="lg">
        <Container>
          <Navbar.Brand href="#home" className="textcolor">Surface Crack Detection</Navbar.Brand>
        </Container>
      </Navbar>
    </div>
  )
}

export default Header