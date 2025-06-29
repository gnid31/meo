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

const songList = [
  "https://github.com/gnid31/meo/raw/main/music/id_072019.mp3",
  "https://github.com/gnid31/meo/raw/main/music/uoc_gi.mp3",
  "https://github.com/gnid31/meo/raw/main/music/hen_mot_mai.mp3",
  "https://github.com/gnid31/meo/raw/main/music/am_tham_ben_em.mp3",
  "https://github.com/gnid31/meo/raw/main/music/neu_ngay_ay.mp3",
  "https://github.com/gnid31/meo/raw/main/music/gia_nhu_em_nhin_lai.mp3",
];

let screensaverKeyListener = null;

function showScreensaver(songUrl) {
    screensaver.style.display = 'block';
    console.log('Song screensaver shown.');
    console.log('Current bouncingImages array length:', bouncingImages.length);

    if (screensaverKeyListener) {
        window.removeEventListener('keydown', screensaverKeyListener);
        screensaverKeyListener = null;
    }

    if (mainBackgroundMusic) {
        mainBackgroundMusic.pause();
        mainBackgroundMusic.currentTime = 0;
        console.log('Main background music stopped for individual song screensaver.');
    }

    if (myAudio) {
        myAudio.src = songUrl;
        myAudio.load();
        myAudio.play().then(() => {
            console.log('Individual song started playing successfully.');
        }).catch(error => {
            console.error('Error playing individual song:', error);
        });

        myAudio.onended = () => {
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

            if (mainBackgroundMusic) {
                console.log('Attempting to play main background music after song ended.');
                mainBackgroundMusic.play().catch(error => {
                    console.error('Error playing main background music after song ended:', error);
                });
            }
            if (screensaverKeyListener) {
                window.removeEventListener('keydown', screensaverKeyListener);
                screensaverKeyListener = null;
            }
            myAudio.onended = null;
        };
    }

    if (bouncingImg && bouncingImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * bouncingImages.length);
        bouncingImg.src = bouncingImages[randomIndex].src;
        console.log('Bouncing image src set to:', bouncingImg.src);
        bouncingImg.style.display = 'block';
        bouncingImg.style.position = 'absolute';

        if (bouncingImageAnimation) {
            clearInterval(bouncingImageAnimation);
        }

        let currentX = Math.random() * (window.innerWidth - bouncingImg.offsetWidth);
        let currentY = Math.random() * (window.innerHeight - bouncingImg.offsetHeight);
        let dx = 2
        let dy = 1

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

            if (collided && bouncingImages.length > 1) {
                let newImageSrc;
                let attempts = 0;
                do {
                    const randomIndex = Math.floor(Math.random() * bouncingImages.length);
                    newImageSrc = bouncingImages[randomIndex].src;
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
        console.warn('bouncingImg hoặc bouncingImages chưa sẵn sàng cho màn hình chờ bài hát. Bỏ qua hoạt ảnh nhảy.');
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
        }
    };

    window.addEventListener('keydown', screensaverKeyListener);
}

