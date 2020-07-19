import React from 'react'

export default class Image extends React.Component {

    constructor(props) {
      super(props);
      this.state = {}
    }

    toggleMarkerOn() {
      console.log("enter")
      this.props.toggleMarkerOn(this.props.coords)
    }

    toggleMarkerOff() {
      console.log("LEAVE")
      this.props.toggleMarkerOff(this.props.coords)
    }

    toggleLargePhoto() {
      this.props.toggleLargePhoto(this.props.url)
    }  

    render() {
        return (
          <img 
          src={this.props.url}
          onMouseEnter={ () => this.toggleMarkerOn() }
          onMouseLeave={ () => this.toggleMarkerOff() }
          onClick={() => this.toggleLargePhoto()}
          />
        )
      }
}