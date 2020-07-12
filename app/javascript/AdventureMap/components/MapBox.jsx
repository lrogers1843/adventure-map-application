import React from 'react';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoibHJvZ2VyczE4NDMiLCJhIjoiY2thZ3Fnejk2MGI3dzJwbWo0eXE1dHF6MyJ9.oYfkk7ZeGShmfugXoZ6Wkg';

export default class MapBox extends React.Component {
  newMap(){ 
    console.log("newmap")
  return (
    new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/' + this.props.map_style,
      center: [-80.5, 35],
      zoom: 9
    })
    )
  }

  zoomIn = (e) => {
    var coordinates = this.props.zoom_coords;
    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, 
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    console.log("new")
    this.state.map.fitBounds(bounds, {
      padding: 50
    });
    console.log("zoom done")
  }

  addActivities() {
    console.log("addsrc")

    this.state.map.addSource('activities', this.props.geojson);
  }

  displayActivities(map) {
    console.log("display")

    map.addLayer({
      'id': 'activities-light',
      'type': 'line',
      'source': 'activities',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': 'grey',
        'line-opacity': 1,
        'line-width': 2,
      }
    });
    map.addLayer({
      'id': 'activities',
      'type': 'line',
      'source': 'activities',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': 'red',
        'line-opacity': 1,
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          4,
          2
          ]
      }
    });
  }

  changeStyle() {
    console.log("style change")
    this.state.map.setStyle('mapbox://styles/' + this.props.map_style)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.map_style != this.props.map_style){
      this.changeStyle()
    }
    if(prevProps.geojson != this.props.geojson){
      this.updateMap()
    }

  }

  componentDidMount() {
    console.log("map did mount")
    //creates map and stores a reference in state
    const map = this.newMap()
    this.setState({ map }, () => {
      console.log("adding event listeners")
      //load data after style
      map.on('style.load', () => {this.updateMap()})
      //chenge mouse from pointer on enter activity
      map.on('mouseenter', 'activities', () => {this.mouseEnter()})
      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'activities', () => {this.mouseLeave()})

      map.on('click', 'activities', (e) => {this.onActivitySelected(e)})
      //test

    })      

    map.on('mousemove', 'activities', function(e) {
      // if (e.features.length > 0) {
        // map.setPaintProperty('activities', 'line-opacity', ['match', ['to-number', ['get', 'id']], e.features[0].id, 1 , 0.25])
        // map.setFilter('activities', ['==', ['get', 'id'], e.features[0].id])        // console.log(e.features[0].id)

        // if (hoveredStateId) {
        //   map.setFeatureState(
        //     { source: 'activities', id: hoveredStateId },
        //     { hover: false }
        //   );
        // }
        // hoveredStateId = e.features[0].id;
        // console.log(hoveredStateId)
        // map.setFeatureState(
        //   { source: 'activities', id: hoveredStateId },
        //   { hover: true }
        // );
      // }
    });
    map.on('mouseleave', 'activities', function() {
      // map.setFilter('activities', null)
      // if (hoveredStateId) {
      // map.setFeatureState(
      // { source: 'activities', id: hoveredStateId },
      // { hover: false }
      // );
      // }
      // hoveredStateId = null;
    });

  }

  onActivitySelected(e) {
    console.log("activity click")
    console.log(this)
    var map = this.state.map


    //object cleanup for html display
    var properties = e.features[0].properties;
    var endtime = new Date(properties['Full_Date'])
    console.log(properties)
    console.log(properties['aid'])
    endtime.setSeconds( endtime.getSeconds() + properties['Total_Elapsed_Time'] )


    this.props.onActivitySelected(e, onActivitySelectedProps)

    var display = JSON.parse(JSON.stringify(properties))

    delete display.id
    delete display.aid
    delete display['Total_Elapsed_Time']
    delete display['Full_Date']

    // display = JSON.stringify(display)

    // display = display.replace(/"/g, '')
    // display = display.replace(/{/g, '')
    // display = display.replace(/}/g, '')
    // display = display.replace(/,/g, ' ')
    // display = display.replace(/:/g, ': ')
    // display = display.replace(' colon ', ':')

    var onActivitySelectedProps = {
      activity_datetime: new Date(properties['Full_Date']),
      activity_endtime: endtime,
      activity_props: properties,
      display_props: display
    }

    this.props.onActivitySelected(e, onActivitySelectedProps)

    var popup = new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(display)
    .addTo(this.state.map)

    var selectedStateId = e.features[0].id
    map.setFeatureState(
      { source: 'activities', id: selectedStateId },
      { selected: true }
    );
    map.setFilter('activities', ['==', ['get', 'id'], e.features[0].id])

    //remove highlight
    popup.on('close', (e) => {
      map.setFilter('activities', null)
      map.setFeatureState(
        { source: 'activities', id: selectedStateId },
        { selected: false }
      )
      this.onActivityDeselected(e)
    })
  }

  onActivityDeselected(e) {
    this.props.onActivityDeselected(e)
  }

  mouseEnter() {
    this.state.map.getCanvas().style.cursor = 'pointer';
  }

  mouseLeave() {
    this.state.map.getCanvas().style.cursor = '';
  }

  updateMap() {
    console.log("starting updatemap")
    console.log(this.state)
    var map = this.state.map

    //remove old activities
    if (map.getLayer('activities')) {
    map.removeLayer('activities');
    map.removeLayer('activities-light');
    map.removeSource('activities');
    }
    
     //update display
     this.addActivities(map, this.props.geojson)
     this.displayActivities(map)
  }

  render() {
    return (
      <div ref={el => this.mapContainer = el} className='mapContainer'/>
    )
  }
}