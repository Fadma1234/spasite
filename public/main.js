//pseudo code
// check the code if its working if not update to make it work
// make it personalized to build a spa site
// did  use AI and google help in this project
// I had a lot of trouble to make the delete and put req to work
// last step is to host the project using render after pushing it to github






document.addEventListener('DOMContentLoaded', () => {

    // --- Delete Functionality ---
    const deleteButtons = document.querySelectorAll('.delete-btn');

    Array.from(deleteButtons).forEach((button) => {
        button.addEventListener('click', (e) => {
            const appointmentId = e.target.dataset.id;

            fetch('/appointment', {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    '_id': appointmentId // Send the ID to the server
                })
            })
                .then(response => {
                    if (response.ok) return response.json();
                })
                .then(data => {
                    console.log(data);
                    window.location.reload(true); // Reload the page to update the list
                })
                .catch(err => console.error(err));
        });
    });

    // --- Update Functionality (Reschedule) ---
    const updateButtons = document.querySelectorAll('.update-btn');

    Array.from(updateButtons).forEach((button) => {
        button.addEventListener('click', (e) => {
            const appointmentId = e.target.dataset.id;
            const currentDate = e.target.dataset.currentDate;
            const currentTime = e.target.dataset.currentTime;

            const newDate = prompt(`Enter new date (YYYY-MM-DD):`, currentDate);
            const newTime = prompt(`Enter new time (HH:MM e.g., 14:00):`, currentTime);

            if (newDate && newTime) {
                fetch('/appointment', {
                    method: 'put',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        '_id': appointmentId,
                        'newDate': newDate,
                        'newTime': newTime
                    })
                })
                    .then(response => {
                        if (response.ok) return response.json();
                    })
                    .then(data => {
                        console.log(data);
                        window.location.reload(true); // Reload the page to show the updated time
                    })
                    .catch(err => console.error(err));
            }
        });
    });
});
