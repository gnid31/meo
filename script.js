console.log("Script loaded and starting execution.");

let wallpaperImageUrls = [];
let currentBackgroundIndex = 0;
let backgroundChangeInterval = null;
let attemptsLeft = 3;
let fireworkInterval = null;
let animationInterval = null;
let allowExitSuccessScreen = false;
let activeFireworkElements = [];
let successScreenAssets = [];
let shuffledSuccessScreenAssets = [];
let loadingScreen;
let bouncingImageAnimation = null;
let slapsSound;
let signinScreen;
let usernameInput;
let passwordInput;
let gnidsBirthdayInput;
let signinButton;
let signinErrorMessage;
let toggleDobPassword;
let toggleGnidPassword;
let anotherInput;
let toggleAnotherPassword;
let blackScreen;
let bsodScreen;
let bsodImage;
let mainMusicStartedOnSignInScreen = false;
let mainMusicStartedOnMysteryBox = false;
let firstSignInAttemptDone = false;
let lastLoginWasSuccessful = false;
let loadingPercentageText;
let toastContainer;
let snowfallInterval = null;
let preloadedBouncingImages = [];
let exitHintElement;
let listenedSongs = new Set(); // NEW: To track listened songs
let totalSongs; // NEW: To store total number of songs
let typingSound; // NEW: Declare typing sound audio element

// Typing effect for hacked message (now global)
function startHackedTypingEffect() {
  const hackedTypingMessage = document.getElementById('hacked-typing-message');
  // Set the message instantly, let CSS handle the animation
  hackedTypingMessage.innerHTML = `
    <span class="typewriter-message with-caret">The letter sleeps at the end of this journey. Don\'t stop halfway</span><br>
    <span class="press-enter-line">Press Enter to continue</span>
  `;
  let hackedScreenCanExit = false;

  if (typingSound) {
    typingSound.currentTime = 0;
    typingSound.loop = true; // Loop the typing sound
    typingSound.play().catch(e => console.error("Error playing typing sound:", e));
  }

  // Sau khi typing xong, chỉ hiện dòng dưới với hiệu ứng nhấp nháy, không caret
  setTimeout(() => {
    const showPressEnterLine = () => {
      const firstLine = hackedTypingMessage.querySelector('.typewriter-message');
      const secondLine = hackedTypingMessage.querySelector('.press-enter-line');
      // Giữ caret ở cuối dòng typing
      if (firstLine) firstLine.classList.add('with-caret');
      // Hiện dòng dưới với hiệu ứng nhấp nháy toàn dòng
      if (secondLine) {
        secondLine.classList.add('fade-in'); // Thêm lớp fade-in để hiện dòng
        secondLine.classList.add('blink-hard'); // Đảm bảo hiệu ứng nhấp nháy

        if (typingSound) {
          typingSound.pause(); // Stop typing sound when animation finishes
          typingSound.currentTime = 0;
        }

        setTimeout(() => { hackedScreenCanExit = true; }, 1800); // fade-in duration
      } else {
        setTimeout(showPressEnterLine, 100);
      }
    };
    showPressEnterLine();
  }, 6200); // typewriter duration
  const transitionToSignIn = (event) => {
    if (!hackedScreenCanExit) return;
    if (!event || event.type !== 'keydown' || event.key !== 'Enter') return;
    event.preventDefault();
    hackedScreen.style.display = 'none';
    signinScreen.style.display = 'flex';
    toggleSnowfall(true); // Bật tuyết rơi khi vào màn hình đăng nhập
    if (mainBackgroundMusic && mainBackgroundMusic.paused) {
      mainBackgroundMusic.play().catch(error => {
        console.error('Error playing main background music on sign-in screen (from hacked screen):', error);
      });
    }
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    document.removeEventListener('keydown', transitionToSignIn);
  };
  document.removeEventListener('keydown', transitionToSignIn);
  document.addEventListener('keydown', transitionToSignIn);
}

// NEW: Consolidated function definitions (moved to global scope)
function showSplashScreen() {
  splashScreen.style.display = 'flex';
  splashScreen.classList.remove('hidden');
  questionBox.style.display = 'none';
  toggleSnowfall(true); // Bật tuyết rơi khi vào splash
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}

function showQuestionBox() {
  questionBox.style.display = 'block';
  splashScreen.classList.add('hidden');
  splashScreen.style.display = 'none';
  toggleSnowfall(true); // Bật tuyết rơi khi vào question-box
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}

function showSongSelector() {
  console.log("showSongSelector called.");
  const containerElement = document.querySelector('.container');
  if (containerElement) {
    console.log("Container element found.", containerElement);
    containerElement.style.display = 'block';

    // NEW: Hide all other full-screen overlays
    splashScreen.style.display = 'none';
    questionBox.style.display = 'none';
    lockedScreen.style.display = 'none';
    hackedScreen.style.display = 'none';
    signinScreen.style.display = 'none';
    screensaver.style.display = 'none';
    letterScreen.style.display = 'none';

  } else {
    console.error("Container element not found!");
  }
  toggleSnowfall(true); // Bật tuyết rơi khi vào song-selector
  // NEW: Ensure main background music plays when entering song selector screen
  // Sửa: Chỉ phát nhạc nền nếu không có bài hát nào đang phát (audio.paused)
  // Luôn phát lại nhạc nền khi quay về màn hình chọn bài, trừ khi đang phát bài hát khác
  // Luôn phát lại nhạc nền khi vào màn hình chọn bài
  if (mainBackgroundMusic) {
      mainBackgroundMusic.pause();
      mainBackgroundMusic.currentTime = 0;
      mainBackgroundMusic.play().catch(error => {
          console.error('Error playing main background music when showing song selector:', error);
      });
  }
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}

function showFireworkScreen() {
  successScreensaver.style.display = 'block';
  toggleSnowfall(true); // Bật tuyết rơi khi vào firework
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}

// NEW: Letter Screen elements
let letterScreen;
let envelopeImage;
let letterImage;
let letterScreenExitHint;
let letterScreenMusic;

// Function to open the envelope (moved to global scope for proper initialization)
function openEnvelope() {
  // envelopeImage.classList.add('opened'); // REMOVED: This was conflicting with fade-in-bck
  // Start fade-out-backward animation for envelope
  envelopeImage.classList.add('fade-in-bck');
  envelopeImage.removeEventListener('click', openEnvelope);
  // Wait for fade-out to finish, then show letter
  setTimeout(() => {
    envelopeImage.style.display = 'none';
    envelopeImage.classList.remove('fade-in-bck');
    letterImage.style.display = 'block';
    letterImage.classList.remove('fade-in-grow', 'visible', 'fade-in-fwd');
    void letterImage.offsetWidth;
    letterImage.classList.add('fade-in-fwd');
    letterImage.classList.add('visible'); // Add the 'visible' class here
    // Show exit hint only when letter is visible
    if (letterScreenExitHint) letterScreenExitHint.style.display = 'block';
  }, 2000); // Changed from 700 to 5000 to match CSS animation duration
  console.log('Envelope fade-out, letter will fade-in.');
};

// Helper function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Khai báo các biến DOM element ở phạm vi toàn cục
let screensaver;
let bouncingImg;
let splashScreen;
let claimButton;
let audio;
let body;
let questionBox;
let answerInput;
let submitBtn;
let errorMessage;
let attemptsMessage;
let lockedScreen;
let errorSound;
let errorGifOverlay;
let successScreensaver;
let fireworksMusic;
let mainBackgroundMusic;
let loadingCatGif;
let loadingBar;
let hackedScreen;
let hackedImage;

