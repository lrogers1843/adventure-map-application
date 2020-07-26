import React from 'react';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoibHJvZ2VyczE4NDMiLCJhIjoiY2thZ3Fnejk2MGI3dzJwbWo0eXE1dHF6MyJ9.oYfkk7ZeGShmfugXoZ6Wkg';

// this cannot be stored on state, causes issues with rapid mouseover from one img to another
var marker_array = []

export default class MapBox extends React.Component {


  newMap(){ 
    console.log("newmap")
  return (
    new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/' + this.props.map_style,
      center: [-80.339, 34.652],
      zoom: 6.5
    })
    )
  }

  zoomIn (coords) {
    var coordinates = coords
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

  zoomToSelected() {
    this.zoomIn(this.state.selected_activity_coords)
  }

  addActivities() {
    console.log("addsrc")
    console.log(this.props.flags)
    this.state.map.addSource('activities', this.props.geojson)
    this.state.map.addSource('flags', this.props.flags)
  }

  displayActivities(map) {
    console.log("display")
    var zoombreak = 7

    map.addLayer({
      'minzoom': zoombreak,
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
      'minzoom': zoombreak,
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
    map.addLayer({
      'id': 'flags',
      'type': 'circle',
      'source': 'flags',
      'maxzoom': zoombreak,
      'paint': {
            'circle-blur': 1,
            'circle-opacity': .75,
            'circle-color': 'red',
            'circle-radius': 15,
          }
    });
console.log("flags up")
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
    if(prevProps.zoom_coords != this.props.zoom_coords){
      this.zoomIn(this.props.zoom_coords)
    }
    if(prevProps.marker_coords != this.props.marker_coords) {
      console.log("new props")
      console.log(this.props.marker_coords)
      if (this.props.marker_coords.length == 0){
        this.removeMarkers()
      }
      else {
      this.setMarker()
      }
    
    }
  }

  setMarker() {
    var coords = this.props.marker_coords
    coords.forEach((c) => this.markerOn(c))
  }

  markerOn(c) {
    this.removeMarkers()
    var marker = new mapboxgl.Marker()
    .setLngLat([c[1], c[0]])
    .addTo(this.state.map)
    var markers = marker_array
    marker_array = [...markers, marker]
  }

  removeMarkers() {
    var markers = marker_array
    markers.forEach((m) => {
      m.remove()
    })
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
      map.on('mouseenter', 'flags', () => {this.mouseEnter()})
      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'activities', () => {this.mouseLeave()})
      map.on('mouseleave', 'flags', () => {this.mouseLeave()})
      // click stuff
      map.on('click', 'activities', (e) => {this.onActivitySelected(e)})
      map.on('click', 'flags', (e) => {this.onFlagSelected(e)})


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

  onFlagSelected(e) {
    var properties = e.features[0].properties   
    var point = JSON.parse(properties['Coordinates'])
    this.state.map.flyTo({center: point, zoom: 9})
  }

  onActivitySelected(e) {
    console.log("activity click")
    console.log(this)
    var map = this.state.map

    // calculate endtime for photo filter
    var properties = e.features[0].properties   
    var endtime = new Date(properties['Full_Date'])
    endtime.setSeconds( endtime.getSeconds() + properties['Total_Elapsed_Time'] )

    //get activity coords for activity zoom
    var coords = JSON.parse(properties['coords'])
    // console.log(coords)
    this.setState({selected_activity_coords: coords})

    //object cleanup for html display
    var display = JSON.parse(JSON.stringify(properties))
    delete display.id
    delete display.aid
    delete display['Total_Elapsed_Time']
    delete display['Full_Date']
    delete display['coords']


    //activity info for app state
    var onActivitySelectedProps = {
      activity_datetime: new Date(properties['Full_Date']),
      activity_endtime: endtime,
      activity_props: properties,
      display_props: display,
    }

    this.props.onActivitySelected(e, onActivitySelectedProps)

    //create popup for click tracking
    var popup = new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(display)
    .addTo(this.state.map)

    //highlight selected
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
    //remove flags
    if (map.getLayer('flags')) {
      map.removeLayer('flags');
      map.removeSource('flags');
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