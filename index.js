async function logFn() {
    // Get All
    const allEvents = await eventsAPI.getAll();
    console.log(allEvents);

    // Add
    const newEvent = {
        eventName: "Book Fair",
        startDate: "2025-02-28",
        endDate: "2025-03-02",
    }
    const addedEvent = await eventsAPI.add(newEvent);
    console.log(addedEvent);

    // Edit
    await eventsAPI.edit("DZvAk-V", {eventName: "Book FairNew", startDate: "2025-02-28", endDate: "2025-03-03"});

    // Delete
    await eventsAPI.deleteById("FtFnyd9");

}

// logFn();

class EventsModel {
    #eventsList = []
     
    constructor() {
        this.#eventsList = [];
    }

    getAllEvents() {
        return this.#eventsList;
    }

    getEventById(id) {
        return this.#eventsList.find((item) => item.id === id);
    }

    setEventsList(eventsList) {
        this.#eventsList = eventsList;
    }

    addEvent(newEvent) {
        this.#eventsList.push(newEvent);
    }

    editEvent(id, updatedEvent) {
        this.#eventsList = this.#eventsList.map((item) => {
            if (item.id === id) {
                return updatedEvent;
            } else {
                return item;
            }
        })
    }

    removeEvent(id) {
        this.#eventsList = this.#eventsList.filter((item) => item.id !== id); 
    }
}

class EventsView {
    constructor() {
        this.eventsListElement = document.querySelector(".events-list");
        // this.eventInputForm = document.querySelector(".event-input-form");
        // this.eventEditForm = document.querySelector(".event-edit-form");
        this.addEventButton = document.querySelector(".add-event-btn");
    }

    renderEvents(eventsList) {
        this.eventsListElement.innerHTML = "";
        for (const event of eventsList) {
            this.addEvent(event);
        }
    }

    addEvent(newEvent) {
        const { eventName, startDate, endDate, id } = newEvent;
        this.eventsListElement.innerHTML += `
            <tr class="event" id=event-${id}>
                <td class="event-name">${eventName}</td>
                <td class="event-start">${startDate}</td>
                <td class="event-end">${endDate}</td>
                <td><button class="event-edit-btn"><img src="pencil-fill.svg"></button></td>
                <td><button class="event-delete-btn"><img src="delete-bin-6-line.svg"></button></td>
            </tr>
        `;
    }

    addEventInputForm() {
        const newEventRow = document.createElement("tr"); // Need to create variable for easier access
        // form tag was causing issues with removing the input form after adding
        newEventRow.innerHTML = `

                <td><input type="text" class="event-name"></td>
                <td><input type="date" class="event-start"></td>
                <td><input type="date" class="event-end"></td>
                <td><button class="event-add-btn"><img src="add-line.svg"></button></td>
                <td><button class="event-cancel-btn"><img src="close-large-line.svg"></button></td>

        `;

        this.eventsListElement.appendChild(newEventRow); // adding the new row to the end of the events list

        return newEventRow;

    }

    // call this when edit button is saved and the display changes to inputs
    editEvent(eventRow, newEventObj) {
        const originalRow = eventRow;

        const { eventName, startDate, endDate } = newEventObj;
        eventRow.innerHTML = `
                <td><input type="text" class="edit-event-name" value="${eventName}"></td>
                <td><input type="date" class="edit-event-start" value="${startDate}"></td>
                <td><input type="date" class="edit-event-end" value="${endDate}"></td>
                <td><button class="event-save-btn"><img src="save-3-line.svg"></button></td>
                <td><button class="event-cancel-btn"><img src="close-large-line.svg"></button></td>
        `;

        return originalRow; // for if we cancel the edit
    }

    // update the event with the new info
    updateEvent(eventRow, updatedEvent) {
        // no need for id since we are changing the child
        const { eventName, startDate, endDate } = updatedEvent;
        eventRow.innerHTML = `
                <td class="event-name">${eventName}</td>
                <td class="event-start">${startDate}</td>
                <td class="event-end">${endDate}</td>
                <td><button class="event-edit-btn"><img src="pencil-fill.svg"></button></td>
                <td><button class="event-delete-btn"><img src="delete-bin-6-line.svg"></td>
            </tr>
        `;
    }

