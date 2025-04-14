const redirct_start = document.querySelector('.show_redirect');

setTimeout (() => {
    const splash_screen = document.querySelector('.splash_screen');
    const main_screen = document.querySelector('.main_screen');

    splash_screen.style.display = 'none';
    main_screen.style.display = 'block';
},5000);