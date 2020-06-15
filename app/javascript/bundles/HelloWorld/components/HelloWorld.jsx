import PropTypes from 'prop-types';
import React from 'react';
import mapboxgl from 'mapbox-gl';
import polyline from '@mapbox/polyline';
import Flatpickr from "react-flatpickr";
import 'flatpickr/dist/themes/dark.css';
mapboxgl.accessToken = 'pk.eyJ1IjoibHJvZ2VyczE4NDMiLCJhIjoiY2thZ3Fnejk2MGI3dzJwbWo0eXE1dHF6MyJ9.oYfkk7ZeGShmfugXoZ6Wkg';


export default class HelloWorld extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired, // this is passed from the Rails view
  };

  /**
   * @param props - Comes from your rails view.
   */
  constructor(props) {
    super(props);

    // How to set initial state in ES6 class syntax
    // https://reactjs.org/docs/state-and-lifecycle.html#adding-local-state-to-a-class
  
    this.state = { 
      start_date: this.props.start_date,
      end_date: this.props.end_date,
      activities: this.props.activities,
      geojson: this.props.geojson,
      types: this.props.types,
      zoom_coords: this.props.zoom_coords,
      activity_type: "",
    };
    console.log(this.props)
    console.log("constructor end")
  }
  
  getActivities(filters) {
    var data = (({ start_date, end_date, activity_type }) => ({ start_date, end_date, activity_type }))(filters);
    var that = this
    console.log("getting activities")
    console.log(data)

    fetch("/activities/filter", {
      method: 'POST',
      headers:  {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(function(json) {
      that.setState({
        activities: json[0],
        geojson: json[1], 
        types: json[2],
        zoom_coords: json[3],
      });
      console.log("fetch end")
      console.log(json);
    });
  }

  activityFilterAndParseForMap() {
    var count = this.props.activities.length;
    var activities = this.props.activities;
    var zooms = [];
    var selected_activities = [];
    var start_date = this.state.start_date
    var end_date = this.state.end_date
    for (var i = 0; i < count-1; i++) {
      var activity_date = new Date(activities[i].start_date)
      if (activity_date >= start_date && activity_date <= end_date) {
        var activity_coordinates = polyline.toGeoJSON(activities[i].polymap).coordinates; //gets activity coords
        zooms = zooms.concat(activity_coordinates); //appends for zooms
        selected_activities.push(activity_coordinates); //appends for display
      };
    };
    this.setState({zoom_coords: zooms, selected_activities: selected_activities});
  }

  newMap(){ 
    console.log("newmap")
  return (
    new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-80.5, 35],
      zoom: 9
    })
    )
  }
  
  zoomIn(map, coords) {
    console.log("zoom")

    var coordinates = coords;
    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, 
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.fitBounds(bounds, {
    padding: 50
    });
  }

  addActivities(map, datasrc) {
    console.log("addsrc")

    map.addSource('activities', datasrc);
  }

  displayActivities(map) {
    console.log("display")

    map.addLayer({
      'id': 'activities',
      'type': 'line',
      'source': 'activities',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#3386c0',
        'line-width': 5
      }
    });
  }

  updateStartdate = (start_date) => {
    this.setState({ start_date });
  };
  
  updateEnddate = (end_date) => {
    this.setState({ end_date });
  };

  componentDidMount() {
    console.log("did mount")
    //creates map and stores a reference in state
    const map = this.newMap()
    this.setState({ map });

    map.on('load', () => {
      
      // zoom to activities
      this.zoomIn(map, this.state.zoom_coords)

      //provide data to map
      this.addActivities(map, this.state.geojson)
      
      //display data on map
      this.displayActivities(map)

    });
  }

  // componentDidUpdate() {
  //   this.updateMap()
  // }

  updateMap() {
    console.log("update map")
    this.getActivities(this.state)
          
    // zoom to activities
    this.zoomIn(this.state.map, this.state.zoom_coords)

    //remove old activities
    this.state.map.removeLayer('activities');
    this.state.map.removeSource('activities');
    
    
    //update display
    this.addActivities(this.state.map, this.state.geojson)
    this.displayActivities(this.state.map)
      
  }

  render() {
    console.log("render")
    if (this.state.map) {
    this.updateMap()
    }
    return (
      <>
      <div ref={el => this.mapContainer = el} className='mapContainer' />

      <div className="navbar">
        <div> {/* date inputs */}
          <form >
            <h3>Start Date</h3>
            <Flatpickr
            value={this.state.start_date}
              options={{
                dateFormat:"n/j/Y",
              }}
              onChange={(e) => {
                this.updateStartdate(e[0])
                console.log(this.state)
              }}
            />
            <h3>End Date</h3>
            <Flatpickr
            value={this.state.end_date} 
              options={{
                dateFormat:"n/j/Y",
              }}
              onChange={(e) => {
                this.updateEnddate(e[0])
                this.updateMap()
              }}
            />
            <h3>Activity Type</h3>
            <div>
              <select 
              value={this.state.activity_type}
              onChange={(e) => this.setState({activity_type: e.target.value})}
              >
                {this.state.types.map((type) => <option key={type.value} value={type.value}>{type.display}</option>)}
              </select>
            </div>
            <button onClick={() => console.log(this.state.types)}>act</button>
          </form>
        </div>

      </div>
      </>
    )
  }
}
