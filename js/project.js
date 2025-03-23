const projects = [
    {   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png",
        title: "test1"
    },
    {   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png",
        title: "test2"
    },
    {   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png",
        title: "test3"
    },
    {   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png",
        title: "test4"
    }
];

function displayProjects() {
    const project_container = document.getElementById("projects-container");
    const Project = document.getElementById("project");
    if (projects.length == 0){
        const projectnoContent = document.createElement("section");
        projectnoContent.classList.add("noContent");
        projectnoContent.innerHTML = `
            <h3>Projects are currently being updated and will be available soon. Stay tuned for exciting updates!</h3>
        `;
        project_container.appendChild(projectnoContent);
    }else {
        projects.forEach(pro => {
            const projectElement = document.createElement("section");
            projectElement.classList.add("project_card");

            projectElement.innerHTML = `
                <img src="${pro.img}" alt="${pro.title}">
                <h3>${pro.title}</h3>
            `;

            Project.appendChild(projectElement);
        });
        project_container.appendChild(Project);
    }
}

window.onload = displayProjects;