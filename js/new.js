var audio = new Audio();
var current_song = null;
let folder;
var songs;

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    if (isNaN(minutes)) minutes = 0;
    if (isNaN(remainingSeconds)) remainingSeconds = 0;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function playMusic(track) {
    track = `/songs/${folder}/` + track + '.mp3';
    audio.src = track;
    audio.play();

    if (play.src.includes('play.svg')) {
        play.src = 'svg/pause.svg';
    }
    showtitle(current_song);

}

function showtitle(current_song) {
    document.querySelector('.title').innerText = current_song;
}

async function getSongs(folder = "default") {
    let songs_api = await fetch(`/songs/${folder}`);

    let response = await songs_api.text();
    // console.log(response);

    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');

    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith('mp3'))
            songs.push(element.href);

    }
}

async function populate_library_cards(folder = 'default') {
    await getSongs(folder);

    let song_titles = [];

    let cardContainer = document.querySelector('.play-card-container');
    cardContainer.innerHTML = "";

    for (let i = 0; i < songs.length; i++) {
        const element = songs[i];
        song_titles.push(element.split(`${folder}/`)[1].replaceAll('%20', ' '));
        song_titles[i] = song_titles[i].split('.mp3')[0]


        cardContainer.innerHTML = cardContainer.innerHTML + `<div class="play-card b-radius ">
        <div class="image">
        <img class="icon " src="svg/music.svg" alt="nothing">
        </div>
        <div class="details">
        <div class="song-name">${song_titles[i]}</div>
        <div class="artist-name">Artist-unknown</div>
        </div>
        <div class="play">
        <img class="icon play-button" src="svg/play.svg" alt="play-button">
        </div>
        </div>`
    }


    //playing song by cards
    let play_cards = document.querySelectorAll('.play-card');
    Array.from(play_cards).forEach(card => {
        card.addEventListener('click', () => {

            if (document.querySelector('.currently-playing-card')) {
                document.querySelector('.currently-playing-card').src = "svg/play.svg";
                document.querySelector('.currently-playing-card').classList.remove('currently-playing-card');
                card.querySelectorAll('.icon')[1].classList.add('currently-playing-card');
                card.querySelector('.currently-playing-card').src = 'svg/pause.svg';
            }
            else {
                card.querySelectorAll('.icon')[1].classList = card.querySelectorAll('.icon')[1].classList + ' currently-playing-card';
                card.querySelectorAll('.icon')[1].src = "svg/pause.svg";
            }

            current_song = card.querySelector('.song-name').innerText;
            playMusic(current_song);

        }
        )
    })



}

async function fillAlbumCard(album) {

    let cards = await fetch(album);

    let response = await cards.text();
    // console.log(response);

    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');

    let fuckyou = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.includes('albumcard'))
            fuckyou.push(element.href);

    }
    return fuckyou;
}

async function getallSection() {
    let allSections = await fetch('/songs');
    let string = await allSections.text();

    let div = document.createElement('div');
    div.innerHTML = string;
    // console.log(div);

    let a = div.querySelectorAll('a');

    let albums = [];
    let k = 0;
    for (let i = 0; i < a.length; i++) {
        const element = a[i];
        if (element.href.includes('album')) {
            albums[k] = element.href;
            k++;
        }
    }

    // console.log(albums)
    return albums;
}

async function createAlbumSection() {
    let albums = await getallSection();

    let main = document.querySelector('.main');
    for (let i = 0; i < albums.length; i++) {

        let card =  await fillAlbumCard(albums[i]);
        

        main.innerHTML = main.innerHTML + `<section class="album-container">
           <div class="album-container-title">
            <div class="text">${albums[i].split('songs/')[1].split('/')[0].replaceAll('_', ' ')}</div>
            <div class="showall"><a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Show all</a></div>
           </div>

           <div class="album-cards-container">

           </div>
           </section>`
        for (let j = 0; j < card.length; j++) {
            const element = card[j];
            // console.log(`no ${card[j].split(`${albums[i].split('songs/')[1].split('/')[0]}`)[1].replaceAll('/','')}`);
            
            main.querySelectorAll('.album-cards-container')[i].innerHTML = main.querySelectorAll('.album-cards-container')[i].innerHTML + `
            <div class="album-card" data-folder="${albums[i].split('songs/')[1].split('/')[0]}/${card[j].split(`${albums[i].split('songs/')[1].split('/')[0]}`)[1].replaceAll('/','')}">
                <div class="details">
                <div class="image">
                    <img src="${card[j]}/cover.jpeg" alt="image">
                </div>
                <div class="album-name">${card[j].split(`${albums[i].split('songs/')[1].split('/')[0]}`)[1].replaceAll('/','')}</div>
                <div class="album-artists">unknown</div>
                </div>
            </div>`;
        }
           

    }

}

