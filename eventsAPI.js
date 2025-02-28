const eventsAPI = (() => {
    const EVENT_API_URL = "http://localhost:3000/events";

    // GET ALL
    const getAll = async () => {
        const response = await fetch(EVENT_API_URL);
        const events = response.json();
        return events;
    }

    // POST (ADD)
    const add = async (newEvent) => {
        const res = await fetch(EVENT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEvent)
        });
        const event = await res.json();
        return event;
    };

    // PUT (EDIT)
    const edit = async (id, updatedEvent) => {
        await fetch(`${EVENT_API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEvent),
        });
    };

    const deleteById = async (id) => {
        await fetch(`${EVENT_API_URL}/${id}`, {
            method: 'DELETE',
        });
    };

    return {
        getAll,
        add,
        edit,
        deleteById,
    };
})();