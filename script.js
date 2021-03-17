'use strict';
class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(coords, distance, duration) {
        this.coords = coords ///  [lat, lng]
        this.distance = distance // km 
        this.duration = duration // in min   
        this.clicks = 0;
    }
    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
    click() {
        this.clicks++
    }
}
class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence
        this.type = "running"
        this.calcPace();
        this._setDescription();
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
        this.type = "cycling"
        this.calcSpeed();
        this._setDescription();
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
        this.map = map;
        this.mapEvent = mapEvent;
        this.workouts = [];

        // Get user's position 
        this._getPosition();

        // Get data from localSTorage
        this._getLocalStorage();

        // Attach addEventListener 
        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))

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
            // console.log(this)
        this.map = L.map('map').setView(coords, 10);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // handling clicks on map 
        this.map.on('click', this._showForm.bind(this));
        this.workouts.forEach(work => {
            this._renderWorkoutMarker(work)
        })
    }
    _showForm(mapE) {
        this.mapEvent = mapE
        form.classList.remove("hidden");
        inputDistance.focus();
    }
    _hideForm() {
        //empty the inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";

        form.style.display = "none"
        form.classList.add('hidden')
        setTimeout(() => (form.style.display = "grid"), 1000)


    }
    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')

    }
    _newWorkout(e) {
        // Helpers
        const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp))
        const allPositive = (...inputs) => inputs.every(inp => inp >= 0);
        e.preventDefault();

        // Get date  from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.mapEvent.latlng;
        let workout;


        // Check if data us valid

        // If workout running, create running object
        if (type === "running") {
            let cadence = +inputCadence.value
                // Check if the data is valid 
            if (
                // !Number.isFinite(distance) ||
                // !Number.isFinite(duration) ||
                // !Number.isFinite(cadence)
                !validInput(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert("Inputs have to be positiv numbers!")
            };

            // Creating workout
            workout = new Running([lat, lng], distance, duration, cadence)
        };

        // If workout cycling, create cycling object
        if (type === "cycling") {
            let elevation = +inputElevation.value
            if (!validInput(distance, duration, elevation) || !allPositive(distance, duration, elevation)) {
                return alert("Inputs have to be positiv numbers!")
            };
            // Creating workout
            workout = new Cycling([lat, lng], distance, duration, elevation)
        }

        // Add new Object to workout array
        this.workouts.push(workout);


        // Render workout on map as a marker 
        this._renderWorkoutMarker(workout)

        // Render workout on list 
        this._renderWorkout(workout)

        // Hide the form and clear the input fields 
        this._hideForm()

        // Set local storage toall workouts 
        this._setLocalStorage();

    }
    _renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.map)
            .bindPopup(L.popup({
                maxWidth: 300,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
            }))
            .setPopupContent(`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`)
            .openPopup()
    };
    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}>
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
                <span class="workout__icon">
                     ${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}
                </span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>
        `;
        if (workout.type === "running")
            html += `
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
             </li>
            `;
        if (workout.type === "cycling")
            html += `
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
                </li> 
                `;
        form.insertAdjacentHTML("afterend", html);

    };
    _moveToPopup(e) {
        const workoutEL = e.target.closest('.workout');
        console.log(workoutEL)

        if (!workoutEL) return;

        const workout = this.workouts.find(work => work.id === workoutEL.dataset.id)
        console.log(workout)

        this.map.setView(workout.coords, 10, {
            aniamate: true,
            pan: {
                duration: 1
            }
        });
        workout.click()
    };
    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.workouts))
    };
    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'))
        console.log(data)

        if (!data) { return }

        this.workouts = data;

        this.workouts.forEach(work => {
            this._renderWorkout(work)
        })
    };
    reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }

}

const app = new App();