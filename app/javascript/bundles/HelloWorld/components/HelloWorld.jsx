import PropTypes from 'prop-types';
import React from 'react';
import mapboxgl from 'mapbox-gl';
import polyline from '@mapbox/polyline';

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
    this.state = { name: this.props.name, 
      activities: this.props.activities, 
      startdate: this.props.activities[activities_count-1].start_date,
      enddate: this.props.activities[0].start_date
    };
  }

  componentDidMount() {
    console.log(this.state.startdate)

    var activities = this.state.activities; //full user activities from rails controller via view
    var activities_count = activities.length; // number of activities
    var selected_activity_coords = []; // array of all activity coordinates
    var selected_activities = []; //array of all activity coordinates in individual arrays
      for (var i = 0; i < activities_count-1; i++) {
        var activity_coordinates = polyline.toGeoJSON(activities[i].polymap).coordinates; //gets activity coords
        selected_activity_coords = selected_activity_coords.concat(activity_coordinates); //appends for zoom
        selected_activities.push(activity_coordinates); //appends for display
      };
    
    //creates map  
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.50, 40],
      zoom: 9
    });

    map.on('load', function() {

      //zoom to activities
      var coordinates = selected_activity_coords;
      var bounds = coordinates.reduce(function(bounds, coord) {
        return bounds.extend(coord);
      }, 
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      map.fitBounds(bounds, {
      padding: 20
      });

      //add activity data to map
      map.addSource('test', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'MultiLineString',
            'coordinates': selected_activities
          }
        }
      });
      
      //add activity display to map
      map.addLayer({
        'id': 'test',
        'type': 'line',
        'source': 'test',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#888',
          'line-width': 8
        }
      });
    });
  }

  updateStartdate = (startdate) => {
    this.setState({ startdate });
  };
  updateEnddate = (enddate) => {
    this.setState({ enddate });
  };

  render() {
    return (
      <>
      <div ref={el => this.mapContainer = el} className='mapContainer' />

      <div className="navbar">
        <div> {/* date inputs */}
          <h3>
            Start Date: {new Date(this.state.startdate).toLocaleDateString("en-US")}
          </h3>
          <form >
            <label htmlFor="name">
              Chose a Start Date for the Activity Map
            </label>
            <input
              id="startdate"
              type="date"
              value={this.state.startdate}
              onChange={(e) => this.updateStartdate(e.target.value)}
            />
          </form>
          <hr />
          <h3>
            End Date: {new Date(this.state.enddate).toLocaleDateString("en-US")}
          </h3>
          <form >
            <label htmlFor="name">
            Chose a End Date for the Activity Map
            </label>
            <input
              id="enddate"
              type="date"
              value={this.state.enddate}
              onChange={(e) => this.updateEnddate(e.target.value)}
            />
          </form>
        </div>

      </div>
      </>
    )
  }
}