function playSong(index) {
  const songUrl = songList[index];
  showScreensaver(songUrl);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Gán các biến DOM element ở đây
  screensaver = document.getElementById("screensaver");
  bouncingImg = document.getElementById("bouncing-image");
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
  
  // Get the black screen and BSOD elements
  blackScreen = document.getElementById('black-screen');
  bsodScreen = document.getElementById('bsod-screen');
  bsodImage = document.getElementById('bsod-image');

  // Ensure bouncing image is hidden initially
  if (bouncingImg) {
      bouncingImg.style.display = 'none';
  }

  // Get loading screen elements
  loadingCatGif = document.getElementById('loading-cat-gif');
  loadingBar = document.querySelector('.loading-bar');
  loadingPercentageText = document.getElementById('loading-percentage');
  toastContainer = document.getElementById('toast-container');

  // Define the global volume adjustment listener once
  const handleVolumeAdjustment = (e) => {
      e.preventDefault();
      const volumeChange = e.deltaY > 0 ? -0.05 : 0.05;

      if (myAudio && !myAudio.paused) {
          myAudio.volume = Math.max(0, Math.min(1, myAudio.volume + volumeChange));
          console.log('Individual song volume changed to:', myAudio.volume);
      } else if (fireworksMusic && !fireworksMusic.paused) {
          fireworksMusic.volume = Math.max(0, Math.min(1, fireworksMusic.volume + volumeChange));
          console.log('Fireworks music volume changed to:', fireworksMusic.volume);
      } else if (mainBackgroundMusic && !mainBackgroundMusic.paused) {
          mainBackgroundMusic.volume = Math.max(0, Math.min(1, mainBackgroundMusic.volume + volumeChange));
          console.log('Main background music volume changed to:', mainBackgroundMusic.volume);
      }
  };

  // Attach the global volume listener
  window.addEventListener('wheel', handleVolumeAdjustment, { passive: false });

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
    const correctAnswer = '107';
    if (answerInput.value.trim() === correctAnswer) {
      questionBox.style.display = 'none';
      splashScreen.classList.add('hidden');

      successScreensaver.style.display = 'block';
      console.log('Success screen shown.');

      if (mainBackgroundMusic) {
          mainBackgroundMusic.pause();
          mainBackgroundMusic.currentTime = 0;
          console.log('Main background music stopped.');
      }

      setTimeout(() => {
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
      }, 100);

    } else {
      attemptsLeft--;
      answerInput.disabled = true;
      submitBtn.disabled = true;

      questionBox.classList.add('shake');

      if (attemptsLeft > 0) {
        errorGifOverlay.querySelector('#error-gif').src = '';
        errorGifOverlay.querySelector('#error-gif').src = 'https://raw.githubusercontent.com/gnid31/meo/refs/heads/main/gif/bite.gif';

        errorGifOverlay.classList.add('visible');

        const currentGifDuration = baseGifDuration * (3 - attemptsLeft);
        setTimeout(() => {
          errorGifOverlay.classList.remove('visible');
          answerInput.disabled = false;
          answerInput.focus();
          questionBox.classList.remove('shake');
        }, currentGifDuration);
      } else {
        questionBox.classList.remove('shake');
      }

      if (attemptsLeft <= 0) {
        questionBox.style.display = 'none';
        if (slapsSound) {
            slapsSound.currentTime = 0;
            slapsSound.play().catch(e => console.error('Error playing slaps sound:', e));
        }
        if (errorSound) {
            errorSound.pause();
            errorSound.currentTime = 0;
        }
        if (mainBackgroundMusic) {
            mainBackgroundMusic.pause();
            mainBackgroundMusic.currentTime = 0;
            console.log('Main background music stopped due to slaps sound.');
        }
        lockedScreen.style.display = 'flex';
      } else {
        errorMessage.textContent = 'Sai rồi, lêu lêu!';
        attemptsMessage.textContent = `Còn ${attemptsLeft} lần nhập thôi nha!`;
        answerInput.value = '';
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

  if (totalAssetsToLoad === 0) {
      totalAssetsToLoad = 1;
  }

  // Collect all individual asset promises
  const allAssetPromises = [
    ...(await loadImages(updateLoadingProgress)),
    ...(await loadWallpaperImages(updateLoadingProgress)),
    ...(await loadSuccessScreenAssets(updateLoadingProgress))
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
  
  // Add a small delay before hiding loading screen and showing appropriate screen
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
    
    // Show sign-in screen immediately after loading is done
    if (signinScreen) {
        signinScreen.style.display = 'flex';
        usernameInput.focus(); // Focus on username input
        toggleSnowfall(true); // Bắt đầu tuyết rơi trên màn hình đăng nhập
    }
    
    // Ensure blackScreen, bsodScreen and splashScreen are hidden initially
    if (blackScreen) { blackScreen.style.display = 'none'; }
    if (bsodScreen) { bsodScreen.style.display = 'none'; }
    if (splashScreen) { splashScreen.style.display = 'none'; } // Ensure splashScreen is hidden
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
      const correctUsername = 'Kim Thuý Hằng';
      const correctPassword = '08/08/2004';
      const correctGnidsBirthday = '03/01/2004';
      const correctAnotherField1 = '10/07/2004';
      const correctAnotherField2 = '10/08/2004';

      const handleSignIn = () => {
          // Determine if login was successful
          lastLoginWasSuccessful = (usernameInput.value === correctUsername &&
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
                  }, 10000); // 10000 milliseconds = 10 giây
              }
          } else {
              // Subsequent sign-in attempts
              if (lastLoginWasSuccessful) {
                  signinScreen.classList.add('hidden'); // Hide sign-in screen
                  toggleSnowfall(false); // Dừng tuyết rơi khi ẩn màn hình đăng nhập
                  
                  // CHỈNH SỬA: Chuyển đến màn hình hộp bí ẩn (splash-screen)
                  splashScreen.style.display = 'flex'; // HIỂN THỊ MÀN HÌNH HỘP BÍ ẨN
                  splashScreen.classList.remove('hidden'); // Đảm bảo nó hiển thị đúng cách
                  questionBox.style.display = 'none'; // Đảm bảo hộp câu hỏi bị ẩn

                  console.log('Subsequent login successful. Moving to Splash Screen.');
                  // Ensure error message is hidden upon successful login (if it was ever shown before)
                  if (signinErrorMessage) {
                      signinErrorMessage.textContent = '';
                      signinErrorMessage.style.display = 'none';
                  }
              } else {
                  // If login unsuccessful, stay on sign-in screen and show error
                  showToast('Khéo khéo'); // Gọi showToast mỗi lần đăng nhập sai

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

          const checkInputForIconVisibility = () => {
              if (inputElement.value.length > 0) {
                  toggleIcon.classList.add('visible');
              } else {
                  toggleIcon.classList.remove('visible');
              }
          };

          inputElement.addEventListener('input', checkInputForIconVisibility);
          checkInputForIconVisibility(); 

          toggleIcon.addEventListener('click', () => {
              const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
              inputElement.setAttribute('type', type);
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
      if (bsodScreen.style.display === 'flex' && (e.key === 'Escape' || e.key === 'F5')) {
          e.preventDefault();
          bsodScreen.style.display = 'none';
          
          if (lastLoginWasSuccessful) {
              // If login was successful, go to the question box
              questionBox.style.display = 'block';
              answerInput.focus();
              console.log('Login successful after BSOD. Moving to Question Box.');
              toggleSnowfall(false); // Dừng tuyết rơi khi thoát BSOD sau đăng nhập thành công
          } else {
              // If login was unsuccessful, go back to sign-in screen
              if (signinScreen) {
                  signinScreen.style.display = 'flex';
                  usernameInput.focus();
                  console.log('Login unsuccessful after BSOD. Returning to Sign-in Screen.');
                  toggleSnowfall(true); // Bắt đầu tuyết rơi khi quay lại màn hình đăng nhập

                  // Play main background music when sign-in screen is shown (only once)
                  if (mainBackgroundMusic && !mainMusicStartedOnSignInScreen) {
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
          if (bsodScreen.style.display === 'flex') {
              if (event.key === 'Enter') { // Chỉ xử lý khi phím Enter được nhấn
                  handleBSODInteraction();
                  console.log('Phím Enter được nhấn trên màn hình BSOD.');
              } else if (event.key === 'Escape' || event.key === 'F11') {
                  event.preventDefault(); // Ngăn chặn hành vi mặc định của phím (nếu có)
                  console.log(`Phím ${event.key} bị ngăn chặn trên màn hình BSOD.`);
              }
          }
      });
      console.log('Đã cập nhật listeners cho màn hình BSOD để chỉ thoát bằng Enter.');
  }
});


const bouncingImages = [];

async function loadImages(progressCallback) {
  console.log('Bắt đầu tải danh sách ảnh bouncing...');
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`https://raw.githubusercontent.com/gnid31/meo/refs/heads/main/list.txt?t=${timestamp}`);
    const text = await response.text();
    const imageUrls = text.split('\n').filter(url => url.trim() !== '');
    console.log('Số lượng URL ảnh bouncing đọc được từ list.txt:', imageUrls.length);

    const promises = imageUrls.map(url => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          bouncingImages.push(img);
          if (progressCallback) progressCallback();
          console.log('Đã tải thành công ảnh bouncing:', url);
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load bouncing image: ${url}`);
          if (progressCallback) progressCallback();
          resolve();
        };
      });
    });
    console.log('Đã tạo Promises cho ảnh bouncing. Tổng số:', promises.length);
    return promises;
  } catch (error) {
    console.error('Error loading bouncing image list:', error);
    return [];
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
    // Đảm bảo không có nhạc phát ở đây
}

function handleBSODInteraction() {
    console.log('Tương tác trên màn hình BSOD, thoát BSOD.');
    bsodScreen.style.display = 'none'; // Ẩn màn hình BSOD

    if (lastLoginWasSuccessful) {
        // Nếu đăng nhập đúng, chuyển đến màn hình hộp bí ẩn (splash-screen)
        signinScreen.style.display = 'none'; // Đảm bảo màn hình đăng nhập bị ẩn
        signinScreen.classList.add('hidden'); // Đảm bảo ẩn đúng cách
        toggleSnowfall(false); // Dừng tuyết rơi khi thoát BSOD sau đăng nhập thành công

        splashScreen.style.display = 'flex'; // HIỂN THỊ MÀN HÌNH HỘP BÍ ẨN
        splashScreen.classList.remove('hidden'); // Đảm bảo nó hiển thị đúng cách

        questionBox.style.display = 'none'; // Đảm bảo hộp câu hỏi bị ẩn (vì phải click Unbox từ splash-screen)

        console.log('Sau BSOD: Đăng nhập đúng, chuyển đến màn hình hộp bí ẩn.');
        if (mainBackgroundMusic) { 
            // Đảm bảo nhạc nền chính được phát khi hiển thị màn hình hộp bí ẩn
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
        signinScreen.classList.remove('hidden'); // Đảm bảo nó hiển thị
        splashScreen.style.display = 'none'; // Đảm bảo màn hình hộp bí ẩn bị ẩn
        splashScreen.classList.add('hidden'); // Đảm bảo ẩn đúng cách
        questionBox.style.display = 'none'; // Đảm bảo hộp câu hỏi bị ẩn
        console.log('Sau BSOD: Đăng nhập sai, quay lại màn hình đăng nhập.');
        toggleSnowfall(true); // Bắt đầu tuyết rơi khi quay lại màn hình đăng nhập
        if (mainBackgroundMusic && !mainMusicStartedOnSignInScreen) {
            mainBackgroundMusic.play().then(() => {
                mainMusicStartedOnSignInScreen = true;
                console.log('Nhạc nền chính đã phát sau BSOD và quay lại màn đăng nhập.');
            }).catch(error => {
                console.error('Lỗi khi phát nhạc nền chính sau BSOD và quay lại màn đăng nhập:', error);
            });
        }
    }
}

// Helper function to show a toast notification
function showToast(message, duration = 3000) {
    // NEW: Xóa tất cả các toast cũ trước khi thêm toast mới
    while (toastContainer.firstChild) {
        toastContainer.removeChild(toastContainer.firstChild);
    }

    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Force reflow to ensure animation plays
    void toast.offsetWidth;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');

        // Remove the toast element after its hide animation completes
        // Use a fallback setTimeout in case transitionend doesn't fire reliably
        const transitionDurationMs = 500; // 0.5s from CSS transition
        const buffer = 50; // Small buffer for safety

        const removeToastHandler = () => {
            if (toast.parentNode) { // Check if it hasn't been removed already
                toast.remove();
            }
        };

        toast.addEventListener('transitionend', removeToastHandler, { once: true });

        // Fallback: remove after transition duration + buffer
        setTimeout(removeToastHandler, transitionDurationMs + buffer);

    }, duration);
}