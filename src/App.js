import React,{Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Immutable from 'immutable';
import ReactMapGL from 'react-map-gl';
import * as turf from '@turf/turf'
import ScatterplotOverlay from './scatterplot-overlay';
import ChoroplethOverlay from './choropleth-overlay';
import Controller from './Controller';
import ZIPCODES_SF from './data/feature-example-sf.json';
import points from './data/bernat.json';
import CITIES from './data/cities.json';
import low from './data/low.png';
import mid from './data/mid.png';
import high from './data/high.png';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmVybmF0ZXNxdWlyb2wiLCJhIjoiY2p2anQwc2l0MGk0YTQzcW04N2pjcmpwZiJ9.LUhGlaITYW5t18TJlwDMtg'; 

const ALL_TAL = Immutable.fromJS(points.features).map(f =>
  f.setIn(['properties', 'value'], f.get('properties').get('values'))
);

const CITY_LOCATIONS = Immutable.fromJS(CITIES.map(c => [c.latitude,c.longitude]));
const v = 10;
const sumTotalAmount=(list_coords)=>{
  //console.log(list_coords)
  
  if (list_coords.length<2) return 0
  let path = turf.lineString([...list_coords]);
  let line = path 
  //let line2 = turf.lineString([[115, -25], [125, -30], [135, -30], [145, -25]]);
  let polygons = []
  let tal = [turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' })]
  let sum = 0
  for (const zipcode of ALL_TAL){
    //console.log(turf.lineOverlap(, path))
    let json_obj = zipcode.toJSON()
    let polygon = turf.polygon(json_obj.geometry.coordinates)
    polygons.push(polygon)
    var int = turf.lineIntersect(line, polygon)
    //console.log(int)
    let intersectionPointsArray = int.features.map(d => {return d.geometry.coordinates});
    
    console.log('pointsArray',intersectionPointsArray)
    if (intersectionPointsArray.length>1){
      let intersection = turf.lineString([[intersectionPointsArray[0][0],intersectionPointsArray[0][1]], [intersectionPointsArray[1][0],intersectionPointsArray[1][1]]]);
      
      var dist = turf.lineDistance(intersection);
      console.log('dist',dist)
      //console.log(l);
      
      let time_in_line = dist/v;

      var corr_respirar = 2*v/16.0 + 1.0;
      const cig = 12//22
      let pm2_5 = json_obj.properties.value *0.6;
      var total_cigar = (pm2_5/cig)*(time_in_line/24.0)*corr_respirar;
      sum+=total_cigar
    }
  }
  console.log(sum)
  return sum
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 41.4036299,
        longitude:  2.1743558,
        zoom: document.documentElement.clientWidth>675?13:12,
        bearing: 0,
        pitch: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      v: 10,
      locationsScreen: [],
      cigarValue:0
    };

  }

  render() {
    const {viewport} = this.state;
    const me = this
    //console.log(h,window.innerHeight,window.innerHeight*0.45)
    return (
      <div>
      <ReactMapGL
        {...viewport}
        scrollZoom={false}
        dragPan={false}
        scrollZoom={false}
        dragRotate={false}
        doubleClickZoom={false}
        touchZoom={false}
        touchRotate={false}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        controller={
          new Controller({onClick:(point)=>{
            this.setState((state, props) => ({
              locationsScreen: [...state.locationsScreen, point]
            }));
          }
          })
        }
        onViewportChange={v => this.setState({viewport: v, locationsScreen: [...this.state.locationsScreen]})}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <ChoroplethOverlay
          key="choropleth"
          globalOpacity={0.1}
          colorDomain={[116, 120, 125]}
          colorRange={['rgba(26, 255, 92, 0.5)','rgba(0, 183, 92, 0.5)',  'rgba(255, 87, 0,0.5)']}
          features={ALL_TAL}
        />
        <ScatterplotOverlay
          key="scatterplot"
          locationsScreen={ this.state.locationsScreen }
          dotRadius={10}
          globalOpacity={0.8}
          compositeOperation="lighter"
          dotFill="rgba(255,255,255,0.8)"
          renderWhileDragging={true}
          onProjected={
            (projected)=>{//
              let cigarValue = sumTotalAmount(projected)
              if(this.state.cigarValue!=cigarValue)this.setState({cigarValue:cigarValue})
            }
          }
          
        />
      </ReactMapGL>
      <div style={{alignText:"center", align:"center",backgroundColor:'white',height:window.innerHeight*0.2,position:'absolute',left:0,bottom:0,right:0}} >
        <div style={{margin:'0 auto'}}>
        <img src={low} style={{height:45}}  alt="Logo" />
        {/*Array(parseInt(this.state.v)).map((key)=>{
          console.log('quepax')
          return <img src={mid} style={{height:45}} alt="Logo" />
        })*/}
        <img src={mid} style={{width:this.state.cigarValue*(document.documentElement.clientWidth-60-145),height:45}} alt="Logo" />
        <img src={high} style={{height:45}} alt="Logo" />
        </div>
        <div style={{marginLeft:document.documentElement.clientWidth*0.45}}><input
            type="range"
            //disabled={allDay}
            value={this.state.v}
            min={1}
            max={20}
            step={1}
            onChange={(evt)=>this.setState({v:evt.target.value})}
          /> 
          <br/>v:{this.state.v}<br/>cigars:{Math.round(this.state.cigarValue * 100) / 100}</div>
      </div>
      </div>
    );
  }
}

export default App;
