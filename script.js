'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(coords, distance, duration) {

        this.coords = coords ///  [lat, lng]
        this.distance = distance // km 
        this.duration = duration // in min    
    }

}

class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence
        this.calcPace();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance
        return this.pace
    }
}
class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain
        this.calcSpeed();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60)
        return this.speed
    }
}


//////////////////////////////////
// APPLICATION ARCHITECTURE
class App {
    constructor(map, mapEvent) {
        this.map = map
        this.mapEvent = mapEvent

        this._getPosition()
            // empty

        form.addEventListener("submit", this._newWorkout.bind(this));

        inputType.addEventListener('change', this._toggleElevationField)

    }
    _getPosition() {
        if (navigator.geolocation) {
            console.log(navigator.geolocation.getCurrentPosition(function(position) {
                console.log(position)
            }))
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() {
                alert('Could not get your location')
            })
        }
    }
    _loadMap(position) {
        console.log(position)
        const { latitude } = position.coords
        const { longitude } = position.coords
        const coords = [latitude, longitude]
        console.log(this)
        this.map = L.map('map').setView(coords, 10);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // handling clicks on map 
        this.map.on('click', this._showForm.bind(this));
    }
    _showForm(mapE) {
        this.mapEvent = mapE
        form.classList.remove("hidden");
        inputDistance.focus();
    }
    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')

    }
    _newWorkout(e) {
        e.preventDefault();

        //Clear inputs fields 
        inputDistance.value = inputElevation.value = inputDuration.value = inputCadence.value = ""

        const { lat, lng } = this.mapEvent.latlng

        L.marker([lat, lng]).addTo(this.map)
            .bindPopup(L.popup({
                maxWidth: 300,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: "running-popup",
            }))
            .setPopupContent("workout")
            .openPopup()

    }
}

const app = new App();