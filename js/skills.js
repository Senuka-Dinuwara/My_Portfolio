const Technical_Skills = [
    {   
        icon: "../resources/skills/technical/Python.png",
        skill: "Python",
        percentage: 86
    },
    { 
        icon: "../resources/skills/technical/Java.png",
        skill: "Java",
        percentage: 67
    },
    { 
        icon: "../resources/skills/technical/MySQL.png",
        skill: "MySQL",
        percentage: 70
    },
    { 
        icon: "../resources/skills/technical/HTML.png",
        skill: "HTML",
        percentage: 79
    },
    { 
        icon: "../resources/skills/technical/CSS.png",
        skill: "CSS",
        percentage: 76
    },
    { 
        icon: "../resources/skills/technical/JavaScript.png",
        skill: "JavaScript",
        percentage: 68
    }
];
const Professional_Skills = [
    { 
        icon: "../resources/skills/professional/Communication & Teamwork.png",
        skill: "Communication & Teamwork",
        percentage: 75
    },
    { 
        icon: "../resources/skills/professional/Critical Thinking & Problem Solving.png",
        skill: "Critical Thinking & Problem Solving",
        percentage: 85
    },
    { 
        icon: "../resources/skills/professional/Time Management.png",
        skill: "Time Management",
        percentage: 85
    },
    { 
        icon: "../resources/skills/professional/Adaptability & Self-Learning.png",
        skill: "Adaptability & Self-Learning",
        percentage: 90
    }
];

function displaySkills(){
    const techskills =  document.getElementById("Technical");
    const proSkills = document.getElementById("Professional");

    Technical_Skills.forEach(skills => {
        const skill = document.createElement("section");
        skill.classList.add("skill");

        skill.innerHTML = `
            <img src="${skills.icon}" alt="${skills.skill}">
            <h4>${skills.skill}</h4> 
        `;
        techskills.appendChild(skill);
    });

    Professional_Skills.forEach(skills => {
        const skill = document.createElement("section");
        skill.classList.add("skill");

        skill.innerHTML = `
            <img src="${skills.icon}" alt="${skills.skill}">
            <h4>${skills.skill}</h4> 
        `;
        proSkills.appendChild(skill);
    });
}

window.onload = displaySkills;