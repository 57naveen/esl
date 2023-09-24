  const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");




//  const location = path.join(__dirname,"./public");

// app.use(express.static(location));
//app.set("view engine", "hbs")


//show sidebar
menuBtn.addEventListener('click',() =>
{
    sideMenu.style.display='block'; 
})

//close sidebar
closeBtn.addEventListener('click',() =>{
    sideMenu.style.display='none';
})


//change theme
themeToggler.addEventListener('click',() =>
{
    document.body.classList.toggle('dark-theme-variables');

    themeToggler.querySelector('span:nth-child(1)').
    classList.toggle('active');
    themeToggler.querySelector('span:nth-child(2)').
    classList.toggle('active');
})



function updateText() {
    const textElement = document.getElementById('timeDateText');
    const currentTime = new Date();
    
    const options = { month: 'long',day: 'numeric', year: 'numeric',  hour: 'numeric', minute: 'numeric', second: 'numeric' };
    //const day = {weekday: 'long'} 
    const formattedDay = currentTime.toLocaleDateString('en-US')
    const formattedTime = currentTime.toLocaleDateString('en-US',options);
    textElement.textContent = formattedDay+ '\n' +formattedTime;
}  


//////////////////////////////////////////////////////////////////////


document.addEventListener('DOMContentLoaded', function () {
    const taskBtn = document.querySelector('.task-btn');
    const taskDropdown = document.querySelector('.task-dropdown');
    let isDropdownOpen = false;

    // Function to toggle task dropdown
    taskBtn.addEventListener('click', function (event) {
        event.preventDefault();
        isDropdownOpen = !isDropdownOpen;
        if (isDropdownOpen) {
            taskDropdown.style.display = 'block';
        } else {
            taskDropdown.style.display = 'none';
        }
    });

    // Close the task dropdown when clicking anywhere else
    document.addEventListener('click', function (event) {
        if (isDropdownOpen && !event.target.closest('.task-dropdown') && !event.target.closest('.task-btn')) {
            taskDropdown.style.display = 'none';
            isDropdownOpen = false;
        }
    });
});



//  selection highlight in the side bar 
document.addEventListener('DOMContentLoaded', function () {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    let selectedLink = null;

    // Function to handle link click
    function handleLinkClick(event) {
        if (selectedLink) {
            selectedLink.classList.remove('active');
        }
        event.currentTarget.classList.add('active');
        selectedLink = event.currentTarget;
    }

    // Add click event listener to each sidebar link
    sidebarLinks.forEach(function (link) {
        link.addEventListener('click', handleLinkClick);
    });
});


////////////////////////////////////////////logout logic//////////
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.querySelector('.logout');

    // Function to handle logout
    function logout() {
        // Here, you can perform logout actions like clearing the session or token.
        // For example, if using localStorage for authentication token:
        localStorage.removeItem('authToken'); // Remove the authentication token

        // Redirect to the login page
        window.location.href = '/'; // Replace '/login' with your login page URL
    }

    // Attach the logout function to the logout button click event
    logoutButton.addEventListener('click', function (event) {
        event.preventDefault();
        logout(); // Call the logout function when the button is clicked
    });
});



///////////////////////// user name display//////////////
 // Fetch the user name and update the HTML
 fetch('/') // Make sure to use the correct URL
 .then(response => response.json())
 .then(data => {
     const userNamePlaceholder = document.getElementById('userNamePlaceholder');
     if (userNamePlaceholder) {
         userNamePlaceholder.textContent = data.userName;
     }
 })
 .catch(error => {
     console.error('Error fetching user name:', error);
 });



 ////////////////////////////////////
