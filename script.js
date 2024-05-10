'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map,mapEvent,customIcon;
customIcon = L.icon({
   iconUrl: 'runer-silhouette-running-fast.png', // Specify the path to your custom icon image
   iconSize: [32, 32], // Set the size of the icon
   iconAnchor: [16, 32], // Set the anchor point of the icon, where the marker is placed
   popupAnchor: [0, -32] // Set the anchor point for the popup, relative to the icon
});
 //console.log(L.IconMaterial)
 var busIcon = L.IconMaterial.icon({
   icon: 'directions_bus',            // Name of Material icon
   iconColor: 'white',              // Material icon color (could be rgba, hex, html name...)
   markerColor: 'rgba(0,0,0,0.5)',  // Marker fill color
   outlineColor: 'green',            // Marker outline color
   outlineWidth: 1,                   // Marker outline width 
   iconSize: [31, 42]                 // Width and height of the icon
 })
 
 class Workout{
   date=new Date();
   id=(Date.now()+"").slice(-10);
   setDescription(){
   // prettier-ignore
   const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
   this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
   }
   constructor(coords,distance,duration,){
   
   this.coords=coords;   // array of latitude and longitude [lat,lng]
   this.distance=distance;
   this.duration=duration;
   }
 }

class Running extends Workout{
   type="running";
   constructor(coords,distance,duration,cadence){
   super(coords,distance,duration)
   this.cadence=cadence;
   this.calcPace();
   this.setDescription();
   }

   calcPace(){
      this.pace=this.duration/this.distance;  // pace in min/m
}}

class Cycling extends Workout{
 type="cycling";
constructor(coords,distance,duration,elevationGain){
super(coords,distance,duration);
this.elevationGain=elevationGain;
this.calcSpeed();
this.setDescription();
}
  calcSpeed(){
this.speed=this.distance/(this.duration/60);   // speed=distance/time in m/h
}}
class App {
 #map;
 #mapEvent;
 constructor(){
 this.workouts=[];
 this._getPosition();
 form.addEventListener('submit',this._newWorkout.bind(this));
 inputType.addEventListener("change",()=>this._toggleElevationField());
 }

 _getPosition(){
   if(navigator.geolocation)
   console.log(this);
navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),()=>alert("Can not get current Location")
);
}
 _loadMap(position){
      //console.log(position)
      const {latitude,longitude}=position.coords;
      console.log(this);
     // const longitude=position.coords.longitude;
      /*console.log(`latitude:${latitude}`)
      console.log(`longitude:${longitude}`)
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
   
   */   this.#map = L.map('map').setView([latitude, longitude], 13);
      
      // OpenStreetMap leaflet tiles
      var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
   });
   
    OpenStreetMap_HOT.addTo(this.#map);
      
      
      
   //  creating a custom icon "running "
    
   //console.log(customIcon)
   //L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
   
   // create a circle with current location and a specified radius
     var circle = L.circle([latitude,longitude], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500
   
   })
   
   
   
     
     // Attach the icon to the marker and add to the map
    
      this.#map.on('click',this._showForm.bind(this));
}
   
 
 _showForm(mapE){
   this.#mapEvent=mapE;
         
   const lat=this.#mapEvent.latlng.lat;
   const lng=this.#mapEvent.latlng.lng;

form.classList.remove("hidden");
}  

_hideFrom(){
   // clear the data from form
   inputCadence.value=inputDistance.value=inputDuration.value=inputElevation.value="";
   form.style.display="none";
   form.classList.add("hidden");
   setTimeout(()=>form.style.display="grid",1000);
}
_toggleElevationField(){
   inputElevation.closest(".form__row").classList.toggle("form__row--hidden")
   inputCadence.closest(".form__row").classList.toggle("form__row--hidden")
 
};

_newWorkout(e){
const validInputs=(...inputs)=>inputs.every(inp=>Number.isFinite(inp));
const positiveInputs=(...inputs)=>inputs.every(inp=>inp>0);

e.preventDefault();

//get data from form
const type=inputType.value;
const distance=+inputDistance.value
const duration=+inputDuration.value
const {lat,lng}=this.#mapEvent.latlng;
let workout;

//check for running input type
if(type==="running"){
   const cadence=+inputCadence.value;
   //check data is valid
   if(!validInputs(distance,duration,cadence)||positiveInputs(!duration,distance,cadence)){
      alert("input shoud be a positive finite number!!!");
   }
   //create new running object
workout=new Running([lat,lng],distance,duration,cadence);
//add the running workout to workouts array
this.workouts.push(workout);
}


if(type==="cycling"){
   const elevation=+inputElevation.value;
   //check data is valid
   if(!validInputs(distance,duration,elevation)||!positiveInputs(duration,distance,elevation)){
      alert("input shoud be a positive finite number!!!");}
      //create new cycling object
      
      workout=new Cycling([lat,lng],distance,duration,elevation);
      this.workouts.push(workout);
   }
   
this._renderWorkoutMarker(workout);
//add workout on list
this._renderWorkout(workout);
//hide form 
this._hideFrom();
//form.classList.replace("form","form.hidden");
 };

 _renderWorkoutMarker(workout){
//whenever a user submit (enters) the form display a marker 

L.marker(workout.coords, {icon: customIcon, riseOnHover:true}).addTo(this.#map)
//L.marker([lat,lng]).addTo(map)
.bindPopup(L.popup({
   maxWidth:250,
   minWeight:50,
   autoClose:false,
   closeOnClick:false,
   className:`${workout.type}-popup`,
})).setPopupContent(`${workout.type=="running" ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`)
.openPopup();

}
_renderWorkout(workout){
 let html=`
   <li class="workout workout--${workout.type}" data-id=${workout.id}>
   <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
          <span class="workout__icon">${workout.type=="running" ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">s</span>
      </div>
  
   `;

 if(workout.type==="running"){
         html+=`
      <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
      </div>
   `}

 if(workout.type==="cycling"){
         html+=`
      <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
      </div>
   `}

   html += `</li>`;
// add workout to the list as a sibling to form
form.insertAdjacentHTML('afterend',html);


 }

 }




//create a new App object
const app=new App();
/*

</li> */



