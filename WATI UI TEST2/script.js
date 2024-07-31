

function setDefaultActiveSection() {
    showSidebar('broadcast');
    showContent('Broadcast2');
}

window.onload = setDefaultActiveSection;


function showSidebar(id) {
    const sidebars = document.querySelectorAll('.sidebar');
    sidebars.forEach(sidebar => {
        sidebar.style.display = 'none';
    });

    const selectedSidebar = document.getElementById(id);
    if (selectedSidebar) {
        selectedSidebar.style.display = 'flex';
    }
}

function showContent(id) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(id);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}


// script for the broad cast form
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:8000/templates/')
        .then(response => response.json())
        .then(data => {
            const selectElement = document.getElementById('templates');
            data.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                selectElement.appendChild(optionElement);
            });
        })
        .catch(error => console.error('Error fetching options:', error));
});

async function fetchTemplates() {
    try {
        const response = await fetch('http://localhost:8000/templates/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const templateNames = await response.json();

        const dropdown = document.getElementById('templates');
        templateNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}



// Call the function to fetch and populate templates on page load


document.getElementById('messageForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const phoneNumbers = document.getElementById('phoneNumbers').value.split(',').map(num => num.trim());
    const selectedTemplate = document.getElementById('templates').value;

    const responseDiv = document.getElementById('response');
    responseDiv.textContent = 'Sending...';

    try {
        const response = await fetch('http://localhost:8000/send-template-message/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "recipients": phoneNumbers,
                "template": selectedTemplate
            }),
        });
        
        const result = await response.json();
        responseDiv.textContent = `Success: ${result.successful_messages}, Errors: ${result.errors.length}`;
    } catch (error) {
        responseDiv.textContent = 'Error sending messages.';
    }
});


// scriot for the contacts form
// Handles form submission for creating or updating a contact
document.getElementById('contactForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('contactId').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());

    const url = id ? `http://localhost:8000/contacts/phone/${phone}` : 'http://localhost:8000/contacts/';
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, tags }),
        });

        if (response.ok) {
            alert('Contact saved successfully');
            clearForm();
            loadContacts();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.detail}`);
        }
    } catch (error) {
        console.error('Error saving contact:', error);
        alert('Error saving contact');
    }
});

// Handles search button click
document.getElementById('searchButton').addEventListener('click', async () => {
    const phone = document.getElementById('searchPhone').value.trim();
    if (phone) {
        try {
            const response = await fetch(`http://localhost:8000/contacts/phone/${phone}`);
            if (response.ok) {
                const contact = await response.json();
                displayContacts([contact]);
            } else {
                alert('Contact not found');
                loadContacts(); // Refresh the list if not found
            }
        } catch (error) {
            console.error('Error searching contact:', error);
            alert('Error searching contact');
        }
    }
});

// Function to load all contacts from the server
async function loadContacts() {
    try {
        const response = await fetch('http://localhost:8000/contacts/');
        if (response.ok) {
            const contacts = await response.json();
            displayContacts(contacts);
        } else {
            console.error('Failed to load contacts');
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Function to display contacts in the UI
function displayContacts(contacts) {
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '';

    contacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact';
        contactDiv.innerHTML = `
            Name: ${contact.name}<br>
            Email: ${contact.email}<br>
            Phone: ${contact.phone}<br>
            Tags: ${contact.tags.join(', ')}<br>
            <button onclick="editContact(${contact.id}, '${contact.name}', '${contact.email}', '${contact.phone}', '${contact.tags.join(', ')}')">Edit</button>
            <button onclick="deleteContact('${contact.phone}')">Delete</button>
        `;
        contactsList.appendChild(contactDiv);
    });
}

// Function to clear the form
function clearForm() {
    document.getElementById('contactId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('tags').value = '';
}

// Function to edit a contact
function editContact(id, name, email, phone, tags) {
    document.getElementById('contactId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('phone').value = phone;
    document.getElementById('tags').value = tags;
}

// Function to delete a contact
async function deleteContact(phone) {
    try {
        const response = await fetch(`http://localhost:8000/contacts/${phone}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Contact deleted successfully');
            loadContacts();
        } else {
            alert('Error deleting contact');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Error deleting contact');
    }
}

// Load contacts when the page is loaded
window.addEventListener('load', loadContacts);




async function fetchContacts() {
    try {
        const response = await fetch('http://localhost:8000/contacts/', {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const contacts = await response.json();
        return contacts;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
    }
}

function renderContacts(contacts) {
    const tableBody = document.getElementById('contactTableBody');
    tableBody.innerHTML = '';

    contacts.forEach(contact => {
        const row = document.createElement('tr');

        const selectCell = document.createElement('td');
        const checkboxInput = document.createElement('input');
        checkboxInput.type = 'checkbox';
        checkboxInput.value = contact.phone; // Use phone number as value
        checkboxInput.addEventListener('change', updateRecipients);
        selectCell.appendChild(checkboxInput);

        const nameCell = document.createElement('td');
        nameCell.textContent = contact.name;

        const phoneCell = document.createElement('td');
        phoneCell.textContent = contact.phone;

        row.appendChild(selectCell);
        row.appendChild(nameCell);
        row.appendChild(phoneCell);

        tableBody.appendChild(row);
    });
}

function updateRecipients() {
    const checkboxes = document.querySelectorAll('#contactTableBody input[type="checkbox"]:checked');
    const recipients = Array.from(checkboxes).map(checkbox => checkbox.value);
    document.getElementById('phoneNumbers').value = recipients.join(', ');
}

async function init() {
    const contacts = await fetchContacts();
    renderContacts(contacts);
}

init();


function showContent(contentId) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show the selected content section
    const activeSection = document.getElementById(contentId);
    activeSection.classList.add('active');

    // Remove active class from all sidebar links
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(link => link.classList.remove('active'));

    // Add active class to the clicked sidebar link
    const activeLink = document.querySelector(`.sidebar a[onclick="showContent('${contentId}')"]`);
    if (activeLink) activeLink.classList.add('active');
}



// populate the recipient form with selected contacts in the table
function updateRecipients() {
    const checkboxes = document.querySelectorAll('#contactTableBody input[type="checkbox"]:checked');
    const recipients = Array.from(checkboxes).map(checkbox => checkbox.value);
    document.getElementById('phoneNumbers').value = recipients.join(', ');
}

// Add event listeners to checkboxes
function addCheckboxListeners() {
    const checkboxes = document.querySelectorAll('#contactTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateRecipients);
    });
}

window.onload = function() {
    setDefaultActiveSection();
    addCheckboxListeners();
};