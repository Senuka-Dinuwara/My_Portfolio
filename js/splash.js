function Explore_Now(){
    const button = document.getElementById('button_redirect');
    const redirct_start = document.querySelector('.show_redirect');
           
    button.style.display = 'none';
    redirct_start.style.display = 'block';

    setTimeout (() => {
        const splash_screen = document.querySelector('.splash_screen');
        const main_screen = document.querySelector('.main_screen');

        splash_screen.style.display = 'none';
        main_screen.style.display = 'block';
    },2000);
}