const baseGifDuration = 1580;

// Helper to check for overlap between two rectangles
function checkOverlap(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Function to find a non-overlapping position
function findNonOverlappingPosition(elementWidth, elementHeight, maxAttempts = 50) {
    let newX, newY;
    let newRect;
    let foundPosition = false;

    for (let i = 0; i < maxAttempts; i++) {
        newX = Math.random() * (window.innerWidth - elementWidth);
        newY = Math.random() * (window.innerHeight - elementHeight);
        newRect = { x: newX, y: newY, width: elementWidth, height: elementHeight };

        let overlaps = false;
        for (const activeElement of activeFireworkElements) {
            if (activeElement.domElement.isConnected && checkOverlap(newRect, activeElement.rect)) {
                overlaps = true;
                break;
            }
        }

        if (!overlaps) {
            foundPosition = true;
            break;
        }
    }

    if (foundPosition) {
        return { x: newX, y: newY };
    } else {
        console.warn('Could not find a non-overlapping position for element after multiple attempts. Placing randomly.');
        return {
            x: Math.random() * (window.innerWidth - elementWidth),
            y: Math.random() * (window.innerHeight - elementHeight)
        };
    }
}

function createSnowflake() {
  if (document.querySelectorAll('.snowflake').length > 100) return;
  const snowflake = document.createElement('div');
  snowflake.classList.add('snowflake');
  snowflake.innerHTML = '❄';
  document.body.appendChild(snowflake);
  const startPosition = Math.random() * window.innerWidth;
  const endPosition = window.innerHeight + 20;
  const fallDuration = Math.random() * 5 + 5;
  const startScale = (Math.random() * 0.5 + 0.5) * 1.5;
  const endScale = startScale * 0.3;
  const horizontalDrift = Math.random() * 50 - 25;
  snowflake.style.left = `${startPosition}px`;
  snowflake.style.fontSize = `${startScale}em`;
  snowflake.style.opacity = Math.random() * 0.5 + 0.5;
  const animation = snowflake.animate([
    {
      transform: `translateY(0) translateX(0) scale(${startScale})`,
      opacity: snowflake.style.opacity
    },
    {
      transform: `translateY(${endPosition}px) translateX(${horizontalDrift}px) scale(${endScale})`,
      opacity: 0
    }
  ], {
    duration: fallDuration * 1000,
    easing: 'linear',
    iterations: 1
  });
  animation.onfinish = () => {
    snowflake.remove();
  };
}

// Hàm để bật/tắt tuyết rơi
function toggleSnowfall(shouldStart, flakeInterval = 133) {
    if (shouldStart && snowfallInterval === null) {
        console.log("Starting snowfall...");
        snowfallInterval = setInterval(createSnowflake, flakeInterval);
    } else if (!shouldStart && snowfallInterval !== null) {
        console.log("Stopping snowfall.");
        clearInterval(snowfallInterval);
        snowfallInterval = null;
        // Also remove existing snowflakes
        document.querySelectorAll('.snowflake').forEach(flake => flake.remove());
    }
}

function startFireworksEffect() {
  if (fireworkInterval) {
    clearInterval(fireworkInterval);
  }

  fireworkInterval = setInterval(() => {
    if (shuffledSuccessScreenAssets.length === 0) {
        shuffledSuccessScreenAssets = shuffleArray([...successScreenAssets]);
        console.log('Shuffled success screen assets reloaded and reshuffled.');
    }

    if (shuffledSuccessScreenAssets.length === 0) {
        console.warn('No success screen assets available after reshuffling.');
        return;
    }
    const randomAsset = shuffledSuccessScreenAssets.shift();

    let newElement;
    let estimatedWidth, estimatedHeight;

    const isImage = /\.(gif|jpe?g|png|webp)$/i.test(randomAsset);

    if (isImage) {
        newElement = document.createElement('img');
        newElement.classList.add('firework-gif');
        newElement.src = randomAsset;
        estimatedWidth = 150;
        estimatedHeight = 150;
    } else {
        newElement = document.createElement('div');
        newElement.classList.add('success-bouncing-text');
        newElement.textContent = randomAsset;
        estimatedWidth = 300;
        estimatedHeight = 70;
    }

    const position = findNonOverlappingPosition(estimatedWidth, estimatedHeight);

    newElement.style.left = `${position.x}px`;
    newElement.style.top = `${position.y}px`;

    successScreensaver.appendChild(newElement);

    const assetEntry = {
        domElement: newElement,
        rect: { x: position.x, y: position.y, width: estimatedWidth, height: estimatedHeight }
    };
    activeFireworkElements.push(assetEntry);

    if (isImage) {
        newElement.onload = () => {
            assetEntry.rect.width = newElement.offsetWidth;
            assetEntry.rect.height = newElement.offsetHeight;
        };
    } else {
        setTimeout(() => {
            assetEntry.rect.width = newElement.offsetWidth;
            assetEntry.rect.height = newElement.offsetHeight;
        }, 0);
    }


    const animationDurationMs = 6 * 1000;
    setTimeout(() => {
        newElement.remove();
        const index = activeFireworkElements.indexOf(assetEntry);
        if (index > -1) {
            activeFireworkElements.splice(index, 1);
        }
    }, animationDurationMs);

  }, 600);
}

function clearFireworks() {
  if (successScreensaver) {
    while (successScreensaver.querySelector('.success-bouncing-text')) {
      successScreensaver.querySelector('.success-bouncing-text').remove();
    }
    while (successScreensaver.querySelector('.firework-gif')) {
      successScreensaver.querySelector('.firework-gif').remove();
    }
  }
}


function changeBackgroundImage() {
    if (wallpaperImageUrls.length === 0) {
        console.warn('No wallpaper images loaded.');
        return;
    }
    currentBackgroundIndex = (currentBackgroundIndex + 1) % wallpaperImageUrls.length;
    body.style.backgroundImage = `url(${wallpaperImageUrls[currentBackgroundIndex]})`;
}

function startBackgroundChange() {
    if (backgroundChangeInterval) {
        clearInterval(backgroundChangeInterval);
    }
    changeBackgroundImage();
    backgroundChangeInterval = setInterval(changeBackgroundImage, 5000);
}

const songList = [
  "https://github.com/gnid31/meo/raw/main/music/intentions.mp3", // meo 1
  "https://github.com/gnid31/meo/raw/main/music/uoc_gi.mp3", // meo 8
  "https://github.com/gnid31/meo/raw/main/music/haru_haru.mp3", // meo 3 (new)
  "https://github.com/gnid31/meo/raw/main/music/am_tham_ben_em.mp3", // meo 9 (new)
  "https://github.com/gnid31/meo/raw/main/music/neu_biet_do_la_lan_cuoi.mp3", // meo 5 (new)
  "https://github.com/gnid31/meo/raw/main/music/giac_mo_tung_rat_tho.mp3", // meo 4 (new)
  "https://github.com/gnid31/meo/raw/main/music/nothing_gonna_change_my_love_for_you.mp3", // meo 2 (new)
  "https://github.com/gnid31/meo/raw/main/music/hen_mot_mai.mp3", // meo 7 (new)
  "https://github.com/gnid31/meo/raw/main/music/i_love_you.mp3", // meo 10 (new)
  "https://github.com/gnid31/meo/raw/main/music/until_i_found_you.mp3", // meo 6 (new)
  "https://github.com/gnid31/meo/raw/main/music/long_time_no_see.mp3", // meo 11 (new)
  "https://github.com/gnid31/meo/raw/main/music/aloha.mp3", // meo 12 (new)
  "https://github.com/gnid31/meo/raw/main/music/my_everything.mp3", // meo 12 (new)
];
totalSongs = songList.length; // NEW: Initialize totalSongs here

let screensaverKeyListener = null;

function showScreensaver(songUrl, customMessage) {
    screensaver.style.display = 'block';
    console.log('Song screensaver shown.');

    // Update the exit hint text
    if (exitHintElement) {
        exitHintElement.textContent = customMessage;
    }

    console.log('Current preloadedBouncingImages array length:', preloadedBouncingImages.length);

    if (screensaverKeyListener) {
        window.removeEventListener('keydown', screensaverKeyListener);
        screensaverKeyListener = null;
    }

    if (mainBackgroundMusic) {
        mainBackgroundMusic.pause();
        mainBackgroundMusic.currentTime = 0;
        console.log('Main background music stopped for individual song screensaver.');
    }

    if (audio) {
        audio.src = songUrl;
        audio.load();
        audio.play().then(() => {
            console.log('Individual song started playing successfully.');
        }).catch(error => {
            console.error('Error playing individual song:', error);
        });

        audio.onended = () => {
            console.log('Individual song ended. Exiting screensaver...');
            screensaver.style.display = 'none';

            if (bouncingImageAnimation) {
                clearInterval(bouncingImageAnimation);
                bouncingImageAnimation = null;
            }
            if (bouncingImg) {
                bouncingImg.style.display = 'none';
                bouncingImg.src = '';
            }

            // Phát lại nhạc nền ngay khi thoát screensaver
            if (mainBackgroundMusic) {
                mainBackgroundMusic.pause();
                mainBackgroundMusic.currentTime = 0;
                mainBackgroundMusic.play().catch(error => {
                    console.error('Error playing main background music after individual song:', error);
                });
            }
            if (screensaverKeyListener) {
                window.removeEventListener('keydown', screensaverKeyListener);
                screensaverKeyListener = null;
            }
            audio.onended = null; // Clear the onended handler to prevent re-triggering
            // Chỉ chuyển sang màn hình thư nếu đã nghe hết hoặc nghe bài i_love_you.mp3
            if (songUrl === "https://github.com/gnid31/meo/raw/main/music/i_love_you.mp3" || listenedSongs.size === totalSongs) {
                showLetterScreen();
            }
        };
    }

    if (bouncingImg && preloadedBouncingImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * preloadedBouncingImages.length);
        bouncingImg.src = preloadedBouncingImages[randomIndex].src;
        console.log('Bouncing image src set to:', bouncingImg.src);
        bouncingImg.style.display = 'block';
        bouncingImg.style.position = 'absolute';

        if (bouncingImageAnimation) {
            clearInterval(bouncingImageAnimation);
        }

        let currentX = Math.random() * (window.innerWidth - bouncingImg.offsetWidth);
        let currentY = Math.random() * (window.innerHeight - bouncingImg.offsetHeight);
        let dx = 2;
        let dy = 1;

        console.log('Initial bouncing image dimensions:', bouncingImg.offsetWidth, bouncingImg.offsetHeight);

        bouncingImageAnimation = setInterval(() => {
            const imgWidth = bouncingImg.offsetWidth;
            const imgHeight = bouncingImg.offsetHeight;
            
            if (imgWidth === 0 || imgHeight === 0) {
                console.warn('Bouncing image has zero dimensions, animation might be off. Width:', imgWidth, 'Height:', imgHeight);
            }

            currentX += dx;
            currentY += dy;

            let collided = false;

            if (currentX + imgWidth > window.innerWidth || currentX < 0) {
                dx *= -1;
                currentX = Math.max(0, Math.min(currentX, window.innerWidth - imgWidth));
                collided = true;
            }
            if (currentY + imgHeight > window.innerHeight || currentY < 0) {
                dy *= -1;
                currentY = Math.max(0, Math.min(currentY, window.innerHeight - imgHeight));
                collided = true;
            }

            if (collided && preloadedBouncingImages.length > 1) {
                let newImageSrc;
                let attempts = 0;
                do {
                    const randomIndex = Math.floor(Math.random() * preloadedBouncingImages.length);
                    newImageSrc = preloadedBouncingImages[randomIndex].src;
                    attempts++;
                    if (attempts > 100) {
                       console.warn('Không tìm thấy ảnh khác để thay đổi. Đang sử dụng lại ảnh cũ.');
                       break;
                    }
                } while (newImageSrc === bouncingImg.src);

                if (bouncingImg.src !== newImageSrc) {
                    bouncingImg.src = newImageSrc;
                    console.log('Ảnh nhảy đã đổi thành:', newImageSrc);
                }
            }

            bouncingImg.style.left = `${currentX}px`;
            bouncingImg.style.top = `${currentY}px`;

        }, 10);
    } else {
        console.warn('bouncingImg hoặc preloadedBouncingImages chưa sẵn sàng cho màn hình chờ bài hát. Bỏ qua hoạt ảnh nhảy.');
        if (bouncingImg) bouncingImg.style.display = 'none';
    }

    screensaverKeyListener = (e) => {
        console.log('Key pressed on song screensaver:', e.key);
        if (e.key !== ' ') {
            screensaver.style.display = 'none';
            console.log('Song screensaver hidden.');

            if (myAudio) {
                myAudio.pause();
                myAudio.currentTime = 0;
                console.log('Individual song paused and reset.');
            }

            if (bouncingImageAnimation) {
                clearInterval(bouncingImageAnimation);
                bouncingImageAnimation = null;
            }
            if (bouncingImg) {
                bouncingImg.style.display = 'none';
                bouncingImg.src = '';
            }

            if (mainBackgroundMusic) {
                console.log('Attempting to play main background music after exiting individual song screensaver.');
                mainBackgroundMusic.play().catch(error => {
                    console.error('Error playing main background music after screensaver exit:', error);
                });
            }
            window.removeEventListener('keydown', screensaverKeyListener);
            screensaverKeyListener = null;
            // Chỉ chuyển sang màn hình thư nếu đã nghe hết hoặc nghe bài i_love_you.mp3
            if (songUrl === "https://github.com/gnid31/meo/raw/main/music/i_love_you.mp3" || listenedSongs.size === totalSongs) {
                showLetterScreen();
            }
        }
    };

    window.addEventListener('keydown', screensaverKeyListener);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
}

