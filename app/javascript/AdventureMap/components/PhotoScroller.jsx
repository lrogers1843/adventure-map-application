import React from 'react';
import Image from './Image.jsx';
export default class PhotoScroller extends React.Component {

  constructor(props) {
    super(props);
    this.state = {}
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.data != this.props.data && !this.props.data) {
      this.setState({data: null})
    }

    if(prevProps.time_coords != this.props.time_coords && this.props.data) {
      this.setLocation()
    }
  }

  setLocation() {
    console.log("getting location")
    console.log(this.state)
    // var start = new Date(this.props.activity_start)
    // console.log(start)
    // var data = this.props.data.map( (d) => [d[0], this.getCoordFromTime(d[1])] )
    var data = this.props.data
    data.forEach( (d) => d.setCoordinates(this.getCoordFromTime(d.timestamp)))
    // console.log(data)
    this.setState({data})
  }

  getCoordFromTime(photo_time) {
    console.log("getting coord")
    var start = new Date(this.props.activity_start)
    var elapsed_time = (new Date(photo_time)-start)/1000
    var times = this.props.time_coords[0]
    var coords = this.props.time_coords[1]
    // console.log(elapsed_time)
    var activity_time = this.closestTime(elapsed_time, times)
    var i = times.indexOf(activity_time)
    // console.log(i)
    var coord = coords[i]
    // console.log(coord)
    return coord
  }

  closestTime (needle, haystack) {
    // console.log(needle)
    // console.log(haystack)
    return haystack.reduce((a, b) => {
        let aDiff = Math.abs(a - needle);
        let bDiff = Math.abs(b - needle);

        if (aDiff == bDiff) {
            return a > b ? a : b;
        } else {
            return bDiff < aDiff ? b : a;
        }
    });
}

    render() {
        if (this.props.display_props) {
          var keys = Object.keys(this.props.display_props)
          return <div 
          className="photo_scroller flex flex-col items-center text-sm text-black font-semibold h-full theme-background"
          >
            <div className="text-left">
              {keys.map( (k) => <p> {k + ": " + this.props.display_props[k]}</p>)}
            </div>
            <button className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow m-2" onClick={this.props.zoomIn}>Zoom To Activity</button>
            <div className="overflow-auto">
            {this.state.data && this.state.data.map( (d) => 
            <Image
              url={d.url} 
              coords={d.coords}
              toggleMarkerOn={this.props.toggleMarkerOn}
              toggleMarkerOff={this.props.toggleMarkerOff}
              toggleLargePhoto={this.props.toggleLargePhoto}      
            />
            )}
            </div> 
          </div>
        }
        return null;
    }
  }