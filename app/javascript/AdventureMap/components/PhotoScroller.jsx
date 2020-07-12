import React from 'react';

export default class PhotoScroller extends React.Component {

  constructor(props) {
    super(props);
    this.state = {}
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.data != this.props.data) {
      if (!this.props.data) {
        this.setState({data: null})
      }
    }

    if(prevProps.time_coords != this.props.time_coords) {
      this.setLocation()
    }
  }

  setLocation() {
    console.log("getting location")
    console.log(this.state)
    var start = new Date(this.props.activity_start)
    console.log(start)
    var data = this.props.data.map( (d) => [d[0], this.getCoordFromTime(d[1])] )
    console.log(data[0])
    this.setState({data})
  }

  getCoordFromTime(photo_time) {
    console.log("getting coord")
    var start = new Date(this.props.activity_start)
    var elapsed_time = (new Date(photo_time)-start)/1000
    var times = this.props.time_coords[0]
    var coords = this.props.time_coords[1]
    console.log(elapsed_time)
    var activity_time = this.closestTime(elapsed_time, times)
    var i = times.indexOf(activity_time)
    console.log(i)
    var coord = coords[i]
    console.log(coord)
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

popup() {
  console.log("pop")
}

    render() {
        if (this.props.display_props) {
          var keys = Object.keys(this.props.display_props)
          return <div 
          className="photo_scroller flex flex-col items-center overflow-y-auto text-sm text-black font-semibold">
          {keys.map( (k) => <p> {k + ": " + this.props.display_props[k]}</p>)}
          {this.state.data && this.state.data.map( (data) => <img src={data[0]} lat={data[1][0].toString()} long={data[1][1].toString()} onClick={e => this.popup(e)}/>)} 
          </div>
        }
        return null;
    }
  }