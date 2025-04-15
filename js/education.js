const Educations = [
    {
        Name: "Sumedha Collage, Gampaha",
        Short: "SCG",
        Logo: "https://lh3.googleusercontent.com/proxy/EByXymM8HfCgHiFQcLjI6PF-qCPIO-OnRKrm_u9hv0wRMJ_4eQUO_NZriAZQZe0zdnJ4kgTiTrpjZqTkwOOI9auWQXgvcXWIpilP6Js",
        Start: "2011",
        End: "2023",
        Level:"Ordinary Level",
        Achievements: ["General Pass"],
        Memberships: ["ICT Club", "Photography Club", "School Volleyball Team"],
        Extra_Activities: ["Volleyball","Swimming","Chess"]
    },
    {
        Name: "Informatics Institute of Technology",
        Short: "IIT",
        Logo: "https://www.iit.ac.lk/wp-content/uploads/2023/06/IIT-Campus-Logo.jpg",
        Start: "2023",
        End: "2024",
        Level:"Foundation",
        Achievements: ["Distinction pass"],
        Memberships: [],
        Extra_Activities: []
    },
    {
        Name: "University of Westminster",
        Short: "UoW",
        Logo: "https://static.yuna.potential.ly/public/open/5e273a2a85dc09000100c61c/westminster-logo.png",
        Start: "2024",
        End: "",
        Level: "Level 4",
        Achievements: [],
        Memberships: [],
        Extra_Activities: []
    }
];

function displayEducation(){
    const edu = document.getElementById("education-container");

    Educations.forEach(educations => {
        const education = document.createElement("section");
        education.classList.add("education");

        let timeline;
        if(educations.End === ""){
            timeline = educations.Start + " - Present";
        }else{
            timeline = educations.Start + " - " + educations.End;
        }

        let achieves;
        if(educations.Achievements.length === 0){
            achieves = "";
        }else{
            achieves = '<ul class="achievemets">';
            educations.Achievements.forEach(achievement => {
                achieves += "<li>" + "Achieved " + "<em>" + achievement + "</em>" + "</li>";
            });
            achieves += "</ul>";
        }

        let memberships;
        if(educations.Memberships.length === 0){
            memberships = "";
        }else{
            memberships = '<ul class="memberships">';
            educations.Memberships.forEach(membership => {
                memberships += "<li>" + "Member of " + "<em>" + membership + "</em>" + "</li>";
            });
            memberships += "</ul>";
        }

        let extra_act;
        if(educations.Extra_Activities.length === 0){
            extra_act = "";
        }else{
            extra_act = "Engaged in";
            extra_act += '<ul class="extra_act">';
            educations.Extra_Activities.forEach(activity => {
                extra_act += "<li>" + "<em>" + activity + "</em>" + "</li>";
            });
            extra_act += "</ul>";
        }

        education.innerHTML = `
            <h3>${educations.Name} (${educations.Short})</h3>
            <!--<img src="${educations.Logo}" alt="${educations.Short}">-->
            <h4>${educations.Level} [ ${timeline} ]</h4>
            ${achieves}
            ${memberships}
            ${extra_act}
        `;

        edu.appendChild(education);

    });
}

// Call the function on page load
window.onload = displayEducation;