console.log("WORKING");

let currentSong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    return songs;
}

const playMusic = (track, paused = false) => {
    currentSong.src = `http://127.0.0.1:3000/${currfolder}/` + track;
    if (!paused) {
        currentSong.play();
        play.src = "svg/pause.svg";
    }
    const decodedTrack = decodeURIComponent(track).replace("%20", " ");
    document.querySelector(".songinfo").innerHTML = decodedTrack;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

play.addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play();
        play.src = "svg/pause.svg";
    } else {
        currentSong.pause();
        play.src = "svg/play.svg";
    }
});

currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
})

document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
})

document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
});

document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
});

document.querySelector("#previous").addEventListener("click", () => {
    let currentTrack = currentSong.src.split(`${currfolder}/`)[1];
    let index = songs.indexOf(decodeURIComponent(currentTrack));
    if (index > 0) {
        playMusic(songs[index - 1]);
    }
});

document.querySelector("#next").addEventListener("click", () => {
    let currentTrack = currentSong.src.split(`${currfolder}/`)[1];
    let index = songs.indexOf(decodeURIComponent(currentTrack));
    if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
});

Array.from(document.getElementsByClassName("card1")).forEach(e => {
    e.addEventListener("click", async item => {
        console.log("Fetching Songs");
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        updateSongList(songs);
        playMusic(songs[0]);
    });
});

function updateSongList(songs) {
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";

    for (const song of songs) {
        const decodedSong = decodeURIComponent(song).replace("%20", " ");
        songul.innerHTML += `<li>
            <img class="invert" src="svg/music.svg" alt="">
            <div class="songname">${decodedSong}</div>
            <div class="playnow">Play Now</div>
            <div class="play"><img class="invert" src="svg/play.svg" alt=""></div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", element => {
            const songName = e.querySelector(".songname").innerHTML.trim();
            playMusic(encodeURIComponent(songName).replace(" ", "%20"));
        });
    });
}

async function displayAlbums() {
    console.log("displaying albums");
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer");
    cardContainer.innerHTML = ""; // Clear existing content

    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            try {
                let infoResponse = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let info = await infoResponse.json();
                cardContainer.innerHTML += ` 
                    <div data-folder="${folder}" class="card1">
                        <img src="http://127.0.0.1:3000/songs/${folder}/cover.jpg" alt="">
                        <div class="artistname1">
                            <h2>${info.title}</h2>
                        </div>
                        <div class="artistword1">
                            <p>${info.description}</p>
                        </div>
                    </div>`;
            } catch (error) {
                console.error(`Failed to fetch info for ${folder}:`, error);
            }
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card1")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            updateSongList(songs);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    songs = await getSongs("songs/ncs");
    updateSongList(songs);
    playMusic(songs[0], true);
    await displayAlbums();
}

main();