function playSong(buttonElement, index) {
  const songUrl = songList[index];
  const customMessage = buttonElement.getAttribute('data-message');

  listenedSongs.add(index); // Mark this song as listened

  // Nếu là bài i_love_you.mp3 thì luôn tắt nhạc nền trước khi phát
  if (songUrl === "https://github.com/gnid31/meo/raw/main/music/i_love_you.mp3" && mainBackgroundMusic) {
    mainBackgroundMusic.pause();
    mainBackgroundMusic.currentTime = 0;
  }
  showScreensaver(songUrl, customMessage);
  // KHÔNG chuyển sang envelope ngay khi click vào i_love_you
  // Việc chuyển sang envelope sẽ được xử lý ở onended của audio trong showScreensaver
}

// NEW: Function to show the letter screen (moved to global scope)
function showLetterScreen() {
  letterScreen.style.display = 'flex';
  toggleSnowfall(true); // Start snowfall on letter screen
  // Nếu audio chính (myAudio) vẫn đang phát thì dừng lại trước khi phát nhạc thư
  if (audio && !audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }
  if (letterScreenMusic) {
    letterScreenMusic.currentTime = 0;
    letterScreenMusic.play().catch(error => {
      console.error('Error playing letter screen music:', error);
    });
  }
  // NEW: Pause main background music if it's playing
  if (mainBackgroundMusic && !mainBackgroundMusic.paused) {
      mainBackgroundMusic.pause();
  }
  console.log('Letter screen shown.');

  // Reset envelope/letter state
  envelopeImage.classList.remove('opened');
  envelopeImage.style.opacity = '1';
  envelopeImage.style.display = 'block';
  letterImage.classList.remove('visible', 'fade-in-fwd', 'fade-in-grow');
  letterImage.style.display = 'none';
  if (letterScreenExitHint) letterScreenExitHint.style.display = 'none';

  // Re-add click listener to envelope every time the screen is shown
  envelopeImage.removeEventListener('click', openEnvelope);
  envelopeImage.addEventListener('click', openEnvelope);
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOMContentLoaded event fired.");

  // Khai báo và khởi tạo các biến DOM element
  screensaver = document.getElementById('screensaver');
  bouncingImg = document.getElementById('bouncing-image');
  splashScreen = document.getElementById('splash-screen');
  claimButton = document.getElementById('claim-button');
  audio = document.getElementById('myAudio');
  body = document.body;
  questionBox = document.getElementById('question-box');
  answerInput = document.getElementById('secret-answer');
  submitBtn = document.getElementById('submit-answer');
  errorMessage = document.getElementById('error-message');
  attemptsMessage = document.getElementById('attempts-left');
  lockedScreen = document.getElementById('locked-screen');
  errorSound = document.getElementById('error-sound');
  errorGifOverlay = document.getElementById('error-gif-overlay');
  successScreensaver = document.getElementById('success-screensaver');
  fireworksMusic = document.getElementById('fireworks-music');
  mainBackgroundMusic = document.getElementById('main-background-music');
  loadingScreen = document.getElementById('loading-screen');
  slapsSound = document.getElementById('slaps-sound');
  signinScreen = document.getElementById('signin-screen');
  usernameInput = document.getElementById('username-input');
  passwordInput = document.getElementById('password-input');
  gnidsBirthdayInput = document.getElementById('gnids-birthday-input');
  signinButton = document.getElementById('signin-button');
  signinErrorMessage = document.getElementById('signin-error-message');
  toggleDobPassword = document.getElementById('toggle-dob-password');
  toggleGnidPassword = document.getElementById('toggle-gnid-password');
  anotherInput = document.getElementById('another-input');
  toggleAnotherPassword = document.getElementById('toggle-another-password');
  blackScreen = document.getElementById('black-screen');
  bsodScreen = document.getElementById('bsod-screen');
  bsodImage = document.getElementById('bsod-image');
  letterScreen = document.getElementById('letter-screen');
  envelopeImage = document.getElementById('envelope-image');
  letterImage = document.getElementById('letter-image');
  letterScreenExitHint = document.getElementById('letter-screen-exit-hint');
  letterScreenMusic = document.getElementById('letter-screen-music');
  loadingCatGif = document.getElementById('loading-cat-gif');
  loadingBar = document.querySelector('.loading-bar');
  loadingPercentageText = document.getElementById('loading-percentage');
  toastContainer = document.getElementById('toast-container');
  hackedScreen = document.getElementById('hacked-screen');
  hackedImage = document.getElementById('hacked-image');
  exitHintElement = document.getElementById('exit-hint');
  typingSound = document.getElementById('typing-sound'); // NEW: Initialize typing sound
  const xemThemArea = document.querySelector('area[title="Xem thêm"]');

  // Add hover effect for the "Xem thêm" area
  if (xemThemArea) {
    xemThemArea.addEventListener('mouseover', () => {
      letterImage.classList.add('letter-image-hover-effect');
    });
    xemThemArea.addEventListener('mouseout', () => {
      letterImage.classList.remove('letter-image-hover-effect');
    });
  }

  // NEW: Listener for Letter Screen exit
  letterScreenKeyListener = (e) => {
    if (letterScreen.style.display === 'flex' && letterImage.classList.contains('visible') && e.key !== ' ') {
      e.preventDefault(); // Prevent default if it's a key we're handling
      letterScreen.style.display = 'none';
      toggleSnowfall(false);
      if (letterScreenMusic) {
        letterScreenMusic.pause();
        letterScreenMusic.currentTime = 0;
      }
      // Hide letter and reset for next time
      letterImage.style.display = 'none';
      letterImage.classList.remove('visible', 'fade-in-fwd', 'fade-in-grow');
      envelopeImage.style.display = 'block';
      if (letterScreenExitHint) letterScreenExitHint.style.display = 'none';
      // Call showSongSelector to handle showing the container and resuming main music
      showSongSelector();
      console.log('Exited letter screen and returned to main.');
    }
  };
  window.addEventListener('keydown', letterScreenKeyListener);

  // Ensure bouncing image is hidden initially
  if (bouncingImg) {
      bouncingImg.style.display = 'none';
  }

  // Get loading screen elements
  loadingCatGif = document.getElementById('loading-cat-gif');
  loadingBar = document.querySelector('.loading-bar');
  loadingPercentageText = document.getElementById('loading-percentage');
  toastContainer = document.getElementById('toast-container');
  hackedScreen = document.getElementById('hacked-screen');
  hackedImage = document.getElementById('hacked-image');

  // Define the global volume adjustment listener once
  const handleVolumeAdjustment = (e) => {
      e.preventDefault();
      const volumeChange = e.deltaY > 0 ? -0.05 : 0.05;

      if (audio && !audio.paused) {
          audio.volume = Math.max(0, Math.min(1, audio.volume + volumeChange));
          console.log('Individual song volume changed to:', audio.volume);
      } else if (fireworksMusic && !fireworksMusic.paused) {
          fireworksMusic.volume = Math.max(0, Math.min(1, fireworksMusic.volume + volumeChange));
          console.log('Fireworks music volume changed to:', fireworksMusic.volume);
      } else if (mainBackgroundMusic && !mainBackgroundMusic.paused) {
          mainBackgroundMusic.volume = Math.max(0, Math.min(1, mainBackgroundMusic.volume + volumeChange));
          console.log('Main background music volume changed to:', mainBackgroundMusic.volume);
      }
  };

  // Attach the global volume listener for main screens
  window.addEventListener('wheel', handleVolumeAdjustment, { passive: false });

  // Volume control: if letter screen is open, always control its music
  window.addEventListener('wheel', function(e) {
    if (letterScreen && letterScreen.style.display !== 'none' && letterScreenMusic) {
      e.preventDefault();
      const volumeChange = e.deltaY > 0 ? -0.05 : 0.05;
      letterScreenMusic.volume = Math.max(0, Math.min(1, letterScreenMusic.volume + volumeChange));
      console.log('Letter screen music volume changed to:', letterScreenMusic.volume);
    }
  }, { passive: false });

  // Logic tải tài nguyên và cập nhật tiến độ
  let totalAssetsToLoad = 0;
  let loadedAssetsCount = 0;

  const updateLoadingProgress = () => {
    loadedAssetsCount++;
    const progress = Math.min(100, Math.floor((loadedAssetsCount / totalAssetsToLoad) * 100));

    if (loadingBar) {
      loadingBar.style.width = `${progress}%`;
    }
    if (loadingPercentageText) {
      loadingPercentageText.textContent = progress;
    }

    if (loadingCatGif && loadingBar && loadingBar.parentElement) {
      const barContainerWidth = loadingBar.parentElement.offsetWidth;
      const gifWidth = loadingCatGif.offsetWidth || 50; 
      
      const newLeftPx = (progress / 100) * barContainerWidth; 
      loadingCatGif.style.left = `${newLeftPx - (gifWidth / 2)}px`; 
    }
  };

  function handleAnswerSubmission() {
    const answer = answerInput.value.trim().toLowerCase();
    const correctAnswers = ["mĩ nữ"];

    if (correctAnswers.includes(answer)) {
      errorMessage.textContent = '';
      attemptsLeft = 3; // Reset attempts
      attemptsMessage.textContent = '';
      // Remove shake class if it was applied (e.g. from previous incorrect attempts)
      questionBox.classList.remove('shake');

      // Hide error gif if it was visible
      errorGifOverlay.classList.remove('visible');

      // NEW: Play a short sound to indicate success (if needed, otherwise remove)
      if (errorSound) {
        // errorSound.currentTime = 0;
        // errorSound.play(); // Consider a different success sound
        // setTimeout(() => {
        //   errorSound.pause();
        // }, 500); // Play for 0.5 seconds
      }

      setTimeout(() => {
        questionBox.style.display = 'none';
        splashScreen.classList.add('hidden');

        // Instead of showSongSelector(), now show Firework screen
        showFireworkScreen();
        console.log('Success screen shown.');

        if (mainBackgroundMusic) {
            mainBackgroundMusic.pause();
            mainBackgroundMusic.currentTime = 0;
            console.log('Main background music stopped.');
        }

        startFireworksEffect();
        if (fireworksMusic) {
          console.log('Attempting to load and play fireworks music...');
          fireworksMusic.currentTime = 0;
          fireworksMusic.load();

          fireworksMusic.play().then(() => {
            console.log('Fireworks music started playing successfully.');
            allowExitSuccessScreen = true;
            console.log('allowExitSuccessScreen set to true.');
          }).catch(error => {
            if (error.name === 'NotAllowedError') {
              console.error('Autoplay prevented for fireworks music. User interaction needed.');
              setTimeout(() => { allowExitSuccessScreen = true; console.log('Autoplay error: allowExitSuccessScreen set to true after delay.'); }, 1000);
            } else if (error.name === 'AbortError') {
              console.warn('Fireworks music play aborted. This often happens if play() is called, and then pause() or another play() is called rapidly afterwards.');
              setTimeout(() => { allowExitSuccessScreen = true; console.log('Abort error: allowExitSuccessScreen set to true after delay.'); }, 1000);
            } else {
              console.error('Error playing fireworks music:', error);
              setTimeout(() => { allowExitSuccessScreen = true; console.log('General error: allowExitSuccessScreen set to true after delay.'); }, 1000);
            }
          });
        }

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }

      }, 100); // Adjusted timeout to allow sound to play a bit (was 800 previously)

    } else {
      // Incorrect answer logic (already exists)
      attemptsLeft--;
      if (attemptsLeft > 0) {
        errorMessage.textContent = 'Sai rồi! Thử lại đi bé ơi!';
        attemptsMessage.textContent = `Còn ${attemptsLeft} lần thử.`;
        answerInput.value = ''; // NEW: Clear input field
        answerInput.focus(); // NEW: Focus on input field
        answerInput.disabled = true; // NEW: Disable input during GIF animation
        submitBtn.disabled = true; // NEW: Disable submit button during GIF animation
        questionBox.classList.add('shake');
        if (errorSound) {
          // errorSound.currentTime = 0;
          // errorSound.play();
        }
        errorGifOverlay.classList.add('visible');
        // NEW: Restart GIF animation
        const errorGifElement = document.getElementById('error-gif');
        if (errorGifElement) {
          errorGifElement.src = ''; // Clear src to reset GIF
          errorGifElement.src = 'https://raw.githubusercontent.com/gnid31/meo/refs/heads/main/gif/bite.gif'; // Set src again to restart
        }
        setTimeout(() => {
          questionBox.classList.remove('shake');
          errorGifOverlay.classList.remove('visible'); // NEW: Hide error gif after animation
          answerInput.disabled = false; // NEW: Enable input after GIF animation
          submitBtn.disabled = false; // NEW: Enable submit button after GIF animation
          answerInput.focus(); // Ensure focus returns after re-enabling
        }, baseGifDuration * (3 - attemptsLeft)); // Hide after N * baseGifDuration
      } else {
        errorMessage.textContent = 'Hết lượt rồi! Chuẩn bị ăn đấm!';
        attemptsMessage.textContent = '';
        questionBox.style.display = 'none';
        if (errorSound) {
          errorSound.pause(); // Stop error sound if it was playing
          errorSound.currentTime = 0;
        }
        errorGifOverlay.classList.remove('visible');
        // NEW: Play slaps sound when locked screen appears
        if (slapsSound) {
          slapsSound.play().catch(e => console.error("Error playing slaps sound:", e));
        }
        if (mainBackgroundMusic) {
            mainBackgroundMusic.pause();
            mainBackgroundMusic.currentTime = 0;
            console.log('Main background music stopped due to slaps sound.');
        }
        lockedScreen.style.display = 'flex';
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
      }
    }
  }

  if (claimButton && submitBtn && questionBox && answerInput) {
    claimButton.addEventListener('click', () => {
      questionBox.style.display = 'block';
      answerInput.focus();
      if (answerInput.value.trim() === '') {
        submitBtn.disabled = true;
      }
    });

    submitBtn.addEventListener('click', handleAnswerSubmission);

    answerInput.addEventListener('input', () => {
      if (answerInput.value.trim() === '') {
        submitBtn.disabled = true;
      } else {
        submitBtn.disabled = false;
      }
    });


    answerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (!submitBtn.disabled) {
          handleAnswerSubmission();
        }
      }
    });

    // This listener now handles F5 for locked screen AND general exit for success screen
    window.addEventListener('keydown', (e) => {
      // Only process F5 to reset when locked screen is visible
      if (e.key === 'F5' && lockedScreen.style.display === 'flex') {
        e.preventDefault(); // Prevent page reload

        attemptsLeft = 3;
        errorMessage.textContent = '';
        attemptsMessage.textContent = '';
        answerInput.value = '';
        lockedScreen.style.display = 'none';
        questionBox.style.display = 'block';
        answerInput.disabled = false;
        answerInput.focus();
        answerInput.dispatchEvent(new Event('input'));

        if (fireworkInterval) {
          clearInterval(fireworkInterval);
          fireworkInterval = null;
        }
        if (successScreensaver) {
          successScreensaver.style.display = 'none';
          if (fireworksMusic) {
            fireworksMusic.pause();
            fireworksMusic.currentTime = 0;
          }
          allowExitSuccessScreen = false;
          activeFireworkElements = [];
        }
        if (slapsSound) {
            slapsSound.pause();
            slapsSound.currentTime = 0;
            console.log('Slaps sound stopped due to F5 press.');
        }
        if (mainBackgroundMusic) {
            console.log('Attempting to play main background music after F5 reset...');
            mainBackgroundMusic.play().then(() => {
                console.log('Main background music started playing successfully after F5 reset.');
            }).catch(error => {
                console.error('Error playing main background music after F5 reset:', error);
            });
        }
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
      } else if (successScreensaver && successScreensaver.style.display === 'block' && allowExitSuccessScreen) {
        successScreensaver.style.display = 'none';
        if (fireworkInterval) {
          clearInterval(fireworkInterval);
          fireworkInterval = null;
        }
        if (fireworksMusic) {
          fireworksMusic.pause();
          fireworksMusic.currentTime = 0;
        }
        if (mainBackgroundMusic) {
            console.log('Attempting to play main background music upon success screen exit...');
            mainBackgroundMusic.play().catch(error => {
                console.error('Error playing main background music on success screen exit:', error);
            });
        }
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
      }
    });
  } else {
    console.error('Một hoặc nhiều phần tử không được tìm thấy trong DOM.');
  }

  // Show loading screen immediately
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
  }

  // Pre-calculate total assets by fetching asset lists
  const [listText, wallpaperText, assetsText] = await Promise.all([
      fetch('https://raw.githubusercontent.com/gnid31/meo/refs/heads/main/list.txt').then(res => res.text()).catch(() => ''),
      fetch('https://raw.githubusercontent.com/gnid31/meo/main/wallpaper.txt').then(res => res.text()).catch(() => ''),
      fetch('https://raw.githubusercontent.com/gnid31/meo/main/assets.txt').then(res => res.text()).catch(() => '')
  ]);

  totalAssetsToLoad += listText.split('\n').filter(url => url.trim() !== '').length;
  totalAssetsToLoad += wallpaperText.split('\n').filter(url => url.trim() !== '').length;
  totalAssetsToLoad += assetsText.split('\n').map(asset => asset.trim()).filter(asset => asset !== '').length;
  
  // NEW: Add letter screen assets to totalAssetsToLoad
  totalAssetsToLoad += 2; // For envelope.png and letter.png

  if (totalAssetsToLoad === 0) {
      totalAssetsToLoad = 1;
  }

  // Collect all individual asset promises
  const allAssetPromises = [
    ...(await loadWallpaperImages(updateLoadingProgress)),
    ...(await loadSuccessScreenAssets(updateLoadingProgress)),
    ...(await preloadBouncingImages(updateLoadingProgress)) // NEW: Ensure bouncing images are preloaded
  ];

  // Wait for all individual assets to load
  await Promise.allSettled(allAssetPromises);

  console.log('All assets loaded. Hiding loading screen.');
  if (loadingBar) {
      loadingBar.style.width = '100%';
  }
  if (loadingPercentageText) {
      loadingPercentageText.textContent = '100';
  }
  if (loadingCatGif) {
      const barContainerWidth = loadingBar.parentElement.offsetWidth;
      const gifWidth = loadingCatGif.offsetWidth || 50;
      const newLeftPx = barContainerWidth;
      loadingCatGif.style.left = `${newLeftPx - (gifWidth / 2)}px`;
  }
  loadingScreen.classList.add('hidden');
  loadingScreen.addEventListener('transitionend', () => {
    loadingScreen.style.display = 'none';
    // NEW: Show hacked screen after loading is complete
    hackedScreen.style.display = 'flex';
    startHackedTypingEffect(); // Start the typing effect
    toggleSnowfall(true); // Bắt đầu tuyết rơi trên màn hình hacked
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }, { once: true });
  
  // Add a small delay before hiding loading screen and showing appropriate screen
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
    
    // NEW: Show hacked screen immediately after loading is done
    if (hackedScreen) {
        hackedScreen.style.display = 'flex';
        startHackedTypingEffect(); // Start the typing effect
        toggleSnowfall(true); // Bắt đầu tuyết rơi trên màn hình hacked
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
    }
    
    // Ensure other screens are hidden initially
    if (signinScreen) { signinScreen.style.display = 'none'; }
    if (blackScreen) { blackScreen.style.display = 'none'; }
    if (bsodScreen) { bsodScreen.style.display = 'none'; }
    if (splashScreen) { splashScreen.style.display = 'none'; } // Ensure splashScreen is hidden
    if (letterScreen) { letterScreen.style.display = 'none'; } // NEW: Ensure letterScreen is hidden
  }, 300); // 300ms delay

  console.log('Hoàn thành tải ảnh');
  // Ban đầu vô hiệu hóa nút submit nếu input rỗng
  if (answerInput.value.trim() === '') {
    submitBtn.disabled = true;
  }

  // Start background change only after wallpapers are loaded
  startBackgroundChange();

  // Sign-in logic
  if (signinButton && usernameInput && passwordInput && gnidsBirthdayInput && signinErrorMessage && splashScreen && anotherInput) {
      const correctUsername = ['Kim Thuý Hằng', 'Kim Thúy Hằng'];
      const correctPassword = '08/08/2004';
      const correctGnidsBirthday = '03/01/2004';
      const correctAnotherField1 = '10/07/2004';
      const correctAnotherField2 = '10/08/2004';

      const handleSignIn = () => {
          // Determine if login was successful
          lastLoginWasSuccessful = (correctUsername.includes(usernameInput.value) &&
                                  passwordInput.value === correctPassword &&
                                  gnidsBirthdayInput.value === correctGnidsBirthday &&
                                  (anotherInput.value === correctAnotherField1 || anotherInput.value === correctAnotherField2));

          if (!firstSignInAttemptDone) {
              // This is the FIRST sign-in attempt
              firstSignInAttemptDone = true; // Mark as done

              signinScreen.classList.add('hidden'); // Hide sign-in screen
              toggleSnowfall(false); // Dừng tuyết rơi khi ẩn màn hình đăng nhập
              
              // Show black screen and request fullscreen
              if (blackScreen) {
                  blackScreen.style.display = 'flex';
                  if (document.documentElement.requestFullscreen) {
                      document.documentElement.requestFullscreen();
                  } else if (document.documentElement.mozRequestFullScreen) {
                      document.documentElement.mozRequestFullScreen();
                  } else if (document.documentElement.webkitRequestFullscreen) {
                      document.documentElement.webkitRequestFullscreen();
                  } else if (document.documentElement.msRequestFullscreen) {
                      document.documentElement.msRequestFullscreen();
                  }
                  console.log('Black screen displayed and fullscreen requested after FIRST sign-in button click.');
                  // Tự động chuyển sang BSOD sau 10 giây
                  setTimeout(() => {
                      handleBlackScreenInteraction();
                  }, 3000); // 10000 milliseconds = 10 giây
                  if (mainBackgroundMusic) {
                      mainBackgroundMusic.pause();
                      mainBackgroundMusic.currentTime = 0;
                      console.log('Main background music paused when black screen is displayed.');
                  }
              }
          } else {
              // Subsequent sign-in attempts
              if (correctUsername.includes(usernameInput.value) && lastLoginWasSuccessful) {
                  signinScreen.classList.add('hidden'); // Hide sign-in screen
                  toggleSnowfall(false); // Dừng tuyết rơi khi ẩn màn hình đăng nhập
                  

                  // CHỈNH SỬA: Chuyển đến màn hình hộp bí ẩn (splash-screen)
                  splashScreen.style.display = 'flex'; // HIỂN THỊ MÀN HÌNH HỘP BÍ ẨN
                  splashScreen.classList.remove('hidden'); // Đảm bảo nó hiển thị đúng cách
                  questionBox.style.display = 'none'; // Đảm bảo hộp câu hỏi bị ẩn

                  // NEW: Khi vào màn song-selector, bật lại tuyết rơi
                  setTimeout(() => { toggleSnowfall(true); }, 350);

                  console.log('Subsequent login successful. Moving to Splash Screen.');
                  // Ensure error message is hidden upon successful login (if it was ever shown before)
                  if (signinErrorMessage) {
                      signinErrorMessage.textContent = '';
                      signinErrorMessage.style.display = 'none';
                  }
              } else {
                  // If login unsuccessful, stay on sign-in screen and show error
                  showToast('khéo khéo', 1000); // Gọi showToast mỗi lần đăng nhập sai

                  setupPasswordToggle(passwordInput, toggleDobPassword);
                  setupPasswordToggle(gnidsBirthdayInput, toggleGnidPassword);
                  setupPasswordToggle(anotherInput, toggleAnotherPassword);
                  console.log('Subsequent login unsuccessful. Remaining on Sign-in Screen.');
              }
          }
      };

      signinButton.addEventListener('click', handleSignIn);

      usernameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              passwordInput.focus();
          }
      });

      passwordInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              gnidsBirthdayInput.focus();
          }
      });

      gnidsBirthdayInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              anotherInput.focus();
          }
      });

      // Add event listener for the last input field to trigger sign-in on Enter
      anotherInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              e.preventDefault(); // Prevent default form submission behavior
              signinButton.click(); // Programmatically click the sign-in button
          }
      });

      // Logic for password toggle icons
      const setupPasswordToggle = (inputElement, toggleIcon) => {
          if (!inputElement || !toggleIcon) {
              console.warn('Input element or toggle icon not found for setup:', inputElement, toggleIcon);
              return;
          }

          // Hiện icon khi có ký tự, ẩn khi rỗng
          const checkInputForIconVisibility = () => {
              if (inputElement.value.length > 0) {
                  toggleIcon.classList.add('visible');
              } else {
                  toggleIcon.classList.remove('visible');
                  // Đảm bảo icon luôn về trạng thái fa-eye khi ẩn
                  toggleIcon.classList.remove('fa-eye-slash');
                  toggleIcon.classList.add('fa-eye');
                  inputElement.setAttribute('type', 'password');
              }
          };
          inputElement.addEventListener('input', checkInputForIconVisibility);
          checkInputForIconVisibility();

          // Đảm bảo trạng thái ban đầu là fa-eye
          toggleIcon.classList.remove('fa-eye-slash');
          toggleIcon.classList.add('fa-eye');

          toggleIcon.addEventListener('click', () => {
              const isPassword = inputElement.getAttribute('type') === 'password';
              inputElement.setAttribute('type', isPassword ? 'text' : 'password');
              toggleIcon.classList.toggle('fa-eye');
              toggleIcon.classList.toggle('fa-eye-slash');
          });
      };

      setupPasswordToggle(passwordInput, toggleDobPassword);
      setupPasswordToggle(gnidsBirthdayInput, toggleGnidPassword);
      setupPasswordToggle(anotherInput, toggleAnotherPassword);

  } else {
      console.error('Một hoặc nhiều phần tử đăng nhập không được tìm thấy trong DOM.');
  }

  // Listener to exit BSOD screen
  window.addEventListener('keydown', (e) => {
      const allowedKeys = ['I', 'U', 'H', 'A', 'N', 'G'];
      if (bsodScreen.style.display === 'flex' && allowedKeys.includes(e.key.toUpperCase())) {
          e.preventDefault();
          bsodScreen.style.display = 'none';
          
          if (lastLoginWasSuccessful) {
              // If login was successful, go to the question box
              questionBox.style.display = 'block';
              answerInput.focus();
              console.log('Login successful after BSOD. Moving to Question Box.');
              toggleSnowfall(true); // Bật tuyết rơi khi vào question-box sau BSOD
          } else {
              // If login was unsuccessful, go back to sign-in screen
              if (signinScreen) {
                  signinScreen.style.display = 'flex';
                  usernameInput.focus();
                  console.log('Login unsuccessful after BSOD. Returning to Sign-in Screen.');
                  toggleSnowfall(true); // Bật tuyết rơi khi quay lại màn hình đăng nhập

                  // Play main background music when sign-in screen is shown (only once)
                  if (mainBackgroundMusic && !mainBackgroundMusic.paused) {
                      mainBackgroundMusic.currentTime = 0; // Đảm bảo nhạc bắt đầu từ đầu
                  }
                  if (mainBackgroundMusic && mainMusicStartedOnSignInScreen === false) {
                      mainBackgroundMusic.play().then(() => {
                          console.log('Main background music started playing successfully on sign-in screen after BSOD exit.');
                          mainMusicStartedOnSignInScreen = true;
                      }).catch(error => {
                          console.error('Error playing main background music on sign-in screen after BSOD exit:', error);
                      });
                  }
              }
          }
      }
  });

  // Loại bỏ các listener tương tác người dùng cho màn hình đen
  document.addEventListener('keydown', (event) => {
      if (blackScreen.style.display === 'block') {
          if (event.key === 'Escape' || event.key === 'F11') {
              event.preventDefault(); // Ngăn chặn hành vi mặc định của phím (nếu có)
              console.log(`Phím ${event.key} bị ngăn chặn trên màn hình đen.`);
          }
      }
  });
  console.log('Đã cập nhật listeners cho màn hình đen.');


  // Add event listeners for the BSOD screen to return to sign-in or mystery box
  if (bsodScreen) {
      document.addEventListener('keydown', (event) => {
          const allowedKeysForBSODExit = ['I', 'U', 'H', 'A', 'N', 'G'];
          if (bsodScreen.style.display === 'flex') {
              if (allowedKeysForBSODExit.includes(event.key.toUpperCase())) {
                  event.preventDefault();
                  handleBSODInteraction();
                  console.log('Phím I, U, H, A, N, G được nhấn trên màn hình BSOD.');
              } else if (event.key === 'F11') {
                  event.preventDefault(); // Ngăn chặn hành vi mặc định của phím (nếu có)
                  console.log(`Phím ${event.key} bị ngăn chặn trên màn hình BSOD.`);
              } else if (!allowedKeysForBSODExit.includes(event.key.toUpperCase())) {
                  event.preventDefault(); // Prevent any other key from doing anything
                  console.log(`Phím ${event.key} bị ngăn chặn trên màn hình BSOD.`);
              }
          }
      });
      console.log('Đã cập nhật listeners cho màn hình BSOD để chỉ thoát bằng I, U, H, A, N, G.');
  }

  // Hiệu ứng băng chuyền cho các nút nhạc
  (function setupCarousel() {
    const track = document.getElementById('carousel-track');
    const songButtons = document.getElementById('song-buttons');
    if (!track || !songButtons) return;

    // Chỉ clone nếu chưa có clone
    if (!songButtons.querySelector('.carousel-clone')) {
      const buttons = Array.from(songButtons.children);
      buttons.forEach(btn => {
        const clone = btn.cloneNode(true);
        clone.classList.add('carousel-clone');
        songButtons.appendChild(clone);
      });
    }

    // Tính width 1 button + gap
    const button = songButtons.querySelector('button');
    if (!button) return;
    const buttonWidth = button.offsetWidth;
    const gap = parseInt(getComputedStyle(songButtons).gap) || 0;
    const totalButtons = songButtons.children.length / 2; // chỉ tính dãy gốc

    // Tổng width cho 1 dãy gốc
    const totalWidth = (buttonWidth + gap) * totalButtons;
    const duplicatedTotalWidth = totalWidth * 2;
    const halfTotalWidth = duplicatedTotalWidth / 2;

    // Set biến CSS cho keyframes
    track.style.setProperty('--total-width', `${halfTotalWidth}px`);

    // Tính duration dựa trên tổng width
    const baseDuration = 40; // seconds
    const baseWidth = 5000; // px
    const scrollDuration = (halfTotalWidth / baseWidth) * baseDuration;
    track.style.setProperty('--scroll-duration', `${scrollDuration}s`);

    // Thêm class để kích hoạt animation
    track.classList.add('carousel-track-animate');
  })();

  // ...rest of the code...

  async function preloadBouncingImages(progressCallback) {
    console.log("Preloading bouncing images...");
    const listTxtUrl = 'https://raw.githubusercontent.com/gnid31/meo/main/list.txt';

    try {
        const listResponse = await fetch(listTxtUrl);
        const listText = await listResponse.text();
        const imageUrls = listText.split('\n').map(s => s.trim()).filter(s => s !== '');
        const totalImages = imageUrls.length;
        let loadedImages = 0;

        const imagePromises = imageUrls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    loadedImages++;
                    if (progressCallback) {
                        progressCallback(loadedImages, totalImages, 'Preloading Bouncing Images');
                    }
                    resolve(img);
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${url}`);
                    loadedImages++;
                    if (progressCallback) {
                        progressCallback(loadedImages, totalImages, 'Preloading Bouncing Images');
                    }
                    resolve(null); // Resolve with null to not block if an image fails
                };
            });
        });

        preloadedBouncingImages = (await Promise.all(imagePromises)).filter(img => img !== null);
        console.log(`Preloaded ${preloadedBouncingImages.length} bouncing images.`);
        return preloadedBouncingImages;

    } catch (error) {
        console.error('Error preloading bouncing images:', error);
        return [];
    }
}
});

async function loadWallpaperImages(progressCallback) {
    try {
        console.log('Attempting to load wallpaper image URLs from wallpaper.txt...');
        const timestamp = new Date().getTime();
        const response = await fetch(`https://raw.githubusercontent.com/gnid31/meo/main/wallpaper.txt?t=${timestamp}`);
        if (!response.ok) {
            console.error(`Failed to fetch wallpaper.txt: HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const urls = text.split('\n').filter(url => url.trim() !== '');
        
        const promises = urls.map(url => {
            return new Promise(resolve => {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    wallpaperImageUrls.push(url);
                    if (progressCallback) progressCallback();
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to preload wallpaper image: ${url}`);
                    if (progressCallback) progressCallback();
                    resolve();
                };
            });
        });
        console.log('Đã tạo Promises cho ảnh nền. Số lượng:', promises.length);
        return promises;
    } catch (error) {
        console.error('Error loading wallpaper images from wallpaper.txt:', error);
        body.style.backgroundImage = `url("C:/Users/ADMIN/Desktop/meomeo/wallpaper/e82e59a091fccfe88d581ef7dc56f070.jpg")`;
        return [];
    }
}