    removeEvent(id) {
        const eventElement = document.getElementById(`event-${id}`);
        if (!eventElement) {
            console.log("Event does not exist.");
        }
        eventElement.remove();
    }
}

class EventsController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.init();
    }

    async init() {
        // 1. Retrieve all events from the database
        const allEvents = await eventsAPI.getAll();
        console.log(allEvents);

        // 2. Give the events to the model
        this.model.setEventsList(allEvents);
        console.log(this.model.getAllEvents());

        // 3. Render any existing events with the view
        this.view.renderEvents(allEvents);

        // 4. Setting up event listeners
        this.setupAddEvent();
        this.setupEditEvent();
        this.setupDeleteEvent();

    }

    // Add Event
    setupAddEvent() {
        this.view.addEventButton.addEventListener("click", async (e) => {
            const newEventRow = this.view.addEventInputForm();
            newEventRow.querySelector(".event-add-btn").addEventListener("click", async (e) => {  this.handleSaveEvent(e, newEventRow);
            });
            
            newEventRow.querySelector(".event-cancel-btn").addEventListener("click", () => {
                newEventRow.remove(); // Remove the input form if the cancel button is clicked
            })
        })
    }


    
    // Remove the input form to add an event with actual data
    // e is just so we can call prevent default
    async handleSaveEvent(e, newEventRow) {
        e.preventDefault();
        const name = newEventRow.querySelector('.event-name').value;
        const startDate = newEventRow.querySelector('.event-start').value;
        const endDate = newEventRow.querySelector('.event-end').value;

        if (!name || !startDate || !endDate) {
            alert('Input Not Valid!');
            return;
        }

        const newEvent = await eventsAPI.add({
            eventName: name,
            startDate: startDate,
            endDate: endDate,
        });
        

        newEventRow.remove(); // Not sure why this works if I call it before adding the event
        // newEventRow.remove(); // Remove the input form after adding the event
        this.model.addEvent(newEvent);
        this.view.addEvent(newEvent);

    }


    setupEditEvent() {
        this.view.eventsListElement.addEventListener("click", async (e) => {
            if (e.target.classList.contains("event-edit-btn")) {
                const eventElement = e.target.parentElement.parentElement; // td -> tr
                const id = eventElement.id.split("-")[1];

                this.handleEditAndSaveEvent(id, eventElement);
            }
        })
    }

    handleEditAndSaveEvent(eventId, newEventRow) {
        const eventObj = this.model.getEventById(eventId);

        if (!eventObj) {
            console.log("Event does not exist.");
            return;
        }
        const originalRow = this.view.editEvent(newEventRow, eventObj);

        newEventRow.querySelector(".event-save-btn").addEventListener("click", async (e) => {
            await this.handleSaveEditEvent(eventId, newEventRow);
        });

        newEventRow.querySelector(".event-cancel-btn").addEventListener("click", () => {
            newEventRow.innerHTML = originalRow.innerHTML;
        });
    }

    // saving new event info
    async handleSaveEditEvent(eventId, eventRow) {
        const updatedEvent = {
            id: eventId,
            eventName: eventRow.querySelector(".edit-event-name").value,
            startDate: eventRow.querySelector(".edit-event-start").value,
            endDate: eventRow.querySelector(".edit-event-end").value,
        }

        // empty fields after editing
        if (!updatedEvent.eventName || !updatedEvent.startDate || !updatedEvent.endDate) {
            alert("Input Not Valid!");
            return;
        }

        // updating database
        await eventsAPI.edit(eventId, updatedEvent);
        this.model.editEvent(eventId, updatedEvent);
        this.view.updateEvent(eventRow, updatedEvent);
    }

    setupDeleteEvent() {
        this.view.eventsListElement.addEventListener("click", async (e) => {
            if (e.target.classList.contains("event-delete-btn")) {
                const eventElement = e.target.parentElement.parentElement; // td -> tr
                const id = eventElement.id.split("-")[1];
                await this.handleDeleteEvent(id);
            }
        })
    }

    async handleDeleteEvent(id) {
        try {
            await eventsAPI.deleteById(id);
            this.model.removeEvent(id);
            this.view.removeEvent(id);
        } catch(error) {
            console.error(error);
        }
    }
}

const eventsModel = new EventsModel();
const eventsView = new EventsView();
const eventsController = new EventsController(eventsModel, eventsView);