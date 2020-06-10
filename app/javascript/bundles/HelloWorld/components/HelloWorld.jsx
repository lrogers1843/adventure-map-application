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

    var activities_count = this.props.activities.length;
    var activities = this.props.activities;
    var zooms = [];
    var selected_activities = [];
    for (var i = 0; i < activities_count-1; i++) {
      // if (activities[i].startdate >= this.state.startdate && activities[i].enddate >= this.state.enddate) {
        var activity_coordinates = polyline.toGeoJSON(activities[i].polymap).coordinates; //gets activity coords
        zooms = zooms.concat(activity_coordinates); //appends for zooms
        selected_activities.push(activity_coordinates); //appends for display
      // };
    };
    this.state = { 
      startdate: new Date(activities[activities_count-1].start_date),
      enddate: new Date(activities[0].start_date),
      selected_activities: selected_activities, //array of all activity coordinates in individual arrays, for activity display
      zoom_coords: zooms, // array of all activity coordinates, for map zoom
    };
  }
  
  filterWithRails() {
    var startdate = this.state.startdate
    var enddate = this.state.enddate
    var data = { 
      startdate: startdate,
      enddate: enddate 
    };
      
    fetch("/activities/filter", {
      method: 'POST',
      headers:  {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => console.log(result))
  };

  //updates state: zoom_coords and selected_activities
  activityFilterAndParseForMap() {
    var count = this.props.activities.length;
    var activities = this.props.activities;
    var zooms = [];
    var selected_activities = [];
    var startdate = this.state.startdate
    var enddate = this.state.enddate
    for (var i = 0; i < count-1; i++) {
      var activity_date = new Date(activities[i].start_date)
      if (activity_date >= startdate && activity_date <= enddate) {
        var activity_coordinates = polyline.toGeoJSON(activities[i].polymap).coordinates; //gets activity coords
        zooms = zooms.concat(activity_coordinates); //appends for zooms
        selected_activities.push(activity_coordinates); //appends for display
      };
    };
    this.setState({zoom_coords: zooms, selected_activities: selected_activities});
    console.log(this.state.selected_activities)
  }
  newMap(){ 
  return (
    new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-80.5, 35],
      zoom: 9
    })
    )
  }
  
  zoomIn(map) {
    var coordinates = this.state.zoom_coords;
    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, 
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.fitBounds(bounds, {
    padding: 50
    });
  }

  addActivities(map, datasrc) {
    map.addSource('activities', {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'MultiLineString',
          'coordinates': datasrc
        }
      }
    });
  }

  displayActivities(map) {
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

  //create initial map
  componentDidMount() {

    //creates map and stores a reference in state
    const map = this.newMap()
    this.setState({ map });

    map.on('load', () => {
      
      // zoom to activities
      this.zoomIn(map)

      //provide data to map
      this.addActivities(map, this.state.selected_activities)
      
      //display data on map
      this.displayActivities(map)

    });
  }

  updateStartdate = (startdate) => {
    this.setState({ startdate });
  };
  
  updateEnddate = (enddate) => {
    this.setState({ enddate });
  };

  updateMap() {
    this.activityFilterAndParseForMap()
          
    // zoom to activities
    this.zoomIn(this.state.map)

    //remove old activities
    this.state.map.removeLayer('activities');
    this.state.map.removeSource('activities');
    
    
    //update display
    this.addActivities(this.state.map, this.state.selected_activities)
    this.displayActivities(this.state.map)
      
  }

  render() {
    return (
      <>
      <div ref={el => this.mapContainer = el} className='mapContainer' />

      <div className="navbar">
        <div> {/* date inputs */}
          <form >
            <h3>Start Date</h3>
            <Flatpickr
            value={this.state.startdate}
              options={{
                dateFormat:"n/j/Y",
              }}
              onChange={(e) => {
                this.updateStartdate(e[0])
                this.filterWithRails()
                this.updateMap()
              }}
            />
            <h3>End Date</h3>
            <Flatpickr
            value={this.state.enddate} 
              options={{
                dateFormat:"n/j/Y",
              }}
              onChange={(e) => {
                this.updateEnddate(e[0])
                this.updateMap()
              }}
            />
          </form>
        </div>

      </div>
      </>
    )
  }
}