async function main() {

    //library card populate by default
    await populate_library_cards();


    //create album section dynamically
    await createAlbumSection();


    //click on album to get songs
    let album_card = document.querySelectorAll('.album-card');
    folder = 'default';
    Array.from(album_card).forEach(card => {
        card.addEventListener('click', async (e) => {

            //   console.log(e,e.target,e.currentTarget,e.currentTarget.dataset.folder);
            folder = e.currentTarget.dataset.folder;
            if (folder == undefined) folder = 'default';
            await populate_library_cards(folder);
            play_cards = document.querySelectorAll('.play-card');

            if (window.innerWidth <= 780){
      document.querySelector('.left').style.left = 0;

            }
        }
        )
    });



    //volume control // Replace with your range input selector
    volume_rocker.addEventListener('input', () => {

        audio.volume = volume_rocker.value / 100;
        if (!audio.volume) {
            document.querySelector('.volume').querySelector('.icon').src = 'svg/mute.svg';
        }
        else
            document.querySelector('.volume').querySelector('.icon').src = 'svg/volume.svg';

    });

    let sign = document.querySelector('.volume').querySelector('.icon');
    sign.addEventListener('click', () => {
        audio.muted = !audio.muted;
        if (audio.muted)
            document.querySelector('.volume').querySelector('.icon').src = 'svg/mute.svg';
        else
            document.querySelector('.volume').querySelector('.icon').src = 'svg/volume.svg';

    })

    //playing song by clicking on the play button
    if (current_song == undefined) {
        audio.src = songs[0];
        current_song = songs[0].split(`songs/${folder}/`)[1].replaceAll('.mp3', "").replaceAll('%20', " ");
    }
    showtitle(current_song);

    playbox.addEventListener('click', () => {

        if (play.src.includes('play.svg')) {
            if (document.querySelector('.currently-playing-card') == null) {
                document.querySelector('.play-card').querySelectorAll('.icon')[1].src = 'svg/pause.svg';
                document.querySelector('.play-card').querySelectorAll('.icon')[1].classList.add('currently-playing-card');

            }
            play.src = 'svg/pause.svg';
            // playMusic(current_song);
            audio.play();
        }
        else {
            if (document.querySelector('.currently-playing-card'))
                document.querySelector('.currently-playing-card').src = 'svg/play.svg';
            play.src = 'svg/play.svg'
            audio.pause();
        }
    }
    )

    //next button 
    nextbox.addEventListener('click',() => {

        if(document.querySelector('.currently-playing-card'))
        document.querySelector('.currently-playing-card').classList.remove('currently-playing-card');

        let play_cards = document.querySelectorAll('.play-card');
        console.log(play_cards)
        for (let i  = 0; i  < play_cards.length; i ++) {
            const card = play_cards[i ];
            if(card.querySelector('.song-name').innerText == current_song){
                card.querySelectorAll('.icon')[1].src = 'svg/play.svg';
                if(i == play_cards.length - 1){
                    play_cards[0].querySelectorAll('.icon')[1].src = 'svg/pause.svg';
                    play_cards[0].querySelectorAll('.icon')[1].classList.add('currently-playing-card');

                    break;
                }
                else{
                    play_cards[i + 1].querySelectorAll('.icon')[1].src = 'svg/pause.svg';
                    play_cards[i + 1].querySelectorAll('.icon')[1].classList.add('currently-playing-card');
                    break;
                }
            }
        }

      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
          if(song == audio.src && i <= songs.length-2){

            current_song = songs[i+1].split(`songs/${folder}/`)[1].replaceAll('.mp3', "").replaceAll('%20', " ");
            playMusic(current_song);

            break;
          }
          else if(song == audio.src && i == songs.length-1){
            current_song = songs[0].split(`songs/${folder}/`)[1].replaceAll('.mp3', "").replaceAll('%20', " ");
            playMusic(current_song);
            break;
          }
      }
 
    }
    )

    //previous button 
    previousbox.addEventListener('click',() => {

        if(document.querySelector('.currently-playing-card'))
        document.querySelector('.currently-playing-card').classList.remove('currently-playing-card');


        let play_cards = document.querySelectorAll('.play-card');
        console.log(play_cards)
        for (let i  = 0; i  < play_cards.length; i ++) {
            const card = play_cards[i ];
            if(card.querySelector('.song-name').innerText == current_song){
                card.querySelectorAll('.icon')[1].src = 'svg/play.svg';
                if(i == 0){
                    play_cards[play_cards.length - 1].querySelectorAll('.icon')[1].src = 'svg/pause.svg';
                    play_cards[play_cards.length - 1].querySelectorAll('.icon')[1].classList.add('currently-playing-card');

                    break;
                }
                else{
                    play_cards[i - 1].querySelectorAll('.icon')[1].src = 'svg/pause.svg';
                    play_cards[i - 1].querySelectorAll('.icon')[1].classList.add('currently-playing-card');

                }
            }
        }

      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
          if(song == audio.src && i == 0){
            current_song = songs[songs.length - 1].split(`songs/${folder}/`)[1].replaceAll('.mp3', "").replaceAll('%20', " ");
            playMusic(current_song);
            break;
          }
          else if(song == audio.src){
            current_song = songs[i - 1].split(`songs/${folder}/`)[1].replaceAll('.mp3', "").replaceAll('%20', " ");
            playMusic(current_song);
            break;
          }
      }
    }
    )




    //seekbar moving
    audio.addEventListener('timeupdate', () => {

        let time_elapsed = (audio.currentTime / audio.duration) * 100;
        let input = time_elapsed + '%';

        document.querySelector('.thumb').style.left = input;
        if (time_elapsed == 100) {
            play.src = 'svg/play.svg'
            document.querySelector('.thumb').style.left = 0 + '%';

        }
        document.querySelector('.duration').innerText = formatTime(audio.currentTime) + '/' + formatTime(audio.duration)

    })

    //seekbar control
    let tray = document.querySelector('.tray');
    tray.addEventListener('click', (e) => {

        //  console.log(e,e.target,e.x,e.offsetX )
        let math = Math.ceil((e.offsetX / tray.scrollWidth) * 100);
        //  console.log(e.offsetX, tray.scrollWidth, Math.ceil((e.offsetX / tray.scrollWidth) * 100))

        if (play.src.endsWith('pause.svg')) {
            document.querySelector('.thumb').style.left = Math.ceil((e.offsetX / tray.scrollWidth) * 100) + '%';
            audio.currentTime = math * (audio.duration) / 100;

            // console.log(audio.duration*Math.ceil((e.offsetX/tray.scrollWidth)));
            //  console.log(audio.duration, math, Math.ceil(math * (audio.duration) / 100));
        }
    }
    )


    //hamburger response
    let ham = document.querySelector('.hamburger');
    ham.addEventListener('click',(params) => {
      document.querySelector('.left').style.left = 0;
    }
    )

    let cross = document.querySelector('.cross');
    cross.addEventListener('click',(params) => {
      document.querySelector('.left').style.left = "-420px";
    }
    )

   



//crazyshit
    // function checkWidth() {
    //     if (window.innerWidth <= 780) {
    //         const divElement = document.querySelector('.left');
    //         const leftPosition = divElement.offsetLeft;
          
    //         if(leftPosition == 0){
    //             console.log(`yes it is`);
                
    //         }
    //     }
    // }
    
    // // Initial check
    // checkWidth();
    
    // // Add event listener for resize event
    // window.addEventListener('resize', checkWidth);

}
main();