async function loadSuccessScreenAssets(progressCallback) {
    try {
        console.log('Attempting to load success screen assets from assets.txt...');
        const timestamp = new Date().getTime();
        const response = await fetch(`https://raw.githubusercontent.com/gnid31/meo/main/assets.txt?t=${timestamp}`);
        if (!response.ok) {
            console.error(`Failed to fetch assets.txt: HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const assets = text.split('\n').map(asset => asset.trim()).filter(asset => asset !== '');
        
        const promises = assets.map(asset => {
            return new Promise(resolve => {
                const isImage = /\.(gif|jpe?g|png|webp)$/i.test(asset);
                if (isImage) {
                    const img = new Image();
                    img.src = asset;
                    img.onload = () => {
                        successScreenAssets.push(asset);
                        if (progressCallback) progressCallback();
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn(`Failed to preload success screen asset image: ${asset}`);
                        successScreenAssets.push(asset);
                        if (progressCallback) progressCallback();
                        resolve();
                    };
                } else {
                    successScreenAssets.push(asset);
                    if (progressCallback) progressCallback();
                    resolve();
                }
            });
        });
        await Promise.allSettled(promises);
        shuffledSuccessScreenAssets = shuffleArray([...successScreenAssets]);
        console.log('Successfully loaded and shuffled success screen assets. Count:', successScreenAssets.length);
        console.log('Loaded assets:', successScreenAssets);
        return promises;
    } catch (error) {
        console.error('Error loading success screen assets from assets.txt:', error);
        successScreenAssets = ["Chúc mừng!", "https://raw.githubusercontent.com/gnid31/meo/refs/heads/main/gif/box.gif"];
        shuffledSuccessScreenAssets = shuffleArray([...successScreenAssets]);
        return [];
    }
}

function handleBlackScreenInteraction() {
    console.log('Tương tác trên màn hình đen, chuyển sang BSOD.');
    blackScreen.style.display = 'none'; // Ẩn màn hình đen
    bsodScreen.style.display = 'flex'; // Hiển thị màn hình BSOD
    if (mainBackgroundMusic) {
      mainBackgroundMusic.pause();
      mainBackgroundMusic.currentTime = 0;
      console.log('Main background music paused when BSOD screen is displayed.');
    }
    // Khi vào BSOD, không bật/tắt tuyết rơi ở đây
}

function handleBSODInteraction() {
    console.log('Tương tác trên màn hình BSOD, thoát BSOD.');
    bsodScreen.style.display = 'none'; // Ẩn màn hình BSOD

    if (lastLoginWasSuccessful) {
        // Nếu đăng nhập đúng, chỉ chuyển đến màn hình hộp bí ẩn (splashScreen)
        signinScreen.style.display = 'none'; // Ẩn màn hình đăng nhập
        signinScreen.classList.add('hidden');
        // Không tắt tuyết rơi ở đây

        splashScreen.style.display = 'flex'; // HIỂN THỊ MÀN HÌNH HỘP BÍ ẨN
        splashScreen.classList.remove('hidden');
        questionBox.style.display = 'none'; // Đảm bảo hộp câu hỏi bị ẩn
        toggleSnowfall(true); // Bật tuyết rơi khi vào splash
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }

        console.log('Sau BSOD: Đăng nhập đúng, chuyển đến màn hình hộp bí ẩn.');
        if (mainBackgroundMusic) { 
            mainBackgroundMusic.play().then(() => {
                mainMusicStartedOnMysteryBox = true; 
                console.log('Nhạc nền chính đã phát sau BSOD và chuyển đến Mystery Box.');
            }).catch(error => {
                console.error('Lỗi khi phát nhạc nền chính sau BSOD và chuyển đến Mystery Box:', error);
            });
        }
    } else {
        // Nếu đăng nhập sai, quay trở lại màn hình đăng nhập
        signinScreen.style.display = 'flex';
        signinScreen.classList.remove('hidden');
        splashScreen.style.display = 'none';
        splashScreen.classList.add('hidden');
        toggleSnowfall(true); // Bật tuyết rơi khi quay lại màn hình đăng nhập
        if (mainBackgroundMusic && !mainBackgroundMusic.paused) {
          mainBackgroundMusic.currentTime = 0; // Đảm bảo nhạc bắt đầu từ đầu
        }
        if (mainBackgroundMusic && mainMusicStartedOnSignInScreen === false) {
            mainBackgroundMusic.play().then(() => {
                console.log('Main background music started playing successfully on sign-in screen after BSOD exit (from handleBSODInteraction).');
                mainMusicStartedOnSignInScreen = true;
            }).catch(error => {
                console.error('Error playing main background music on sign-in screen after BSOD exit (from handleBSODInteraction):', error);
            });
        }
    }
}

// NEW: showToast function for notifications
function showToast(message, duration = 3000) {
  if (!toastContainer) {
    console.error('Toast container not found.');
    return;
  }

  // Remove any existing toasts of the same type before adding a new one
  const existingToasts = toastContainer.querySelectorAll('.toast');
  existingToasts.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Force reflow to enable transition
  void toast.offsetWidth;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    // Remove the toast from the DOM after the hide transition completes
    toast.addEventListener('transitionend', () => {
      toast.remove();
    }, { once: true });
  }, duration);
}