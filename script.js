'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



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

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class App {
    constructor(map, mapEvent) {
        this.map = map
        this.mapEvent = mapEvent
        this.workouts = [];
        this._getPosition()
        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField)

    }
    _getPosition() {
        if (navigator.geolocation) {
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
        // Helpers
        const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp))

        const allPositive = (...inputs) => inputs.every(inp => inp > 0);


        e.preventDefault();

        // Get date  from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.mapEvent.latlng;
        let workout;



        // Check if dare us valid

        // If workout running, create running object
        if (type === "running") {
            // Check if the data is valid 
            const cadence = +inputCadence.value

            if (
                // !Number.isFinite(distance) ||
                // !Number.isFinite(duration) ||
                // !Number.isFinite(cadence)
                !validInput(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert("Inputs have to be positiv numbers!")
            };
            // Add new Object to workout array
            workout = new Running([lat, lng], distance, duration, cadence)
            console.log(workout)

        };

        // If workout cycling, create cycling object
        if (type === "cycling") {
            const elevation = +inputElevation.value
            if (!validInput(distance, duration, elevation) || !allPositive(distance, duration)) {
                return alert("Inputs have to be positiv numbers!")
            };

            // Add new Object to workout array
            workout = new Cycling([lat, lng], distance, duration, elevation)
            console.log(workout)
        }



        // Render workout on map as a marker 

        // Render workout on list 


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

        // Hide the form and clear the input fields 
        inputDistance.value = inputElevation.value = inputDuration.value = inputCadence.value = ""



    }
}

const app = new App();