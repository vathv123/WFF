const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth curve
  smooth: true,
  direction: "vertical",
  gestureDirection: "vertical",
//   scrollElements: ['.lenis-scrollable'],
  smoothTouch: true,
  touchMultiplier: 1.5,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// document.querySelectorAll('.slideShowMain img').forEach(img => {
//   img.style.transition = 'scale 1.1 ease'
//   if (!img.complete) {
//     img.onload = () => {
//       gsap.set(img, { scale: 1.1 });
//     };
//   } else {
//     gsap.set(img, { scale: 1.1 });
//   }
// });
let swiper1;
let swiper2;

const videoSources = [
  "src/video/HearmeOursummer.mp4",
  "src/video/Myboo.mp4",
  "src/video/InvincibleSwordman.mp4",
  "src/video/ForbiddenZone.mp4",
  "src/video/Bigworld.mp4",
  "src/video/PandaPlan.mp4"
];

// 1. Insert video elements before initializing Swiper
// ✅ Set video elements first
document.querySelectorAll('.slideShowMain').forEach((item, index) => {
  item.innerHTML = `
    <video class="w-full h-full object-cover trailer" muted loop playsinline> <source src="${videoSources[index]}" type="video/mp4"> </video>
  `;
});

// ✅ THEN select them
const videos = document.querySelectorAll('.slideShowMain video');


// 2. NOW init swiper1 (after DOM is updated)
swiper1 = new Swiper('.swiper1', {
  slidesPerView: 'auto',
  breakpoints: {
    640: { slidesPerView: 1 }
  },
  loop: true,
  allowTouchMove: false,
  pagination: {
    el: ".swiper-pagination",
    dynamicBullets: true,
  },
  centeredSlides: false,
  autoplay: false,
  watchSlidesProgress: true,
  watchSlidesVisibility: true,
  speed: 1200,
  controller: { control: null }
});

swiper2 = new Swiper('.swiper2', {
  loop: true,
  speed: 1200,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  controller: { control: null },
  allowTouchMove: false,
  autoplay: false,
  centeredSlides: false,
  watchSlidesProgress: true,
  watchSlidesVisibility: true,
  slidesPerView: 3,
  nested: true,
  keyboard: {
    enabled: true,
    onlyInViewport: true,
  },
});

swiper2.keyboard = {
  enabled: true,
  onlyInViewport: true,
};

document.addEventListener('keydown', function (e) {
  switch (e.key) {
    case 'Home':
      swiper2.slidePrev();
      break;
    case 'End':
      swiper2.slideNext();
      break;
  }
});

swiper2.on('slideChangeTransitionStart', function () {
  const currentRealIndex = swiper2.realIndex;
  const previousIndex = swiper2.previousIndex;
  const visibleSlides = Array.from(swiper2.slides).filter(slide =>
    slide.classList.contains('swiper-slide-visible')
  );
  const slidingForward = swiper2.activeIndex > swiper2.previousIndex;

  swiper2.slides.forEach((slide, i) => {
    const img = slide.querySelector('img');
    if (!img) return;
    gsap.set(img, {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      scale: 1.1
    });
    img.style.objectPosition = 'right';
    const indexInVisible = visibleSlides.indexOf(slide);
    if (i === previousIndex && !slide.classList.contains('swiper-slide-visible')) {
      gsap.to(img, {
        clipPath: "polygon(0 0, 0% 0, 0% 0%, 0 0%)",
        duration: 1,
        ease: "circ.inOut",
      });
    } else if (indexInVisible === 2) {
      if (slidingForward) {
        gsap.fromTo(img,
          { clipPath: "polygon(0 0, 0% 0, 0% 0%, 0 0%)" },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 1,
            ease: "circ.inOut",
          }
        );
      } else {
        gsap.set(img, {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 1,
          ease: "circ.inOut",
        });
      }
    }
    if (indexInVisible === 0) {
      const container = slide.querySelector('.slideShow');
      if (container) {
        gsap.to(container, {
          duration: 1,
          ease: "circ.inOut",
        });
      }
      gsap.to(img, {
        scale: 1,
        duration: 1,
        ease: "circ.inOut",
      });
      img.style.objectPosition = 'center';
    }
  });
  swiper1.slideToLoop(currentRealIndex);
});

let userInteracted = false;

function unmuteActiveVideo() {
  if (userInteracted) return;
  userInteracted = true;

  const videos = document.querySelectorAll('video.trailer');
  const activeVideo = videos[swiper1.realIndex];
  if (activeVideo) {
    activeVideo.muted = false;
    activeVideo.play().catch(() => {});
  }
  window.removeEventListener('touchstart', unmuteActiveVideo);
  window.removeEventListener('click', unmuteActiveVideo);
}

// Listen once for user interaction anywhere
window.addEventListener('touchstart', unmuteActiveVideo, { once: true });
window.addEventListener('click', unmuteActiveVideo, { once: true });
function updateVideoPlayback() {
  const activeRealIndex = swiper1.realIndex;
  document.querySelectorAll('video.trailer').forEach((video, index) => {
    const source = video.querySelector('source');
    
    if (index === activeRealIndex) {
      if (!source.src || source.src.indexOf(videoSources[index]) === -1) {
        source.src = videoSources[index];
        video.load();
      }
      
      if (window.innerWidth <= 756) {
        video.muted = !userInteracted;
      } else {
        video.muted = false;
      }

      video.play().catch(err => {
        console.warn("Autoplay blocked or failed", err);
      });

      video.onended = () => {
        swiper2.slideNext();
      };
    } else {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
      video.onended = null;
    }
  });
}


swiper1.on('slideChangeTransitionEnd', () => {
  updateVideoPlayback();
  swiper2.slideToLoop(swiper1.realIndex);  
});

swiper1.on('init', () => {
  swiper1.slideToLoop(0, 0);
  updateVideoPlayback();
});

// 🟩 DELAY all setup until page and Swiper are fully ready
window.onload = () => {
  swiper1.init();
  swiper2.update();
  swiper1.update();

  // 🟩 Manually trigger first video playback after a brief delay
  setTimeout(() => {
    swiper1.slideToLoop(0, 0); // ensure correct index
    updateVideoPlayback();     // trigger video playback
  }, 100);
};


swiper1.init();
swiper2.update();
swiper1.update();




// gsap.fromTo(video, { scale: 1.1 }, {
//   scale: 1,
//   duration: 1,
//   ease: "power2.out"
// });




const movieShow = [
  {
    img: [
      'https://image.tmdb.org/t/p/original/i4VmtHRy4xRkxIRc1VihCnHXdFr.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/10/photo_7_2024-10-12_02-06-47.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/02/7Xzf7IHltlUHosVKKW7cKWtTv1n.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/12/9mS7Q9VBkH8yGrIvajxzRUNEAEE.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/05/rLj287mA1tp4hZmd69umb1rOZu8.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/12/95EiKK6SM5k26cLlP37eGcJHzDQ.jpg',
    ]
  }
];

const imgArr = movieShow[0].img;
document.querySelectorAll('.slideShow').forEach((item) => {
  const code = parseInt(item.getAttribute('data-code'), 10);
  const imgSrc = imgArr[(code - 1) % imgArr.length];
  item.innerHTML = `<img src="${imgSrc}" alt="slide ${code}" style="
    transition: transform 0.5s ease, object-position 0.7s ease, scale 0.7s ease;
    transform: scale(1.1);
    object-position: right;
    object-fit: cover;
    width: 100%;
    height: 100%;"
   />`;
});
const slidebar = document.querySelector('.slidebar');
const sidebar = document.querySelector('.sidebar');

const watchMovie = [
  {
    trailer: [ 
      'https://www.youtube.com/embed/o7pI-cpVXX4',
    ],
    img: [
      'https://image.tmdb.org/t/p/original/i4VmtHRy4xRkxIRc1VihCnHXdFr.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/05/paksOORJPe0foqskaVec1pQj8L6.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/06/um0ezs2daaKr9zW3weK2z2oNUT8.jpg',
      'https://image.tmdb.org/t/p/original/wQ80tPzGP5gnrtoXV9JFWVlQVJL.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/10/photo_7_2024-10-12_02-06-47.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/05/m8Pt4mgbOjdjkFMdJtYEQhHLR2S.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/03/fQ9hzto0cUuxjfzqNAiAnNJo8O7.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/03/photo_2025-03-17_19-20-05.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/12/9mS7Q9VBkH8yGrIvajxzRUNEAEE.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/11/photo_2024-11-29_08-27-01.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/05/rLj287mA1tp4hZmd69umb1rOZu8.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/02/7Xzf7IHltlUHosVKKW7cKWtTv1n.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/12/6JjfSchsU6daXk2AKX8EEBjO3Fm.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/05/g3GsgIlH3fA4RxhNOAMvSbVWyfW.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/12/95EiKK6SM5k26cLlP37eGcJHzDQ.jpg',
      // HorrorMovie
      'https://khboxhd.net/wp-content/uploads/2024/10/photo_2024-10-03_08-36-51.jpg'
    ],
    name: ['Hear me, Our Summer', 'Happy Monday', 'The Demon\'s Bride', 'Un/Happy for You', 'My Boo', 'Never Say Die', 'Demon Hunter', 'Dont\'t Sleep', 'Forbidden Zone', 'The Finest Hour', 'Big World', 'Invincible Swordman', 'Morbius', 'Detective Chinatown 1900', 'Panda Plan'],
    type: ['Romance, Drama', 'Romantic, Comedy, Drama', 'Horror, Thriller', 'Drama, Romance', 'Horror, Drama', 'Fantasy, Comedy, Action', 'Action, Fantasy, Korea, Crime, Thriller', 'Comedy, Horror, Thriller', 'Action, Adventure, Fantasy, Thriller', 'Action, Drama, History, Thriller, USA', 'Drama, Family', 'Action, Drama', 'Action, Fantasy, Science Fiction', 'Action, Comedy, Mystery', 'Action, Comedy'],
    time: ['1h:49mn', '1h:45mn', '1h:42mn', '1h:50mn', '2h:00mn', '1h:40mn', '1h:47mn', '1h:39mn', '1h:27mn', '1h:57mn', '2h:11mn', '2h:00mn', '1h:44mn', "2h:15mn", '1h:39mn'],
    description: [
      "A job seeking dreamer Yong-jun works part-time at his parents' lunch box house. Yeo-reum lives only to support for hearing-impaired swimmer sister. One day, Yong-jun meets Yeo-reum while delivering lunch boxes and falls in love at the first sight. Yeo-reum slowly opens her heart to warm-hearted Yong-jun.", 
      "Earth, a mischievous 8th-year university student, is about to reach its final chapter. In what should be his last semester before graduation, instead of focusing on his studies, he pours all his energy into winning the heart of Sai Mai, a junior student. ",
      "A young woman finds herself betrothed to a mysterious and powerful demon in a remote village. Bound by ancient traditions, she must navigate the dark secrets of her new supernatural husband's world. As eerie events unfold and danger lurks in every shadow, she struggles to survive—and discover whether love can bloom between worlds of light and darkness.",
      "Two years after their breakup, a Bicolano chef on the rise reunites with his ex- girlfriend who is back in the province for a brief work visit. Still feeling bitter about their breakup, he tries to seduce her to ruin her engagement, only to find himself falling for her once more.",
      "The story follows Pla, a lonely young woman who accidentally befriends a ghost named Boo through a dating app. As their strange relationship deepens, Boo helps her gain confidence and even find love in the real world. However, the bond between a human and a spirit brings unexpected complications, comic situations, and heartwarming moments.",
      "A Chinese comedy film about a male boxer and a female journalist who mysteriously swap bodies after a lightning strike during a confrontation. Forced to live each other's lives, they navigate hilarious situations, uncover hidden truths, and grow in unexpected ways. The film blends slapstick humor with heartfelt moments, delivering a fun and uplifting story about identity, love, and second chances.",
      "A South Korean action-fantasy film that follows a skilled warrior tasked with protecting the world from evil spirits and supernatural threats. Set in a world where ancient demons secretly exist among humans, the story combines intense battles, mystical lore, and emotional depth as the hunter confronts both deadly creatures and personal demons. With stylish action and dramatic twists, it delivers a thrilling journey of courage, sacrifice, and redemption.",
      "A Thai horror-thriller that centers on a group of friends who start experiencing terrifying nightmares after participating in a mysterious sleep experiment. As the line between dreams and reality blurs, they realize that something sinister is haunting them in their sleep — and if they die in their dreams, they may never wake up. The film combines psychological horror with supernatural elements, building suspense through eerie visuals and chilling twists.",
      "When celestial objects merge and strange phenomena occur in the sky, nine dragons drag a bronze coffin through the North Star, a forbidden zone, a burial island, descending to the earth. It is rumored that there is an emperor’s treasure buried on the island that can enhance internal energy during training. The leaders of the sects in the North Star and the wanderers want to go to the island to seize the weapon. Among them is Ji Kong, an orphan (played by Feng Lijun). Ji Kong was adopted by his master in the sword house since he was young. His master, noticing his natural talent, paid a high price and forged thousands of swords for the holy land and sent him to the Yunxiao holy land to practice. Ji Kong and his fellow disciple go to the island together to vie for the emperor’s weapon and aim for the position of the emperor.",
      "A 1992 American war drama film that follows two Navy SEALs, Lawrence Hammer and Dean Mazzoli, who start off as rivals during training but are later forced to work together on a dangerous mission in the Middle East. As tensions rise and loyalties are tested, they must overcome personal differences to survive and complete their operation. The film blends action, brotherhood, and emotional conflict in the face of war.",
      "Liu Chunhe, suffering from cerebral palsy, bravely breaks through the shackles of body and mind to realize the dream stage for his grandmother, while trying to find the coordinates of his own life. After experiencing a summer transformation, he finally embarked on a new journey.",
      "Linghu Chong, a swordsman longing to leave the martial arts world, is drawn back into the clash between good and evil. On his journey, he unexpectedly crosses paths with Dongfang Bubai, the enigmatic leader of the Demonic Sect, leading to an unpredictable and tumultuous adventure through the martial arts realm.",
      "Dangerously ill with a rare blood disorder, and determined to save others suffering his same fate, Dr. Michael Morbius attempts a desperate gamble. What at first appears to be a radical success soon reveals itself to be a remedy potentially worse than the disease",
      "A Chinese mystery-comedy series set in the year 1900, blending historical elements with thrilling detective work. The story follows a clever young detective who uncovers bizarre crimes and hidden conspiracies in old Chinatown. With sharp wit, traditional settings, and unexpected twists, the series combines humor, suspense, and action as the detective solves each case while navigating cultural clashes and the challenges of the era.",
      "International action star Jackie Chan is invited to the adoption ceremony of a rare baby panda, but after an international crime syndicate attempts to kidnap the bear, Jackie has to save the bear using his stunt work skills."
    ],
    movie: [
      '//ok.ru/videoembed/10792893287056?nochat=1',
      'https://1a-1791.com/video/fww1/c9/s8/2/v/X/D/N/vXDNy.aaa.mp4',
      'https://1a-1791.com/video/fww1/6e/s8/2/h/r/J/Q/hrJQy.aaa.mp4',
      'https://1a-1791.com/video/s8/2/K/Q/i/d/KQidv.aaa.mp4',
      'https://1a-1791.com/video/s8/2/J/g/T/1/JgT1t.caa.mp4',
      'https://1a-1791.com/video/fww1/6d/s8/2/h/h/q/I/hhqIy.aaa.mp4',
      'https://1a-1791.com/video/fwe1/c2/s8/2/a/C/p/p/aCppy.caa.mp4',
      'https://1a-1791.com/video/fww1/58/s8/2/s/5/A/t/s5Aty.caa.mp4?u=0&b=0',
      'https://1a-1791.com/video/s8/2/A/U/C/X/AUCXv.aaa.mp4?u=0&b=0&id=3544&type=mp4',
      'https://1a-1791.com/video/s8/2/v/1/r/b/v1rbv.aaa.mp4?u=0&b=0',
      'https://1a-1791.com/video/fww1/15/s8/2/x/4/1/G/x41Gy.aaa.mp4',
      'https://1a-1791.com/video/fwe2/0e/s8/2/b/7/o/b/b7oby.caa.mp4',
      'https://1a-1791.com/video/fwe2/27/s8/2/p/a/k/9/pak9v.aaa.mp4',
      'https://1a-1791.com/video/fww1/bb/s8/2/B/6/1/G/B61Gy.aaa.mp4',
      'https://1a-1791.com/video/s8/2/e/c/y/V/ecyVv.caa.mp4?u=0&b=0'
    ]
  },
  {
    img: [
      'https://image.tmdb.org/t/p/original/7fStBXCoNJLXZnkzpiPJd0kRpTE.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/01/m0SbwFNCa9epW1X60deLqTHiP7x.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/06/lmAVK6B4uR8xgYTytjvAfoLuEBG.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/06/v3Mo77Qjp6pctpD4eJaNT6kFRSB.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/06/zKdycnWFGNIALAxEZcTWRtrfWNW.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/06/uX6FaNE86a4Xnf1mFFEryvjqB1D.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/05/j8tqBXwH2PxBPzbtO19BTF9Ukbf.jpg',
      'https://image.tmdb.org/t/p/original/hzw1m4IUgcyl0uHjfY76WO8lLQV.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/12/twzSYOXuMGAmMwNW2g1tbl7JSRb.jpg',
      'https://image.tmdb.org/t/p/original/uQhYBxOVFU6s9agD49FnGHwJqG5.jpg',
      'https://image.tmdb.org/t/p/original/mcIYHZYwUbvhvUt8Lb5nENJ7AlX.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/11/photo_2024-11-10_17-37-08.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/10/photo_2024-10-03_09-16-21.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/05/v6BmYNtjOZc8tisMYusnplcj9w0.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/03/photo_2025-03-17_18-48-56.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/11/photo_2024-11-17_09-24-41.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/11/photo_2024-11-18_21-35-13.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/11/photo_2024-11-18_21-27-01.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/11/photo_2024-11-17_09-14-59.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/11/photo_2024-11-17_09-02-10.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/10/photo_2_2024-10-12_02-06-47.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/09/photo_2024-09-20_09-39-18.jpg'
    ],
    name: ['Minecraft Movie', 'Moana 2', 'God of Gamblers', 'Holy Knight: Demon Hunters', 'Fire Storm', 'Shadow Force', 'Warfare', 'True Legend', 'Tiger Wolf Rabbit', 'Elevation', 'Black Crab', 'IRobot', 'Tripple Threat', 'The Devil Comes to Kansas City', 'Caption America Brave New World', 'Terminator Salvation', 'Terminator 2: Judgement Day', 'Terminator 3: Rise of Machines', 'Dark Fate', 'John Carter', 'The Platform 2', 'xXx the Return'],
    type: ['Comedy, Adventure, Family, Fantasy', 'Action, Adventure, Animation, Comedy, Family', 'Action, Comedy, Drama, Speak-Khmer', 'Action, Fantasy, Crime' ,'Action, Crime, Hongkong, Speak-Khmer', 'Action, Drama', 'Action, War', 'Action, Martial-art, Fantasy, Speak-Khmer', 'Action, Crime, Drama', 'Action, Science Fiction, USA', 'Action, Thriller', 'Action, Movie, Speak-Khmer', 'Action, Speak-Khmer', 'Action, Crime, Horror, Thriller', 'Action, Science Fiction, USA, Fantasy', 'Action, Science Fiction, USA, Speak-Khmer', 'Action, Science Fiction, USA, Speak Khmer', 'Action, Science Fiction, USA, Speak Khmer', 'Action, Science Fiction, Adventure, USA', 'Action, Adventure, Science Fiction, USA', 'Action, USA, Mystery', 'Action'],
    time: ['1h:41mn', '1h:33mn', '2h:05mn', '1h:31mn', '1h:45mn', '1h:43mn', '1h:35mn', '1h:48mn', '2h:000', '1h:41mn', '1h:54mn', '1h:45mn', '1h:31mn', '1h:37mn', '1h:52mn', '1h:57mn', '2h:27mn', '1h: 40mn', '1h:57mn', '2h:03mn', '1h:40mn', '4h:00mn'],
    description: [
      "Four misfits find themselves struggling with ordinary problems when they are suddenly pulled through a mysterious portal into the Overworld: a bizarre, cubic wonderland that thrives on imagination. To get back home, they’ll have to master this world while embarking on a magical quest with an unexpected, expert crafter, Steve.",
      "After receiving an unexpected call from her wayfinding ancestors, Moana journeys alongside Maui and a new crew to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she’s ever faced.",
      "Ko Chun (Chow Yun‑Fat) is an unflappable, impeccably dressed poker legend known as the “God of Gamblers,” thanks to his supernatural abilities: seemingly reading minds, counting cards by ear, and defying odds ﹣ all while enjoying a piece of chocolate. When he faces off against formidable Japanese and underworld adversaries, fate intervenes: he’s targeted, injured, and left with the innocence and memory of a 10‑year‑old. Enter street hustler Knife (Andy Lau), who reluctantly shelters the child‑like talent and introduces him to hustling schemes. Together with Jane (Joey Wong), they forge a bond over underground games… but Gun‑toting gangsters and Ko Chun’s past threaten to ruin everything. As his memories return, Ko Chun must reclaim his identity, outwit darker forces, and gamble everything in a high-stakes showdown to regain his “God” status.",
      "When a devil-worshipping criminal network plunges Seoul into chaos, the police turn to Holy Night—a trio of supernatural demon hunters—to restore order and defeat the rising evil.",
      "Hong Kong. When Cao Nan and his group of thieves rob an armored car in broad daylight, they don’t hesitate to murder innocent people on the run. Lui Ming Chit, a veteran police inspector, is forced to use sinister tactics to catch them.",
      "Kyrah and Isaac were once the leaders of a multinational special forces group called Shadow Force. They broke the rules by falling in love, and in order to protect their son, they go underground. With a large bounty on their heads, and the vengeful Shadow Force hot on their trail, one family’s fight becomes all-out war.",
      "Based on a real 2006 Navy SEAL mission in Ramadi, Iraq, this film plunges you into the heart of urban combat. Led by D’Pharaoh Woon-A-Tai's portrayal of Ray Mendoza and featuring Will Poulter, Cosmo Jarvis, Kit Connor, and Joseph Quinn, the story unfolds in real time—minute by harrowing minute. What begins as a routine surveillance operation spirals into chaos when the platoon is unexpectedly ambushed. With no music, minimal exposition, and raw, unfiltered battle sound, Warfare forces you to endure every crack of gunfire, every shout, and every gut-wrenching moment of suspense.",
      "Su Qi-Er, a wealthy man living during the Qing Dynasty who loses his fortune and reputation as a result of a conspiracy against him. After being forced out onto the streets, Su dedicates his life to martial arts and reemerges as a patriotic hero known as the “King of Beggars.",
      "Three parents who have lost their children are involved with each other because of a deal; they have no soul in their eyes and hatred in their hearts, and each of them, with their own purposes, set out on the road of seeking revenge for their children, and staged a bizarre and dangerous killing in the barren land.",
      "In a post-apocalyptic near-future, terrifying insectoid “Reapers” have decimated humanity—except for isolated pockets living above 8,000 feet, where the monsters can't survive. Will (Anthony Mackie), a devoted single father, resides with his son Hunter in a safe mountain refuge, yet Hunter’s chronic lung condition leaves him vulnerable below the “safe line.” When their oxygen filters fail, Will joins scientist Nina (Morena Baccarin) and family friend Katie (Maddie Hasson) on a dangerous descent into Reaper-infested territory to secure life-saving supplies. As tension escalates, the group must navigate mine shafts, ski lifts, and treacherous terrain—all while being stalked by ruthless, close-quarters predators that threaten their survival and sanity.",
      "In a bleak, frozen future, Caroline Edh (Noomi Rapace)—a former speed skater turned soldier—is conscripted into an elite squad known as 'Black Crab'. Their mission: skate across a treacherous, ice-covered archipelago to deliver mysterious capsules that might end a devastating war filmcombatsyndicate. Promised a reunion with her daughter, Edh endures frostbite, deadly ambushes, and crumbling trust. As the harsh journey pushes them beyond endurance, the truth behind their cargo—and the cost of the mission—forces Caroline to make a brutal decision",
      "In the year 2035, robots are a part of daily life and bound by strict safety laws. But when a scientist dies under mysterious circumstances, Detective Del Spooner suspects a robot may be responsible. As he investigates, he uncovers a chilling conspiracy where machines may evolve beyond human control. What begins as a simple case turns into a battle for the future of mankind.",
      "A crime syndicate hires elite assassins to eliminate a billionaire’s daughter intent on exposing them. A ragtag team of mercenaries—played by Tony Jaa, Iko Uwais, and Tiger Chen—steps in to protect her, leading to a ferocious showdown. Packed with martial arts legends and explosive action, the film delivers brutal fight choreography and non-stop bullets. Though its plot is thin, it’s a must-watch for fans craving high-octane hand-to-hand and shootout sequences.",
      "Iowan farmer Paul Wilson’s life shatters when a savage kidnapping in Kansas City claims his wife and daughter. Revealing his dark past as a mercenary, Paul launches a brutal, vengeance-fueled mission across the city. Along the way, he uncovers a supernatural twist tied to the legend of Robert Johnson’s pact with the devil. What begins as a gritty rescue turns into a deadly moral showdown—where revenge may cost him more than he bargained for.",
      "After meeting with newly elected U.S. President Thaddeus Ross, Sam finds himself in the middle of an international incident. He must discover the reason behind a nefarious global plot before the true mastermind has the entire world seeing red. ",
      "All grown up in post-apocalyptic 2018, John Connor must lead the resistance of humans against the increasingly dominating militaristic robots. But when Marcus Wright appears, his existence confuses the mission as Connor tries to determine whether Wright has come from the future or the past — and whether he’s friend or foe. ",
      "Set ten years after the events of the original, James Cameron’s classic sci-fi action flick tells the story of a second attempt to get the rid of rebellion leader John Connor, this time targeting the boy himself. However, the rebellion has sent a reprogrammed terminator to protect Connor. ",
      "It’s been 10 years since John Connor saved Earth from Judgment Day, and he’s now living under the radar, steering clear of using anything Skynet can trace. That is, until he encounters T-X, a robotic assassin ordered to finish what T-1000 started. Good thing Connor’s former nemesis, the Terminator, is back to aid the now-adult Connor … just like he promised. ",
      "Decades after Sarah Connor prevented Judgment Day, a lethal new Terminator is sent to eliminate the future leader of the resistance. In a fight to save mankind, battle-hardened Sarah Connor teams up with an unexpected ally and an enhanced super soldier to stop the deadliest Terminator yet. ",
      "John Carter is a war-weary, former military captain who’s inexplicably transported to the mysterious and exotic planet of Barsoom (Mars) and reluctantly becomes embroiled in an epic conflict. It’s a world on the brink of collapse, and Carter rediscovers his humanity when he realizes the survival of Barsoom and its people rests in his hands. ",
      "Set before the original The Platform, two new prisoners—Perempuan and Zamiatin—enter the vertical “Pit” and witness its brutal food-distribution system unfold. A strict ideology of “Loyalists” and punishers enforces harsh rules, sparking rebellion, violence, and shocking ritualistic secrets. As order breaks down, Perempuan becomes central to a revolt that upends the system…and reveals how this nightmare began. A tense, gruesome exploration of power, solidarity, and survival.",
      "After faking his death, extreme athlete Xander Cage (Vin Diesel) is pulled out of exile for one last mission. He must assemble a squad of thrill-seeking operatives to recover “Pandora’s Box,” a weapon capable of controlling military satellites. What follows is a globe-trotting adrenaline ride, packed with mind-blowing stunts, over-the-top action, and a high-tech conspiracy involving international forces"
    ],
    movie: [
      'https://1a-1791.com/video/fww1/71/s8/2/j/l/Z/J/jlZJy.aaa.mp4',
      'https://1a-1791.com/video/fwe1/e3/s8/2/V/n/o/t/Vnotw.aaa.mp4',
      'https://1a-1791.com/video/fww1/99/s8/2/j/s/v/U/jsvUy.aaa.mp4',
      'https://1a-1791.com/video/fww1/6e/s8/2/h/5/J/O/h5JOy.aaa.mp4',
      'https://1a-1791.com/video/fww1/11/s8/2/l/9/u/U/l9uUy.aaa.mp4',
      'https://1a-1791.com/video/fww1/ca/s8/2/3/q/m/P/3qmPy.aaa.mp4',
      'https://1a-1791.com/video/fww1/d7/s8/2/X/X/m/A/XXmAy.aaa.mp4',
      'https://1a-1791.com/video/s8/2/U/t/f/R/UtfRv.caa.mp4',
      'https://1a-1791.com/video/s8/2/E/k/p/b/Ekpbv.aaa.mp4',
      'https://1a-1791.com/video/s8/2/P/i/m/b/Pimbv.aaa.mp4',
      'https://hugh.cdn.rumble.cloud/video/s8/2/M/a/O/L/MaOLs.aaa.mp4',
      'https://hugh.cdn.rumble.cloud/video/s8/2/q/t/s/M/qtsMs.caa.mp4',
      'https://1a-1791.com/video/fww1/10/s8/2/r/I/z/K/rIzKy.aaa.mp4',
      'https://1a-1791.com/video/fww1/0e/s8/2/O/K/A/t/OKAty.caa.mp4',
      'https://bigf.bigo.sg/asia_live/V4s7/1vYScg.mp4',
      'https://1a-1791.com/video/s8/2/W/S/N/R/WSNRu.aaa.mp4',
      'https://1a-1791.com/video/s8/2/H/L/L/R/HLLRu.aaa.mp4',
      'https://hugh.cdn.rumble.cloud/video/s8/2/f/D/k/Z/fDkZs.aaa.mp4',
      'https://1a-1791.com/video/s8/2/e/P/G/O/ePGOu.aaa.mp4',
      'https://1a-1791.com/video/s8/2/1/-/g/3/1-g3t.caa.mp4',
      'https://bigf.bigo.sg/asia_live/V4s7/0YxsRH.mp4'
    ]
  },
  {
    img: [
      'https://khboxhd.net/wp-content/uploads/2025/04/photo_1_2025-04-29_20-16-50.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/03/6rFle187jnWdkLS4TS3a7PHYqZ7.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/05/n0PC8gjaW0MefVARTUaFUDJAyI.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/06/3NYB2u6BOrG2GvxKGOwgJ0A60A0.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/05/juA4IWO52Fecx8lhAsxmDgy3M3.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/05/beLZhuHT97849WkWgty2X1hkWUa.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/05/lGAqDi4IeLTzLmFXOEwNPSLBU3Z.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/04/the-wait-2023.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/04/gWiVDQlsHDy0ihChXtT8MgtmIYg.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/04/8fgr8uooozcAQGIrf1NXp4JSWe3.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/03/kQO9BGj2CnLEuT7Xw6eCbV6q2NN.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/03/2Abt2GgscAGtGAXTrhH44qPhugI.jpg',
      'https://image.tmdb.org/t/p/original/7i8rVAQ6XGxuEdcJGot8rCFcvqj.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/03/3Z9c1tbUhP0QruRjczPHnbx3U2D.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/03/7BbHTbwz4d4Y6Styj1o8DgzgAXt.jpg',
      'https://th.bing.com/th/id/OIP.kd2_q0hpZH8s0CSG0EpeiAHaKk?rs=1&pid=ImgDetMain&cb=idpwebp2&o=7&rm=3',
      'https://khboxhd.net/wp-content/uploads/2025/01/xo5vm7YuAEeRCZ3si3bblF5O27c.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/01/88b6aFvoLyl4uNJeRxLp4iIJd4o.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/01/photo_2025-01-02_18-07-53.jpg',
      'https://khboxhd.net/wp-content/uploads/2025/01/zF1D2iiUtsvsjsA3IarOXryxn32.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/12/8JtwXnrWrS9kMX7ejZIHkQ7iwVK.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/12/photo_2024-12-13_19-00-24.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/12/sQckQRt17VaWbo39GIu0TMOiszq.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/11/photo_2024-11-03_18-08-11.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/10/photo_2024-10-17_16-38-22.jpg',
      'https://khboxhd.net/wp-content/uploads/2024/09/photo_2024-09-19_08-46-49.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/06/wg5l81zU4Rd6I1WrAYOGzssRgmw.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/03/photo_2025-03-17_19-25-40.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/03/photo_2025-03-17_19-37-17.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/03/3uDwqxbr0j34rJVJMOW6o8Upw5W.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/02/8XsQVmGQukwIVDM88Aa0C7L5hCp.jpg',
      'https://khboxplay.net/wp-content/uploads/2025/02/xsKvu7FPLcYUulsBPhBDYknlnRX.jpg',
      'https://image.tmdb.org/t/p/original/i5ePP5A7NVpBWG6038hccaFUB5E.jpg',
      'https://khboxplay.net/wp-content/uploads/2024/11/photo_2024-11-19_18-05-58.jpg',
    ],
    name: ['The Hands', 'Riders', 'The Deceased', 'The Last 7 Days', 'Until Dawn', 'Rosario', 'Sleep Paralysis', 'The Wait', '825 Forest Road', 'Cheongsam Merah Darah', 'Devil Stay', 'Dark Nuns', 'Perewangan', 'Oddity', 'Don\' Look Back..I Know Your Origins', 'Rambut Kafan', 'Mount Kawi', 'Kromoleo', 'Thaghut', 'Dosen Ghaib: It\'s NightTime or You Already Know', 'Sakaratul Maut', 'Father\'s Haunted House', '28 Days Later', 'Kuman Thong', 'Haunted Universities 3', 'Para Betina Pengikut Iblis2', 'Everyone is going to die', 'Home Sweet Hell', 'Lembayung', 'Halloween Ends', 'The Soul Eater', 'Kemah Terlarang Kesurupan Massal', 'Smile', 'Smile2', 'Anaconda'],
    type: ['Horror, Thriller', 'Comedy, Horror', 'Horror, Thriller', 'Horror, Thriller', 'Horror, Mystery', 'Horror, Mystery, Thriller', 'Horror, Thriller', 'Thriller, Horror', 'Horror, Thriller', 'Horror', 'Horror, Korea, Mystery', 'Horror, Drama, Korea, Mystery, Thriller', 'Horror, Mystery, Thriller', 'Horror, Mystery', 'Horror, Mystery, Thriller', 'Horror, Thriller', 'Horror', 'Horror, Thriller', 'Horror', 'Horror, Thriller', 'Horror, Thriller', 'Horror, Comedy', 'Horror, Thriller, Science Fiction', 'Horror', 'Horror', 'Horror', 'Drama, Horror, Thriller', 'Horror', 'Horror, Thriller', 'Horror, Thriller', 'Horror, Crime, Thriller, Mystery', 'Horror', 'Horror, Mystery, USA', 'Horror, Mystery, USA'],
    time: ['58mn', '1h:43mn', '1h:42mn', '1h:47mn', '1h:43mn', '1h:28mn', '1h:36mn', '1h:42mn', '1h:41mn', '1h:18mn', '1h:35mn', '1h:54mn', '1h:49mn', '1h:38mn', '1h:38mn', '1h:35mn', '1h:35mn', '1h:20mn', '1h:42mn', '1h:35mn', '1h:46mn', '1h:33mn', '1h:53mn', '1h:42mn', '1h:59mn', '1h:29mn', '1h:22mn', '1h:40mn', '2h:00mn', '1h:50mn', '1h:50mn', '1h:35mn', '1h:55mn', '2h:00mn'],
    description: [
      "One morning, Bongsoo and his wife encounter a grotesque hand protruding from their toilet. Initially dismissing it as a bizarre anomaly, they soon find themselves under attack by the malevolent appendage. As the hand's sinister presence escalates, Bongsoo, his wife, a security guard, and emergency responders must confront the terrifying entity that defies explanation. Trapped in their own bathroom, they struggle to survive the relentless assault of the mysterious hand.",
      "Nat, a delivery rider, meets a kind-hearted girl named Pie, but when she suddenly disappears, Nat and his two rider friends begin encountering strange and terrifying supernatural events. Despite warnings to stay away, they follow a trail of eerie clues that lead them into haunted places where restless spirits lurk. As the danger grows, the group must face dark forces that threaten to trap them in a deadly game beyond their understanding.",
      "After their father dies on Selasa Kliwon—a day feared in Javanese tradition for its connection to the spirit world—siblings Nuri and Yanda begin experiencing disturbing supernatural events. Though warned to perform sacred rituals to protect themselves, their older brother Wisesa, a doctor who doesn’t believe in such things, refuses. As eerie signs grow stronger and the family falls deeper into fear, they must confront the possibility that their father's death has awakened a force that won't stop until it claims them too.",
      "After their mother, Anggun, passes away, siblings Tari and Kadar return to their childhood home to settle her affairs. They soon discover that Anggun's death is shrouded in mystery—she had been cursed and could not be buried until Kamis Kliwon, a day steeped in Javanese spiritual significance. As the seven-day waiting period unfolds, the family experiences a series of terrifying supernatural events linked to a dark pact from Anggun's past. Tari and Kadar must unravel the secrets of their mother's history to break the curse and protect their family from impending doom.",
      "Clover and her friends venture into a remote valley to search for her missing sister, Melanie. Upon exploring an abandoned visitor center, they find themselves stalked and gruesomely murdered by a masked killer—only to wake up and relive the same night. Trapped in a time loop, each death brings a new horror, and the group must survive until dawn to escape the cycle. As the night progresses, they uncover dark secrets and confront terrifying foes, realizing that their only hope lies in surviving the night.",
      "Rosario Fuentes, a successful Wall Street stockbroker, returns to her estranged grandmother Griselda's apartment in New York City after her sudden death. Trapped alone in the apartment due to a snowstorm, Rosario discovers a hidden chamber filled with occult artifacts tied to dark generational rituals. As supernatural occurrences plague her, Rosario must confront her family's buried secrets and face the truth about the sacrifices and choices they made. The film delves into themes of cultural identity, family trauma, and the consequences of abandoning one's roots.",
      "Tania, a rising tennis star under immense pressure, unintentionally summons a powerful djinn that begins to prey on her and those around her during sleep. As terrifying episodes escalate—with friends dying under mysterious circumstances—Tania must uncover the dark force stalking her nights and find a way to break its deadly grip before it destroys her dreams…and her life.",
      "Groundskeeper Eladio accepts a shady bribe to expand hunting stands on a remote Andalusian estate. Soon after, his life unravels: a tragic accident takes his young son, and grief consumes his fragile family. Isolated and broken, Eladio becomes haunted—by guilt, by vengeance, and by sinister forces that may be more than just his tortured mind. As he spirals deeper into madness, the barren countryside seems to close around him, and a supernatural reckoning draws near.",
      "After a tragic accident, Chuck, his wife Maria, and his sister Isabelle relocate to Ashland Falls hoping for a fresh start. But the town harbors a dark legacy: the angry spirit of Helen Foster, who died in the 1940s, haunts residents—driving many to despair and death. When the family learns that destroying her hidden home at the elusive “825 Forest Road” may be their only salvation, they embark on a chilling quest. As each of them faces supernatural terror, sibling rivalries, grief, and the town's secrets, they realize escaping Helen’s wrath will require confronting their deepest fears…it may already be too late.",
      "A team of four young cleaners from Kuala Lumpur takes on a job at a remote, dilapidated bungalow in Melaka. As they go about their work, they disturb a centuries‑old well—and unleash the vengeful spirit of the bungalow’s former owner. The ghost, bound to a blood‑red cheongsam hidden within the house, begins to target each of them, forcing the group to face their hidden pasts and pay for old sins. As the bloodshed escalates, they must uncover the cheongsam’s dark origins if they hope to escape alive.",
      "After their daughter So‑mi dies during an exorcism, renowned heart surgeon Cha Seung‑do refuses to accept her death—even as the priest and medical examiners confirm it. During the traditional three‑day wake, strange and terrifying signs begin to manifest: her body stirs unnaturally, eerie moths swarm, and an ancient evil seems restless. As Seung‑do and Priest Ban confront each clue, they realize the demon may have never left—and may be far more sinister and enduring than anyone feared.",
      "Two determined nuns, Sister Junia and Sister Michaela, risk everything when a young boy, Hee‑joon, becomes possessed by a powerful demon. With the Church’s priests stalled and forbidden from intervening, the nuns break sacred rules to perform a dangerous exorcism themselves. As sinister forces close in and terrifying secrets within the convent come to light, they must confront their own fears and faith—or see the boy’s soul, and possibly their own, irreparably lost",
      "Maya returns to her ancestral home after her father’s sudden death, only to uncover a sinister family secret. Her mother performed a dark ritual to summon a perewangan—a spiritual helper promising fortune, but demanding a blood debt that spans seven generations. As disturbing events escalate—unexplained illnesses, horrifying dreams, and a spirit bent on vengeance—Maya and her relatives realize they’ve fallen into a deadly pact. With each new terror, Maya must unravel the curse’s origins and confront the malevolent spirit before it claims her family’s lives.",
      "A year after her twin sister Dani is brutally murdered in their secluded Irish country house, blind clairvoyant Darcy—a collector of cursed antiques—arrives to uncover the truth. She brings with her a life-sized wooden golem from her curiosity shop, believing its supernatural connection will reveal her sister’s killer. As she confronts Dani’s widower and his new partner, dark forces begin to stir. The ominous mannequin, haunted artifacts, and Darcy’s eerie abilities fuel a psychological and supernatural spiral, turning grief and mystery into a chilling battle against both spirit and human menace.",
      "In this chilling 2024 Malaysian horror sequel, a sinister Opah’s Saka spirit returns, hunting for her next victim among unsuspecting souls. As ominous rituals unfold and supernatural horrors escalate, those who cross its path are consumed by fear and fate. With each terrifying incident, dark family secrets come to light—revealing that escaping the curse may cost more than just one’s life.",
      "Tari (Bulan Sutena) leads a seemingly privileged life as the daughter of a successful businessman, Anwar (Yama Carlos), but her family harbors a dark mystery. Her mother, Mirna (Virnie Ismail), suffers mysterious ailments—weight loss, hair loss, and miscarriages—before suddenly dying, leaving behind a cryptic message. Following Mirna’s death, Anwar’s brother Suban (Aiman Ricky) appears, pushing to sell the family home and claiming his inheritance. Suspicion grows when Tari, assisted by their maid Tini (Nita Gunawan) and a young man named Navi, encounters a mysterious woman named Gendis (Catherine Wilson) rumored to practice black magic. As Tari digs deeper, she uncovers the horrifying truth: the family's wealth was acquired through a lethal ritual involving hair, burial shrouds, and images—“rambut kafan”. The ritual's curse spirals into increasingly terrifying supernatural events targeting Tari and her loved ones. Now she must confront dark forces and deceit within her own bloodline to stop the curse before it destroys them all.",
      "After his father Drajat starts behaving in terrifying and inexplicable ways—such as eating dirt and talking to himself—teenager Dika (Rayn Wijaya) and his cousin Bella (Roro Fitria) uncover a disturbing secret: Drajat performed pesugihan, a forbidden wealth ritual at Mount Kawi, involving pacts with unseen spirits justwatch. Believing that this connects to Drajat’s breakdown, the duo sets out to the mystical mountain seeking answers.Joined by friends and the enigmatic guard Jono (Reymon Knuliqh), they venture into the heart of the ritual site, hoping to find the truth and save Drajat’s soul letterboxd. But soon, sinister forces awaken—Mbah Kawi’s ancient curse unleashes vengeful spirits, trapping the group in a nightmarish world where trust breaks down and survival depends on confronting dark pacts from the past .",
      "Zia, a young girl from Djarot, a thug nicknamed Gali, married his daughter Danang who is actually the leader of PETRUS (MYSTERIOUS SHOOTER). When Danang no longer needs Djarot and the Gali that he has been using, Danang decides to kill and slaughter them all. Since then, the restless spirits of the dead Gali have appeared, becoming a group of ghosts carrying coffins that scare the villagers called “KROMOLEO”, anyone who witnesses the Kromoleo will die because of the terror of the Kromoleo. Zia is trapped between 2 choices, choosing Danang, her grandfather or Djarot, her father.",
      "Ainun, a bright but sheltered student, is shocked to learn that the powerful spiritual healer she reveres—Abah Mulya—is actually her biological father. After his mysterious death, she journeys to his secluded pesantren to uncover the truth. Drawn into a ring of heretical teachings led by Mulya’s fervent disciple Lingga, Ainun becomes ensnared in rituals that conflict with her faith. As she delves deeper, dark forces awaken, threatening her friends Rini and Bagas, and revealing unsettling secrets. With lives on the line, Ainun must confront the terrifying legacy of her father’s legacy—and the horrifying price of spiritual deception.",
      "During a quiet semester break, four struggling students—Amelia, Emir, Maya, and Fattah—are forced to attend a remedial night class taught by the infamous Pak Bakti. Known on campus as a strict, even cruel lecturer, Pak Bakti surprises everyone when he never shows up—yet the lesson begins regardless. As they settle into the empty classroom, unsettling occurrences begin: flickering lights, eerie whispers, and a disconnected gaze. Fear turns to terror when one of them notices Pak Bakti hovering midair—no feet touching the floor. They soon realize their professor may not be human at all. One by one, the students are stalked, picked off, and mentally tormented as they desperately search for a way out… and a chilling message echoes: (“Is it night? Or do you already know?”)",
      "A respected couple from Desa Umbul Krida—Pak Wiryo and Bu Wiryo—are torn apart when a tragic car accident kills the mother and leaves the father in a coma amazon. As the children from his first and second marriages clash over inheritance, a terrifying supernatural force begins to haunt them all. Their father seems unable to die—rumors spread that he has a “pegangan” (a spiritual tether protecting him). Soon, a vengeful djinn or khodam emerges from the shadows, terrorizing family members with escalating paranormal attacks. Sakaratul Maut builds slowly, mixing family betrayal, traditional spiritual lore, and mounting dread, culminating in a chilling finale as the children must unite—or be consumed by the same dark power that binds their father to life.",
      "A devoted forest ranger relocates his family into a secluded official residence deep within a teak forest—only to discover that the historic site conceals a grave and brutal legacy. Legend says that on every ominous Friday Kliwon, restless spirits of punished wood thieves and vengeful locals reawaken. As night falls, the ranger, his wife, their maid and assistant find themselves besieged by violent poltergeists, terrifying whispers, and ghostly apparitions. Bound together by fear and desperation, they must endure a relentless night of supernatural terror—and uncover the dark secrets haunting the home—before sunrise claims them too.",
      "Twenty-eight days after a killer virus was accidentally unleashed from a British research facility, a small group of London survivors are caught in a desperate struggle to protect themselves from the infected. Carried by animals and humans, the virus turns those it infects into homicidal maniacs — and it’s absolutely impossible to contain. ",
      "Clara (Cindy Miranda), still reeling from the loss of her young son Isaac, travels to Thailand with her daughter Katie. Desperate to reconnect, she consults a shaman and receives a Kuman Thong — a spirit-infused golden child statue rumored to resurrect the dead if properly honored. But welcoming one spirit unleashes many: phantom footprints, disturbing whispers, bizarre behavior, and escalating supernatural chaos that endangers Clara’s family. Soon, what she believed was her son may be something far more sinister.",
      "On three different Thai campuses, eerie urban legends begin to turn horrifyingly real when students tempt fate. In one story, two friends stage a fake love ritual at a sacred shrine—only to awaken a jealous goddess who punishes deception with death. In another, a senior receives chilling messages from a classmate who shouldn't exist, dragging him into a deadly mystery buried deep in the school's tech building. And in the final tale, three students mock a hidden shrine and remove its offerings, unknowingly unleashing spirits that blur the line between academic life and the afterlife. As each haunting spirals out of control, the students must face the truth: some legends are better left undisturbed.",
      "Sumi (Mawar de Jongh), still reeling from the horrors endured in the first film, strives to break free from the demonic terror that stalks her. Her fight for normalcy leads her to cross paths with Asih (Sara Fajira) and Sari (Hanggini), two women equally tormented by their own hellish experiences. Drawn together by shared pain and whispered secrets, the trio soon discovers that their torment is far from over. A relentless demon (Adipati Dolken) continues its pursuit, and to survive, they must confront not just that evil—but also the darkest recesses of their own humanity. Vengeful ambitions, spiritual betrayals, and savage transformations twist Sumi and her allies into shapes they never intended… and the price of revenge may corrupt them into monsters themselves.",
      "When estranged father Daniel (Brad Moore) invites his troubled teenage daughter Imogen (Gledisa Arthur) to a luxurious birthday dinner in their remote home, he hopes for a chance at reconciliation. But their reunion is violently interrupted by two masked intruders—Comedy (Jaime Winstone) and Tragedy (Chiara D’Anna)—who storm in with shotguns and reveal hidden resentments in a harrowing cat‑and‑mouse “game.” As the evening spirals into psychological terror, both daughter and father are forced to confront deep-seated wounds and a revelation that flips their world upside down",
      "Don Champagne (Patrick Wilson) seems to have it all—his own furniture business, a picture-perfect suburban home, and a meticulously scheduled wife, Mona (Katherine Heigl)  truevisions. When Don starts an affair with the alluring Dusty (Jordana Brewster), he soon finds himself blackmailed with a staged pregnancy. In a chilling, darkly comedic twist, Mona refuses to divorce—insisting instead that Don “remove” the threat to preserve their façade  rottentomatoes. What follows is a grotesquely inventive murder plot, cascading into chaos, escalating violence, and a final reckoning that leaves everyone questioning the true cost of perfection .",
      "Arum and Pica, who wanted to complete their internship at Lembayung hospital, had to face mysterious terror from a woman satan who was suspected of hanged herself in the bathroom. The situation became even more tense after they asked others for help to the point where they threatened their own lives and those closest to them.",
      "Four years after the events of Halloween in 2018, Laurie has decided to liberate herself from fear and rage and embrace life. But when a young man is accused of killing a boy he was babysitting, it ignites a cascade of violence and terror that will force Laurie to finally confront the evil she can’t control, once and for all.",
      "When the disappearance of children and bloody murders multiply in a small mountain village, an old legend shrouded in sulphur reappears… Commander Guardiano and Captain of the Gendarmerie De Rolan are forced to join forces to uncover the truth.",
      "A group of enthusiastic high school campers from SMA Pandega embark on a three-day retreat deep in the forbidden Wana Alus forest. Despite stern warnings from the village kuncen, Mbah Sonto (Landung Simatupang), they receive permission—provided they never disturb the sacred sesajen. But during a midnight drama performance portraying the legendary Roro Putri, Rini (Callista Arum) becomes possessed by the restless spirit of Roro Putri (Nihna Fitria). Her possession ignites a terrifying chain reaction, sweeping through the entire camp in a wave of mass hysteria: primal behavior, self-harm, injuries, and life-threatening chaos take hold. With pupils turning on each other, only Miko (Fatih Unru), the counselor, Mbah Sonto, and a few brave campers stand between salvation and total destruction.",
      "Dr. Rose Cotter (Sosie Bacon), a compassionate psychiatrist, witnesses a traumatized patient’s horrifying suicide—marked by an impossible, frozen grin. Soon afterward, Rose begins to experience strange and terrifying occurrences: warped reflections, glitching vision, and unnerving smiles cropping up all around her. As her perceptions unravel and childhood trauma resurfaces, she discovers a malevolent curse that feeds on pain and spreads through trauma. Determined to break the deadly chain, Rose attempts to end it by isolating herself—but instead, becomes its latest conduit, passing the curse to someone she loves.",
      "Pop star Skye Riley (Naomi Scott) is on the brink of superstardom when a series of chilling events threaten to unravel her tour—and her sanity. Haunted by sinister grins in mirrors and distorted voices, Skye realizes the same demonic force from Rose Cotter’s past has found her. Joined by her mother Elizabeth (Rosemarie DeWitt) and paranormal survivor Joel (Kyle Gallner), Skye must unravel the curse’s origins before it consumes her and everyone in her circle. A deeper dive into trauma’s persistence, this sequel expands the universe while keeping the tension and dread alive."
    ],
    movie: [
      'https://1a-1791.com/video/fww1/9e/s8/2/v/v/a/G/vvaGy.aaa.mp4',
      'https://1a-1791.com/video/fww1/5e/s8/2/C/N/f/v/CNfvy.caa.mp4',
      'https://1a-1791.com/video/fww1/4e/s8/2/B/b/E/N/BbENy.aaa.mp4',
      'https://1a-1791.com/video/fww1/a0/s8/2/7/t/J/Q/7tJQy.aaa.mp4',
      'https://1a-1791.com/video/fww1/16/s8/2/5/e/E/N/5eENy.aaa.mp4',
      'https://1a-1791.com/video/fww1/90/s8/2/h/2/D/N/h2DNy.aaa.mp4',
      'https://1a-1791.com/video/fww1/6d/s8/2/r/L/z/K/rLzKy.aaa.mp4',
      'https://1a-1791.com/video/fww1/9f/s8/2/l/j/a/G/ljaGy.aaa.mp4',
      'https://1a-1791.com/video/fww1/bc/s8/2/L/f/O/z/LfOzy.aaa.mp4',
      'https://1a-1791.com/video/fwe2/ac/s8/2/g/0/d/x/g0dxy.caa.mp4',
      'https://1a-1791.com/video/fww1/d5/s8/2/Q/O/A/t/QOAty.caa.mp4',
      'https://1a-1791.com/video/fwe2/20/s8/2/O/v/P/q/OvPqy.caa.mp4',
      'https://1a-1791.com/video/fwe1/53/s8/2/2/y/P/q/2yPqy.caa.mp4',
      'https://1a-1791.com/video/fwe2/8c/s8/2/Y/E/p/p/YEppy.caa.mp4',
      'https://1a-1791.com/video/fwe2/aa/s8/2/U/e/q/p/Ueqpy.caa.mp4',
      'https://1a-1791.com/video/fwe1/5d/s8/2/w/X/q/8/wXq8w.aaa.mp4',
      'https://1a-1791.com/video/fwe1/82/s8/2/H/c/n/8/Hcn8w.aaa.mp4',
      'https://1a-1791.com/video/fwe1/3f/s8/2/R/F/Y/i/RFYiw.aaa.mp4',
      'https://1a-1791.com/video/fwe1/ba/s8/2/H/l/Y/i/HlYiw.aaa.mp4',
      'https://1a-1791.com/video/fwe1/54/s8/2/3/f/T/g/3fTgw.aaa.mp4',
      'https://1a-1791.com/video/s8/2/M/C/v/V/MCvVv.aaa.mp4',
      'https://1a-1791.com/video/s8/2/h/5/P/G/h5PGv.aaa.mp4?',
      'https://1a-1791.com/video/s8/2/c/j/R/G/cjRGv.aaa.mp4',
      'https://1a-1791.com/video/s8/2/G/E/M/i/GEMiu.aaa.mp4',
      'https://1a-1791.com/video/s8/2/L/h/e/7/Lhe7t.caa.mp4',
      'https://1a-1791.com/video/s8/2/0/S/H/K/0SHKt.caa.mp4',
      'https://1a-1791.com/video/fww1/aa/s8/2/x/7/J/O/x7JOy.aaa.mp4',
      'https://1a-1791.com/video/fww1/da/s8/2/E/7/A/t/E7Aty.caa.mp4',
      'https://1a-1791.com/video/fww1/92/s8/2/a/u/B/t/auBty.caa.mp4',
      'https://1a-1791.com/video/fwe2/68/s8/2/a/w/W/w/awWwy.caa.mp4',
      'https://1a-1791.com/video/fwe2/37/s8/2/5/2/O/i/52Oiy.caa.mp4',
      'https://1a-1791.com/video/fwe1/f3/s8/2/7/N/b/g/7Nbgy.caa.mp4',
      'https://1a-1791.com/video/s8/2/9/y/M/T/9yMTu.aaa.mp4',
      'https://1a-1791.com/video/s8/2/0/T/M/T/0TMTu.aaa.mp4'
      
    ]
  },

];
const main = document.querySelector('.main')
const edit = document.querySelector('.edit')
const Home = document.querySelector('.Home')
const Home1 = document.querySelector('.Home1')
const searchInput = document.querySelector('#search');
const watch = document.querySelectorAll('.watch')
const movie = document.querySelector('.movie')
const trailers = document.querySelectorAll('.slideShowMain video');
const listofall = document.querySelector('.listofall')
const srchAppear = document.querySelector('.srchAppear')

function HomeReturn() {
  Home.addEventListener('click', () => {
    const targetEl = document.querySelector('#New');
    if (targetEl) {
      const scrollToPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - 20;
      lenis.scrollTo(scrollToPosition, {
        duration: 2.5,
        smoothTouch: true,
        gestureDirection: "vertical",
        touchMultiplier: 1.5,
        smooth: true,
        easing: (t) => t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2,
      });
    }
    document.querySelectorAll('video.trailer').forEach(video => {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    });
    const activeSlide = document.querySelector('.swiper-slide-active');
    if (activeSlide) {
      const video = activeSlide.querySelector('video.trailer');
      if (video) {
        video.muted = false;
        video.play().catch(() => {});
      }
    }
    searchResult.style.display = 'none';
    movie.style.display = 'none';
    main.style.display = 'flex';
    edit.style.display = 'flex';
    listofall.style.display = 'flex';
    searchInput.value = '';
  });
  Home1.addEventListener('click', () => {
    const targetEl = document.querySelector('#New');
    if (targetEl) {
      const scrollToPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - 20;
      lenis.scrollTo(scrollToPosition, {
        duration: 2.5,
        smoothTouch: true,
        gestureDirection: "vertical",
        touchMultiplier: 1.5,
        smooth: true,
        easing: (t) => t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2,
      });
    }
    document.querySelectorAll('video.trailer').forEach(video => {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    });
    const activeSlide = document.querySelector('.swiper-slide-active');
    if (activeSlide) {
      const video = activeSlide.querySelector('video.trailer');
      if (video) {
        video.muted = false;
        video.play().catch(() => {});
      }
    }
    searchResult.style.display = 'none';
    movie.style.display = 'none';
    main.style.display = 'flex';
    edit.style.display = '';
    listofall.style.display = 'flex';
  });
}


//Mix Genre
const newMovie = document.querySelector('.NewMovie');
const movieData = watchMovie[0];

function renderNewMovie(index) {
  srchAppear.classList.remove('flex');
  srchAppear.classList.add('hidden');
  HomeReturn()
  main.style.display = 'none';
  edit.style.display = 'none';
  trailers.forEach(video => {
    video.pause();
    video.muted = true;
  });
  document.querySelectorAll('.slideShowMain video').forEach(video => {
    video.pause();
    video.muted = true;
    video.currentTime = 0;
  });

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
  movie.style.display = 'grid';

  movie.innerHTML = `
    <div class='flex flex-col gap-12 w-full h-auto'>
      <div class='w-full h-auto'>
        ${
          index === 0
            ? `<iframe class="w-full h-[50vh] object-contain" src="${movieData.movie[index]}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
            : `<video id="player" playsinline webkit-playsinline controls class="w-full h-[50vh] object-contain">
                <source src="${movieData.movie[index]}" type="video/mp4" />
              </video>`
        }
      </div>
      <div class='w-full h-auto flex gap-6'>
        <div class='flex flex-col gap-3 w-[220px]'>
          <div class='w-full h-[220px]'>
            <img src="${movieData.img[index]}" alt="${movieData.name[index]}" class="w-full h-full object-cover object-top" />
          </div>
          <div class='text-[#ad0725] font-bold text-[1.1rem] font-[GM]'>${movieData.name[index]}</div>
          <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
            <div>${movieData.type[index]}</div><div>${movieData.time[index]}</div>
          </div>
        </div>
        <div class='text-white w-full flex flex-col gap-4'>
          <p class='text-[1.1rem] font-[GM] text-[#ad0725]'>Description</p>
          <div class='text-[#bdb8b86d] text-[0.9rem]'>${movieData.description[index]}</div>
        </div>
      </div>
    </div>

    <div class='swiper swiper3 h-auto w-full'>
      <div class='swiper-wrapper w-full flex xl:flex-col xl:gap-[40px]'>
        ${movieData.img.map((img, i) => {
          if (i === index) return '';
          return `
            <div class='swiper-slide flex flex-col w-full h-auto'>
              <div class="w-[190px] sm:h-[250px] h-[240px] watchNext cursor-pointer" data-index="${i}">
                <img src="${img}" class="w-full h-full object-cover object-top" />
              </div>
              <div class='w-[190px] sm:w-full h-auto'>
                <div class='text-[#ad0725] font-[GM] text-[1rem] font-bold'>${movieData.name[i]}</div>
                <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
                  <div>${movieData.type[i]}</div><div>${movieData.time[i]}</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <button class='w-full h-[30px] bg-black border border-[#ad0725] cursor-pointer text-[#ad0725] text-[1.1rem] z-[1200] return'>Return</button>

  `;

  if (index !== 0) {

    const player = new Plyr('#player', {
      controls: ['play', 'rewind', 'fast-forward', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      invertTime: false,
    });

    setTimeout(() => {
      const controls = document.querySelector('.plyr__controls');
      if (!controls) return console.warn('Controls not loaded');
      const backBtn = document.createElement('button');
      backBtn.innerHTML = '⏪<br><small>10</small>';
      backBtn.className = 'plyr__control';
      backBtn.onclick = () => player.currentTime -= 10;
      const forwardBtn = document.createElement('button');
      forwardBtn.innerHTML = '⏩<br><small>10</small>';
      forwardBtn.className = 'plyr__control';
      forwardBtn.onclick = () => player.currentTime += 10;
      const volumeBtn = controls.querySelector('[data-plyr="mute"]');
      controls.insertBefore(backBtn, volumeBtn);
      controls.insertBefore(forwardBtn, volumeBtn.nextSibling);
    }, 300);
  }

  setTimeout(() => {
    if (document.querySelector('.swiper3')) {
      const swiperInstance = new Swiper('.swiper3', {
        breakpoints: {
          640: {
            direction: 'vertical',
            autoplay: {
              reverseDirection: true,
            },
            slidesPerView: 3,
          },
        },
        direction: 'horizontal',
        autoplay: {
          reverseDirection: true,
        },
        slidesPerView: 2,
        loop: true,
        spaceBetween: 20,
        autoplay: {
          delay: 5500,
          disableOnInteraction: false,
        },
        speed: 1000,
        allowTouchMove: true,
      });

      document.querySelectorAll('.watchNext').forEach(el => {
        el.addEventListener('click', e => {
          const newIndex = Number(e.currentTarget.dataset.index);
          renderNewMovie(newIndex);
        });
      });
    } else {
      console.warn('Swiper container not found!');
    }
  }, 10);

  const returnBtn = document.querySelector('.return');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      console.log('Return clicked');

      srchAppear.classList.remove('hidden');
      srchAppear.classList.add('flex', 'sm:hidden');

      // Pause & reset player video
      const playerVideo = document.querySelector('video#player');
      if (playerVideo) {
        playerVideo.pause();
        playerVideo.currentTime = 0;
        playerVideo.removeAttribute('src');
        playerVideo.load();
        console.log('Player video reset');
      }

      // Pause and reset all slideShowMain videos
      document.querySelectorAll('.slideShowMain video').forEach((video, idx) => {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        video.removeAttribute('src');
        video.load();
        console.log(`SlideShow video ${idx} reset`);
      });

      // Reset iframe if any
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = '';
        console.log('Iframe src cleared');
      }

      // Show main UI parts
      main.style.display = 'flex';
      edit.style.display = 'flex';
      movie.style.display = 'none';

      // Reset swiper slides to first slide *after* DOM changes
      // Make sure swiper instances are defined in the outer scope:
      if (typeof swiper1 !== 'undefined' && typeof swiper2 !== 'undefined') {
        swiper1.slideToLoop(0, 0);
        swiper2.slideToLoop(0, 0);
        console.log('Swiper slides reset to 0');

        // Delay updateVideoPlayback a bit to let swiper update fully
        setTimeout(() => {
          updateVideoPlayback();
          console.log('updateVideoPlayback called after return');
        }, 200);
      } else {
        console.warn('Swiper instances not found');
      }
    });
  }

  }

newMovie.innerHTML = movieData.img
  .map(
    (img, index) => `
  <div class="flex gap-4 flex-col">
    <div class="bg-white w-full h-[280px] sm:h-[340px] rounded-sm overflow-hidden watch cursor-pointer" data-index="${index}">
      <img src="${img}" alt="${movieData.name[index]}" class="w-full h-full object-cover object-center" />
    </div>
    <div>
      <div class='text-[#ad0725] font-bold font-[GM] text-[1.1rem]'>${movieData.name[index]}</div>
      <div class='w-full gap-4 justify-between flex font-[GM] items-center'>
        <div class='text-[0.85rem] text-[#bdb8b86d]'>${movieData.type[index]}</div>
        <div class='text-[0.85rem] text-[#bdb8b86d]'>${movieData.time[index]}</div>
      </div>
    </div>
  </div>`
  )
  .join('');

document.querySelectorAll('.watch').forEach(el => {
  el.addEventListener('click', e => {
    const index = Number(e.currentTarget.dataset.index);
    renderNewMovie(index);
  });
});



//Action
const Action = document.querySelector('.Action');
const movieDataAction = watchMovie[1];

function renderActionMovie(index) {
  srchAppear.classList.remove('flex');
  srchAppear.classList.add('hidden');
  HomeReturn()
  main.style.display = 'none';
  edit.style.display = 'none';
  trailers.forEach(video => {
    video.pause();
    video.muted = true;
  });
  document.querySelectorAll('.slideShowMain video').forEach(video => {
    video.pause();
    video.muted = true;
    video.currentTime = 0;
  });

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
  movie.style.display = 'grid';

  movie.innerHTML = `
    <div class='flex flex-col gap-12 w-full h-auto'>
      <div class='w-full h-auto'>
        <video id="player" playsinline webkit-playsinline controls class="w-full h-[50vh] object-contain">
          <source src="${movieDataAction.movie[index]}" type="video/mp4" />
        </video>
      </div>
      <div class='w-full h-auto flex gap-6'>
        <div class='flex flex-col gap-3 w-[220px]'>
          <div class='w-full h-[220px]'>
            <img src="${movieDataAction.img[index]}" alt="${movieDataAction.name[index]}" class="w-full h-full object-cover object-top" />
          </div>
          <div class='text-[#ad0725] font-bold font-[GM] text-[1.1rem]'>${movieDataAction.name[index]}</div>
          <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
            <div>${movieDataAction.type[index]}</div><div>${movieDataAction.time[index]}</div>
          </div>
        </div>
        <div class='text-white w-full flex flex-col gap-4'>
          <p class='text-[1.1rem] font-[GM] text-[#ad0725]'>Description</p>
          <div class='text-[#bdb8b86d] text-[0.9rem]'>${movieDataAction.description[index]}</div>
        </div>
      </div>
    </div>

    <div class='swiper swiper4 h-auto w-full'>
      <div class='swiper-wrapper w-full flex xl:flex-col xl:gap-[40px]'>
        ${movieDataAction.img.map((img, i) => {
          if (i === index) return '';
          return `
            <div class='swiper-slide flex flex-col w-full h-auto'>
              <div class="w-[190px] sm:h-[250px] h-[240px] watchNext cursor-pointer" data-index="${i}">
                <img src="${movieDataAction.img[i]}" class="w-full h-full object-cover object-top" />
              </div>
              <div class='w-[190px] sm:w-full h-auto'>
                <div class='text-[#ad0725] font-bold font-[GM] text-[1rem]'>${movieDataAction.name[i]}</div>
                <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
                  <div>${movieDataAction.type[i]}</div><div>${movieDataAction.time[i]}</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <button class='w-full h-[30px] bg-black border border-[#ad0725] cursor-pointer text-[#ad0725] text-[1.1rem] z-[1200] return2'>Return</button>
  `;


    const player = new Plyr('#player', {
      controls: ['play', 'rewind', 'fast-forward', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      invertTime: false,
    });

    setTimeout(() => {
      const controls = document.querySelector('.plyr__controls');
      if (!controls) return console.warn('Controls not loaded');
      const backBtn = document.createElement('button');
      backBtn.innerHTML = '⏪<br><small>10</small>';
      backBtn.className = 'plyr__control';
      backBtn.onclick = () => player.currentTime -= 10;
      const forwardBtn = document.createElement('button');
      forwardBtn.innerHTML = '⏩<br><small>10</small>';
      forwardBtn.className = 'plyr__control';
      forwardBtn.onclick = () => player.currentTime += 10;
      const volumeBtn = controls.querySelector('[data-plyr="mute"]');
      controls.insertBefore(backBtn, volumeBtn);
      controls.insertBefore(forwardBtn, volumeBtn.nextSibling);
    }, 300);
  


  setTimeout(() => {
    if (document.querySelector('.swiper4')) {
      const swiperInstance = new Swiper('.swiper4', {
        breakpoints: {
          640: {
            direction: 'vertical',
            autoplay: {
              reverseDirection: true,
            },
            slidesPerView: 3,
          },
        },
        direction: 'horizontal',
        autoplay: {
          reverseDirection: true,
        },
        slidesPerView: 2,
        loop: true,
        spaceBetween: 20,
        autoplay: {
          delay: 5500,
          disableOnInteraction: false,
        },
        speed: 1000,
        allowTouchMove: true,
      });

      document.querySelectorAll('.watchNext').forEach(el => {
        el.addEventListener('click', (e) => {
          const newIndex = Number(e.currentTarget.dataset.index);
          renderActionMovie(newIndex);
        });
      });
    } else {
      console.warn('Swiper container not found!');
    }
  }, 10);

  const returnBtn = document.querySelector('.return2');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      console.log('Return clicked');

      srchAppear.classList.remove('hidden');
      srchAppear.classList.add('flex', 'sm:hidden');

      // Pause & reset player video
      const playerVideo = document.querySelector('video#player');
      if (playerVideo) {
        playerVideo.pause();
        playerVideo.currentTime = 0;
        playerVideo.removeAttribute('src');
        playerVideo.load();
        console.log('Player video reset');
      }

      // Pause and reset all slideShowMain videos
      document.querySelectorAll('.slideShowMain video').forEach((video, idx) => {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        video.removeAttribute('src');
        video.load();
        console.log(`SlideShow video ${idx} reset`);
      });

      // Reset iframe if any
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = '';
        console.log('Iframe src cleared');
      }

      // Show main UI parts
      main.style.display = 'flex';
      edit.style.display = 'flex';
      movie.style.display = 'none';

      // Reset swiper slides to first slide *after* DOM changes
      // Make sure swiper instances are defined in the outer scope:
      if (typeof swiper1 !== 'undefined' && typeof swiper2 !== 'undefined') {
        swiper1.slideToLoop(0, 0);
        swiper2.slideToLoop(0, 0);
        console.log('Swiper slides reset to 0');

        // Delay updateVideoPlayback a bit to let swiper update fully
        setTimeout(() => {
          updateVideoPlayback();
          console.log('updateVideoPlayback called after return');
        }, 200);
      } else {
        console.warn('Swiper instances not found');
      }
    });
  }
}

Action.innerHTML = movieDataAction.img.map((img, index) => {
  return `
    <div class="flex gap-4 flex-col">
      <div class="bg-white w-full h-[280px] sm:h-[340px] rounded-sm overflow-hidden watch2 cursor-pointer" data-index="${index}">
        <img src="${img}" alt="${movieDataAction.name[index]}" class="w-full h-full object-cover object-center" />
      </div>
      <div>
        <div class='text-[#ad0725] font-bold font-[GM] text-[1.1rem]'>${movieDataAction.name[index]}</div>
        <div class='w-full gap-4 justify-between flex font-[GM] items-center'>
          <div class='text-[0.85rem] text-[#bdb8b86d]'>${movieDataAction.type[index]}</div>
          <div class='text-[0.85rem] text-[#bdb8b86d]'>${movieDataAction.time[index]}</div>
        </div>
      </div>
    </div>
  `;
}).join('');

document.querySelectorAll('.watch2').forEach(el => {
  el.addEventListener('click', (e) => {
    const index = Number(e.currentTarget.dataset.index);
    renderActionMovie(index);
  });
});



//Horror
const Horror = document.querySelector('.Horror');
const movieDataHorror = watchMovie[2];

function renderHorrorMovie(index) {
  srchAppear.classList.remove('flex');
  srchAppear.classList.add('hidden');
  HomeReturn()
  main.style.display = 'none';
  edit.style.display = 'none';
  trailers.forEach(video => {
    video.pause();
    video.muted = true;
  });
  document.querySelectorAll('.slideShowMain video').forEach(video => {
    video.pause();
    video.muted = true;
    video.currentTime = 0;
  });

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
  movie.style.display = 'grid';

  movie.innerHTML = `
      <div class='flex flex-col gap-12 w-full h-auto'>
    <div class='w-full h-auto'>
      <video id="player" playsinline webkit-playsinline controls class="w-full h-[50vh] object-contain">
        <source src="${movieDataHorror.movie[index]}" type="video/mp4" />
      </video>
    </div>
    <div class='w-full h-auto flex gap-6'>
      <div class='flex flex-col gap-3 w-[220px]'>
        <div class='w-full h-[220px]'>
          <img src="${movieDataHorror.img[index]}" alt="${movieDataHorror.name[index]}" class="w-full h-full object-cover object-top" />
        </div>
        <div class='text-[#ad0725] font-bold font-[GM] text-[1.1rem]'>${movieDataHorror.name[index]}</div>
        <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
          <div>${movieDataHorror.type[index]}</div><div>${movieDataHorror.time[index]}</div>
        </div>
      </div>
      <div class='text-white w-full flex flex-col gap-4'>
        <p class='text-[1.1rem] font-[GM] text-[#ad0725]'>Description</p>
        <div class='text-[#bdb8b86d] text-[0.9rem]'>${movieDataHorror.description[index]}</div>
      </div>
    </div>
  </div>

  <div class='swiper swiper5 h-auto w-full'>
    <div class='swiper-wrapper w-full flex xl:flex-col xl:gap-[40px]'>
      ${movieDataHorror.img.map((img, i) => {
        if (i === index) return '';
        return `
          <div class='swiper-slide flex flex-col w-full h-auto'>
            <div class="w-[190px] sm:h-[250px] h-[240px] watchNext cursor-pointer" data-index="${i}">
              <img src="${movieDataHorror.img[i]}" class="w-full h-full object-cover object-top" />
            </div>
            <div class='w-[190px] sm:w-full h-auto'>
              <div class='text-[#ad0725] font-bold font-[GM] text-[1rem]'>${movieDataHorror.name[i]}</div>
              <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
                <div>${movieDataHorror.type[i]}</div><div>${movieDataHorror.time[i]}</div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </div>
  <button class='w-full h-[30px] bg-black border border-[#ad0725] cursor-pointer text-[#ad0725] text-[1.1rem] z-[1200] return3'>Return</button>

  `;


    const player = new Plyr('#player', {
      controls: ['play', 'rewind', 'fast-forward', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      invertTime: false,
    });

    setTimeout(() => {
      const controls = document.querySelector('.plyr__controls');
      if (!controls) return console.warn('Controls not loaded');
      const backBtn = document.createElement('button');
      backBtn.innerHTML = '⏪<br><small>10</small>';
      backBtn.className = 'plyr__control';
      backBtn.onclick = () => player.currentTime -= 10;
      const forwardBtn = document.createElement('button');
      forwardBtn.innerHTML = '⏩<br><small>10</small>';
      forwardBtn.className = 'plyr__control';
      forwardBtn.onclick = () => player.currentTime += 10;
      const volumeBtn = controls.querySelector('[data-plyr="mute"]');
      controls.insertBefore(backBtn, volumeBtn);
      controls.insertBefore(forwardBtn, volumeBtn.nextSibling);
    }, 300);
  

  setTimeout(() => {
    if (document.querySelector('.swiper5')) {
      const swiperInstance = new Swiper('.swiper5', {
        breakpoints: {
          640: {
            direction: 'vertical',
            autoplay: {
              reverseDirection: true,
            },
            slidesPerView: 3,
          },
        },
        direction: 'horizontal',
        autoplay: {
          reverseDirection: true,
        },
        slidesPerView: 2,
        loop: true,
        spaceBetween: 20,
        autoplay: {
          delay: 5500,
          disableOnInteraction: false,
        },
        speed: 1000,
        allowTouchMove: true,
      });

      document.querySelectorAll('.watchNext').forEach(el => {
        el.addEventListener('click', (e) => {
          const newIndex = Number(e.currentTarget.dataset.index);
          renderHorrorMovie(newIndex);
        });
      });
    } else {
      console.warn('Swiper container not found!');
    }
  }, 10);

  // Return button to go back to main screen without reload
  const returnBtn = document.querySelector('.return3');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      console.log('Return clicked');

      srchAppear.classList.remove('hidden');
      srchAppear.classList.add('flex', 'sm:hidden');

      // Pause & reset player video
      const playerVideo = document.querySelector('video#player');
      if (playerVideo) {
        playerVideo.pause();
        playerVideo.currentTime = 0;
        playerVideo.removeAttribute('src');
        playerVideo.load();
        console.log('Player video reset');
      }

      // Pause and reset all slideShowMain videos
      document.querySelectorAll('.slideShowMain video').forEach((video, idx) => {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        video.removeAttribute('src');
        video.load();
        console.log(`SlideShow video ${idx} reset`);
      });

      // Reset iframe if any
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = '';
        console.log('Iframe src cleared');
      }

      // Show main UI parts
      main.style.display = 'flex';
      edit.style.display = 'flex';
      movie.style.display = 'none';

      // Reset swiper slides to first slide *after* DOM changes
      // Make sure swiper instances are defined in the outer scope:
      if (typeof swiper1 !== 'undefined' && typeof swiper2 !== 'undefined') {
        swiper1.slideToLoop(0, 0);
        swiper2.slideToLoop(0, 0);
        console.log('Swiper slides reset to 0');

        // Delay updateVideoPlayback a bit to let swiper update fully
        setTimeout(() => {
          updateVideoPlayback();
          console.log('updateVideoPlayback called after return');
        }, 200);
      } else {
        console.warn('Swiper instances not found');
      }
    });
  }
}

Horror.innerHTML = movieDataHorror.img.map((img, index) => {
  return `
    <div class="flex gap-4 flex-col">
      <div class="bg-white w-full h-[280px] sm:h-[340px] rounded-sm overflow-hidden watch3 cursor-pointer" data-index="${index}">
        <img src="${img}" alt="${movieDataHorror.name[index]}" class="w-full h-full object-cover object-center" />
      </div>
      <div>
        <div class='text-[#ad0725] font-bold font-[GM] text-[1.1rem]'>${movieDataHorror.name[index]}</div>
        <div class='w-full gap-4 justify-between flex font-[GM] items-center'>
          <div class='text-[0.85rem] text-[#bdb8b86d]'>${movieDataHorror.type[index]}</div>
          <div class='text-[0.85rem] text-[#bdb8b86d]'>${movieDataHorror.time[index]}</div>
        </div>
      </div>
    </div>
  `;
}).join('');

document.querySelectorAll('.watch3').forEach(el => {
  el.addEventListener('click', (e) => {
    const index = Number(e.currentTarget.dataset.index);
    renderHorrorMovie(index);
  });
});





document.querySelectorAll('.smooth-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetEl = document.querySelector(targetId);

    if (targetEl) {
      lenis.scrollTo(targetEl, {
        duration: 2.5,               
        smoothTouch: true,
        gestureDirection: "vertical",
        touchMultiplier: 1.5,
        smooth: true,
        easing: (t) => t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2,
        offset: -20,
      });
    }
  });
});

const editSetter = gsap.quickSetter('.edit', 'y', 'px');

let currentY = 0;
let targetY = 0;
let scrollDownAmount = 0;
let lastScrollY = 0;
const maxMove = 120;

function raf(time) {
  lenis.raf(time);

  const scrollY = lenis.scroll;

  if (scrollY > lastScrollY) {
    scrollDownAmount = Math.min(scrollDownAmount + (scrollY - lastScrollY), maxMove);
    targetY = scrollDownAmount;
  } else if (scrollY < lastScrollY) {
    scrollDownAmount = 0;
    targetY = 0;
  }
  currentY += (targetY - currentY) * 0.1;
  editSetter(currentY);

  lastScrollY = scrollY;

  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

const Donate = document.querySelector('.Donate');
const Donate1 = document.querySelector('.Donate1');
const ABA = document.querySelector('.ABA');
const atw = document.querySelector('.atw');
const aboutThisWebsite = document.querySelector('.aboutThisWebsite');

let abaVisible = false;
let atwVisible = false;

Donate.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!abaVisible) {
    gsap.to(ABA, { opacity: 1, display: 'flex', duration: 0.3 });
    abaVisible = true;
    if (atwVisible) {
      gsap.to(aboutThisWebsite, { opacity: 0, display: 'none', duration: 0.3 });
      atwVisible = false;
    }
  } else {
    gsap.to(ABA, { opacity: 0, display: 'none', duration: 0.3 });
    abaVisible = false;
  }
});

Donate1.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!abaVisible) {
    gsap.to(ABA, { opacity: 1, display: 'flex', duration: 0.3 });
    abaVisible = true;
    if (atwVisible) {
      gsap.to(aboutThisWebsite, { opacity: 0, display: 'none', duration: 0.3 });
      atwVisible = false;
    }
  } else {
    gsap.to(ABA, { opacity: 0, display: 'none', duration: 0.3 });
    abaVisible = false;
  }
});

const closeATWPanel = () => {
  gsap.to(aboutThisWebsite, { opacity: 0, display: 'none', duration: 0.3 });
  atwVisible = false;
};

atw.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!atwVisible) {
    gsap.to(aboutThisWebsite, { opacity: 1, display: 'flex', duration: 0.3 });
    atwVisible = true;
    // Close ABA if it's open
    if (abaVisible) {
      gsap.to(ABA, { opacity: 0, display: 'none', duration: 0.3 });
      abaVisible = false;
    }
  } else {
    closeATWPanel();
  }
});

aboutThisWebsite.addEventListener('click', () => {
  if (atwVisible) closeATWPanel();
});

document.body.addEventListener('click', (e) => {
  if (!ABA.contains(e.target)) {
    gsap.to(ABA, { opacity: 0, display: 'none', duration: 0.3 });
    abaVisible = false;
  }

  if (!aboutThisWebsite.contains(e.target) && !atw.contains(e.target) && atwVisible) {
    closeATWPanel();
  }
});


const suggestionBox = document.querySelector('#suggestions');
const searchResult = document.querySelector('.searchResult')
const allMovies = watchMovie.flatMap(section => section.name);

searchInput.addEventListener('input', () => {
  const value = searchInput.value.toLowerCase().trim();
  suggestionBox.innerHTML = '';
  suggestionBox.style.height = '120px'
  suggestionBox.style.top = '-120px'
  
  if (value === '') {
    suggestionBox.classList.add('hidden');
    return;
  }

  const matches = allMovies.filter(name => name.toLowerCase().startsWith(value));

  if (matches.length > 0) {
    matches.forEach(match => {
      const suggestionItem = document.createElement('li');
      const highlight = `<strong>${match.slice(0, value.length)}</strong>${match.slice(value.length)}`;
      suggestionItem.innerHTML = highlight;
      suggestionItem.style.cursor = 'pointer';

      suggestionItem.addEventListener('click', () => {
        searchInput.value = match;
        suggestionBox.innerHTML = '';
        suggestionBox.classList.add('hidden');
        performSearch(match);
      });

      suggestionBox.appendChild(suggestionItem);
    });

    suggestionBox.classList.remove('hidden');
  } else {
    suggestionBox.classList.add('hidden');
  }
});
function performSearch(movieName) {
  movieName = movieName.toLowerCase();

  let foundMovie = null;
  let sectionIndex = -1;
  let movieIndex = -1;

  for (let i = 0; i < watchMovie.length; i++) {
    const names = watchMovie[i].name.map(n => n.toLowerCase());
    const index = names.indexOf(movieName);
    if (index !== -1) {
      sectionIndex = i;
      movieIndex = index;
      foundMovie = {
        name: watchMovie[i].name[movieIndex],
        type: watchMovie[i].type[movieIndex],
        img: watchMovie[i].img[movieIndex],
        movie: watchMovie[i].movie[movieIndex],
        description: watchMovie[i].description[movieIndex],
        trailer: watchMovie[i].trailer?.[movieIndex],
        time: watchMovie[i].time[movieIndex],
      };
      break;
    }
  }

  if (!foundMovie) {
    console.warn("Movie not found");
    return;
  }

  const types = foundMovie.type.split(',').map(t => t.trim());
  const typeHTML = types.map(type => `<span class="list">${type}</span>`).join('');

  listofall.style.display = 'none';

  searchResult.style.display = 'flex';

  searchResult.innerHTML = `
    <div class="Type w-full h-auto"> 
      <div class="flex gap-6 listPart flex-wrap">
        <p id="Movie" class="lists text-white text-xl font-bold">Movie</p>
        ${typeHTML}
      </div>
      <div class="Show h-auto grid mt-4 gap-[32px] w-full z-[12000] grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 text-white">
        <div class="flex gap-4 flex-col watchSearch cursor-pointer" data-section="${sectionIndex}" data-index="${movieIndex}">
          <div class="bg-white w-full h-[280px] sm:h-[340px] rounded-sm overflow-hidden cursor-pointer watch4">
            <img src="${foundMovie.img}" alt="${foundMovie.name}" class="w-full h-full object-cover object-center" />
          </div>
          <div>
            <div class='text-[#ad0725] font-bold font-[GM] text-[1.1rem]'>${foundMovie.name}</div>
            <div class='w-full gap-4 justify-between flex font-[GM] items-center'>
              <div class='text-[0.85rem] text-[#bdb8b86d]'>${foundMovie.type}</div>
              <div class='text-[0.85rem] text-[#bdb8b86d]'>${foundMovie.time}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  suggestionBox.innerHTML = '';
  suggestionBox.classList.add('hidden');
  searchInput.value = foundMovie.name;
  let swiperInstance;
  let click = true;

  const watch4 = searchResult.querySelector('.watch4');
  if (watch4) {
    watch4.addEventListener('click', () => {
      srchAppear.classList.remove('flex');
      document.querySelectorAll('.slideShowMain video').forEach(video => {
        video.pause();
        video.muted = true;
        video.currentTime = 0;
      });
      srchAppear.classList.add('hidden');
      document.querySelectorAll('.slideShowMain video').forEach(video => {
        video.pause();
        video.muted = true;
        video.currentTime = 0;
      });

      main.style.display = 'none';
      movie.style.display = 'grid';
      renderMovie(sectionIndex, movieIndex);
    });
  }

  function renderMovie(sectionIndex, index) {
    edit.style.display = 'none';
    const clickedMovie = {
      name: watchMovie[sectionIndex].name[index],
      type: watchMovie[sectionIndex].type[index],
      img: watchMovie[sectionIndex].img[index],
      movie: watchMovie[sectionIndex].movie[index],
      description: watchMovie[sectionIndex].description[index],
      trailer: watchMovie[sectionIndex].trailer?.[index],
      time: watchMovie[sectionIndex].time[index],
    };
    movie.innerHTML = `
      <div class='flex flex-col gap-12 w-full h-auto'>
        <div class='w-full h-auto'>
          ${
            index === 0 ?
            `<iframe class="w-full h-[50vh] object-contain" src="${clickedMovie.movie}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
            : `<video id="player" playsinline="" webkit-playsinline="" controls class="w-full h-[50vh] object-contain">
            <source src="${clickedMovie.movie}" type="video/mp4" /></video>`
          }
        </div>
        <div class='w-full h-auto flex gap-6'>
          <div class='flex flex-col gap-3 w-[220px]'>
            <div class='w-full h-[220px]'>
              <img src="${clickedMovie.img}" class="w-full h-full object-cover object-top" />
            </div>
            <div class='text-[#ad0725] font-bold font-[GM] text-[1.1rem]'>${clickedMovie.name}</div>
            <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
              <div>${clickedMovie.type}</div><div>${clickedMovie.time}</div>
            </div>
          </div>
          <div class='text-white w-full flex flex-col gap-4'>
            <p class='text-[1.1rem] font-[GM] text-[#ad0725]'>Description</p>
            <div class='text-[#bdb8b86d] text-[0.9rem]'>${clickedMovie.description}</div>
          </div>
        </div>
      </div>

      <div class='swiper swiper6 h-auto w-full'>
        <div class='swiper-wrapper w-full flex xl:flex-col xl:gap-[40px]'>
          ${watchMovie[sectionIndex].name.map((name, i) => `
            <div class='swiper-slide flex flex-col w-full h-auto'>
              <div class="w-[190px] sm:h-[250px] h-[240px] watchNext cursor-pointer" data-index="${i}">
                <img src="${watchMovie[sectionIndex].img[i]}" class="w-full h-full object-cover object-top" />
              </div>
              <div class='w-[190px] sm:w-full h-auto'>
                <div class='text-[#ad0725] font-bold font-[GM] text-[1rem]'>${name}</div>
                <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
                  <div>${watchMovie[sectionIndex].type[i]}</div><div>${watchMovie[sectionIndex].time[i]}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <button class='w-full h-[30px] bg-black border border-[#ad0725] cursor-pointer text-[#ad0725] text-[1.1rem] z-[1200] return4'>Return</button>
    `;

  if (index != 0)    {
    const player = new Plyr('#player', {
      controls: ['play', 'rewind', 'fast-forward', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      invertTime: false,
    });

    setTimeout(() => {
      const controls = document.querySelector('.plyr__controls');
      if (!controls) return console.warn('Controls not loaded');
      const backBtn = document.createElement('button');
      backBtn.innerHTML = '⏪<br><small>10</small>';
      backBtn.className = 'plyr__control';
      backBtn.onclick = () => player.currentTime -= 10;
      const forwardBtn = document.createElement('button');
      forwardBtn.innerHTML = '⏩<br><small>10</small>';
      forwardBtn.className = 'plyr__control';
      forwardBtn.onclick = () => player.currentTime += 10;
      const volumeBtn = controls.querySelector('[data-plyr="mute"]');
      controls.insertBefore(backBtn, volumeBtn);
      controls.insertBefore(forwardBtn, volumeBtn.nextSibling);
    }, 300);
  }
  

    if (swiperInstance) swiperInstance.destroy(true, true);

    swiperInstance = new Swiper('.swiper6', {
      breakpoints: {
        640: {
          direction: 'vertical',
          autoplay: { reverseDirection: true },
          slidesPerView: 3,
        }
      },
      direction: 'horizontal',
      autoplay: {
        reverseDirection: true,
      },
      slidesPerView: 2,
      loop: true,
      spaceBetween: 20,
      autoplay: {
        delay: 5500,
        disableOnInteraction: false,
      },
      speed: 1000,
      allowTouchMove: true,
    });

    // Rebind watchNext after DOM update
    const watchNextItems = document.querySelectorAll('.watchNext');
    watchNextItems.forEach(item => {
      item.addEventListener('click', () => {
        srchAppear.classList.remove('flex');
        srchAppear.classList.add('hidden');
        edit.style.display = 'none';
        document.querySelectorAll('.slideShowMain video').forEach(video => {
          video.pause();
          video.muted = true;
          video.currentTime = 0;
        });

        const i = parseInt(item.getAttribute('data-index'));
        renderMovie(sectionIndex, i);
      });
    });

    const returnBtn = document.querySelector('.return4');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      console.log('Return clicked');

      srchAppear.classList.remove('hidden');
      srchAppear.classList.add('flex', 'sm:hidden');

      // Pause & reset player video
      const playerVideo = document.querySelector('video#player');
      if (playerVideo) {
        playerVideo.pause();
        playerVideo.currentTime = 0;
        playerVideo.removeAttribute('src');
        playerVideo.load();
        console.log('Player video reset');
      }

      // Pause and reset all slideShowMain videos
      document.querySelectorAll('.slideShowMain video').forEach((video, idx) => {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        video.removeAttribute('src');
        video.load();
        console.log(`SlideShow video ${idx} reset`);
      });

      // Reset iframe if any
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = '';
        console.log('Iframe src cleared');
      }

      // Show main UI parts
      main.style.display = 'flex';
      edit.style.display = 'flex';
      movie.style.display = 'none';

      // Reset swiper slides to first slide *after* DOM changes
      // Make sure swiper instances are defined in the outer scope:
      if (typeof swiper1 !== 'undefined' && typeof swiper2 !== 'undefined') {
        swiper1.slideToLoop(0, 0);
        swiper2.slideToLoop(0, 0);
        console.log('Swiper slides reset to 0');

        // Delay updateVideoPlayback a bit to let swiper update fully
        setTimeout(() => {
          updateVideoPlayback();
          console.log('updateVideoPlayback called after return');
        }, 200);
      } else {
        console.warn('Swiper instances not found');
      }
    });
  }
  }
  setTimeout(() => {
    const targetEl = document.querySelector('#Movie');
    if (targetEl) {
      lenis.scrollTo(targetEl, {
        duration: 2.5,
        smoothTouch: true,
        gestureDirection: "vertical",
        touchMultiplier: 1.5,
        smooth: true,
        easing: (t) => t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2,
        offset: -20, 
      });
    }
  }, 100); 
 HomeReturn()
}

searchInput.addEventListener('keydown', (e) => {
  const suggestion = suggestionBox.querySelector('li');
  if (e.key === 'Enter' && suggestion) {
    e.preventDefault();
    HomeReturn()

    const movieName = suggestion.textContent.trim().toLowerCase();

    let foundMovie = null;
    let sectionIndex = -1;
    let movieIndex = -1;

    for (let i = 0; i < watchMovie.length; i++) {
      const names = watchMovie[i].name.map(n => n.toLowerCase());
      const index = names.indexOf(movieName);
      if (index !== -1) {
        sectionIndex = i;
        movieIndex = index;
        foundMovie = {
          name: watchMovie[i].name[movieIndex],
          type: watchMovie[i].type[movieIndex],
          img: watchMovie[i].img[movieIndex],
          movie: watchMovie[i].movie[movieIndex],
          description: watchMovie[i].description[movieIndex],
          trailer: watchMovie[i].trailer?.[movieIndex], 
          time: watchMovie[i].time[movieIndex],
        };
        break;
      }
    }
     setTimeout(() => {
      const targetEl = document.querySelector('#Movie');
      if (targetEl) {
        lenis.scrollTo(targetEl, {
          duration: 2.5,
          smoothTouch: true,
          gestureDirection: "vertical",
          touchMultiplier: 1.5,
          smooth: true,
          easing: (t) => t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2,
          offset: -20, 
        });
      }
    }, 100);
    if (!foundMovie) {
      console.warn("Movie not found");
      return;
    }

    const types = foundMovie.type.split(',').map(t => t.trim());
    const typeHTML = types.map(type => `<span class="list">${type}</span>`).join('');

    listofall.style.display = 'none';
    searchResult.style.display = 'flex';

    searchResult.innerHTML = `
      <div class="Type w-full h-auto"> 
        <div class="flex gap-6 listPart flex-wrap">
          <p id="Movie" class="lists text-white text-xl font-bold">Movie</p>
          ${typeHTML}
        </div>
        <div class="Show h-auto grid mt-4 gap-[32px] w-full z-[12000] grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 text-white">
          <div class="flex gap-4 flex-col watchSearch cursor-pointer" data-section="${sectionIndex}" data-index="${movieIndex}">
            <div class="bg-white w-full h-[280px] sm:h-[340px] rounded-sm overflow-hidden cursor-pointer watch4">
              <img src="${foundMovie.img}" alt="${foundMovie.name}" class="w-full h-full object-cover object-center" />
            </div>
            <div>
              <div class='text-[#ad0725] font-bold font-[GM] text-[1.1rem]'>${foundMovie.name}</div>
              <div class='w-full gap-4 justify-between flex font-[GM] items-center'>
                <div class='text-[0.85rem] text-[#bdb8b86d]'>${foundMovie.type}</div>
                <div class='text-[0.85rem] text-[#bdb8b86d]'>${foundMovie.time}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    suggestionBox.innerHTML = '';
    suggestionBox.classList.add('hidden');
    searchInput.value = foundMovie.name;
    let swiperInstance;
    let click = true;

    const watch4 = searchResult.querySelector('.watch4');
    if (watch4) {
      watch4.addEventListener('click', () => {
        main.style.display = 'none';
        movie.style.display = 'grid';
        renderMovie(sectionIndex, movieIndex);
      });
    }

    function renderMovie(sectionIndex, index) {
      document.querySelectorAll('.slideShowMain video').forEach(video => {
        video.pause();
        video.muted = true;
        video.currentTime = 0;
      });
      edit.style.display = 'none';
      const clickedMovie = {
        name: watchMovie[sectionIndex].name[index],
        type: watchMovie[sectionIndex].type[index],
        img: watchMovie[sectionIndex].img[index],
        movie: watchMovie[sectionIndex].movie[index],
        description: watchMovie[sectionIndex].description[index],
        trailer: watchMovie[sectionIndex].trailer?.[index],
        time: watchMovie[sectionIndex].time[index],
      };

      movie.innerHTML = `
        <div class='flex flex-col gap-12 w-full h-auto'>
          <div class='w-full h-auto'>
              ${
            index === 0 ?
            `<iframe class="w-full h-[50vh] object-contain" src="${clickedMovie.movie}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
            : `<video id="player" playsinline="" webkit-playsinline="" controls class="w-full h-[50vh] object-contain">
            <source src="${clickedMovie.movie}" type="video/mp4" /></video>`
          }
          </div>
          <div class='w-full h-auto flex gap-6'>
            <div class='flex flex-col gap-3 w-[220px]'>
              <div class='w-full h-[220px]'>
                <img src="${clickedMovie.img}" class="w-full h-full object-cover object-top" />
              </div>
              <div class='text-[#ad0725] font-bold font-[GM] text-[1.1rem]'>${clickedMovie.name}</div>
              <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
                <div>${clickedMovie.type}</div><div>${clickedMovie.time}</div>
              </div>
            </div>
            <div class='text-white w-full flex flex-col gap-4'>
              <p class='text-[1.1rem] font-[GM] text-[#ad0725]'>Description</p>
              <div class='text-[#bdb8b86d] text-[0.9rem]'>${clickedMovie.description}</div>
            </div>
          </div>
        </div>

        <div class='swiper swiper6 h-auto w-full'>
          <div class='swiper-wrapper w-full flex xl:flex-col xl:gap-[40px]'>
            ${watchMovie[sectionIndex].name.map((name, i) => `
              <div class='swiper-slide flex flex-col w-full h-auto'>
                <div class="w-[190px] sm:h-[250px] h-[240px] watchNext cursor-pointer" data-index="${i}">
                  <img src="${watchMovie[sectionIndex].img[i]}" class="w-full h-full object-cover object-top" />
                </div>
                <div class='w-[190px] sm:w-full h-auto'>
                  <div class='text-[#ad0725] font-bold font-[GM] text-[1rem]'>${name}</div>
                  <div class='flex justify-between text-[0.85rem] text-[#bdb8b86d] font-[GM]'>
                    <div>${watchMovie[sectionIndex].type[i]}</div><div>${watchMovie[sectionIndex].time[i]}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <button class='w-full h-[30px] bg-black border border-[#ad0725] cursor-pointer text-[#ad0725] text-[1.1rem] z-[1200] return4'>Return</button>
      `;

      
if (index != 0)    {
    const player = new Plyr('#player', {
      controls: ['play', 'rewind', 'fast-forward', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      invertTime: false,
    });

    setTimeout(() => {
      const controls = document.querySelector('.plyr__controls');
      if (!controls) return console.warn('Controls not loaded');
      const backBtn = document.createElement('button');
      backBtn.innerHTML = '⏪<br><small>10</small>';
      backBtn.className = 'plyr__control';
      backBtn.onclick = () => player.currentTime -= 10;
      const forwardBtn = document.createElement('button');
      forwardBtn.innerHTML = '⏩<br><small>10</small>';
      forwardBtn.className = 'plyr__control';
      forwardBtn.onclick = () => player.currentTime += 10;
      const volumeBtn = controls.querySelector('[data-plyr="mute"]');
      controls.insertBefore(backBtn, volumeBtn);
      controls.insertBefore(forwardBtn, volumeBtn.nextSibling);
    }, 300);
}

      if (swiperInstance) swiperInstance.destroy(true, true);

      swiperInstance = new Swiper('.swiper6', {
        breakpoints: {
          640: {
            direction: 'vertical',
            autoplay: { reverseDirection: true },
            slidesPerView: 3,
          }
        },
        direction: 'horizontal',
        autoplay: {
          reverseDirection: true,
        },
        slidesPerView: 2,
        loop: true,
        spaceBetween: 20,
        autoplay: {
          delay: 5500,
          disableOnInteraction: false,
        },
        speed: 1000,
        allowTouchMove: true,
      });
      const watchNextItems = document.querySelectorAll('.watchNext');
      watchNextItems.forEach(item => {
        item.addEventListener('click', () => {
          edit.style.display = 'none';
          document.querySelectorAll('.slideShowMain video').forEach(video => {
            video.pause();
            video.muted = true;
            video.currentTime = 0;
          });
          srchAppear.classList.remove('flex');
          srchAppear.classList.add('hidden');
          const i = parseInt(item.getAttribute('data-index'));
          renderMovie(sectionIndex, i);
        });
      });

      const returnBtn = document.querySelector('.return4');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      console.log('Return clicked');

      srchAppear.classList.remove('hidden');
      srchAppear.classList.add('flex', 'sm:hidden');

      // Pause & reset player video
      const playerVideo = document.querySelector('video#player');
      if (playerVideo) {
        playerVideo.pause();
        playerVideo.currentTime = 0;
        playerVideo.removeAttribute('src');
        playerVideo.load();
        console.log('Player video reset');
      }

      // Pause and reset all slideShowMain videos
      document.querySelectorAll('.slideShowMain video').forEach((video, idx) => {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        video.removeAttribute('src');
        video.load();
        console.log(`SlideShow video ${idx} reset`);
      });

      // Reset iframe if any
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = '';
        console.log('Iframe src cleared');
      }

      // Show main UI parts
      main.style.display = 'flex';
      edit.style.display = 'flex';
      movie.style.display = 'none';

      // Reset swiper slides to first slide *after* DOM changes
      // Make sure swiper instances are defined in the outer scope:
      if (typeof swiper1 !== 'undefined' && typeof swiper2 !== 'undefined') {
        swiper1.slideToLoop(0, 0);
        swiper2.slideToLoop(0, 0);
        console.log('Swiper slides reset to 0');

        // Delay updateVideoPlayback a bit to let swiper update fully
        setTimeout(() => {
          updateVideoPlayback();
          console.log('updateVideoPlayback called after return');
        }, 200);
      } else {
        console.warn('Swiper instances not found');
      }
    });
  }
    }

  }
});


function setRealVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--real-vh', `${vh}px`);
}
setRealVH();
window.addEventListener('resize', setRealVH);

//phone search
const searchInput2 = document.querySelector('#search2');
const suggestionBox2 = document.querySelector('#suggestions2');

searchInput2.addEventListener('input', () => {
  const value = searchInput2.value.toLowerCase().trim();
  suggestionBox2.innerHTML = '';
  
  
  suggestionBox2.style.position = 'fixed';
  suggestionBox2.style.top = '100px';
  suggestionBox2.style.height = '120px';
  
  if (value === '') {
    suggestionBox2.classList.add('hidden');
    return;
  }
  
  const matches = allMovies.filter(name => name.toLowerCase().startsWith(value));
  
  if (matches.length > 0) {
    matches.forEach(match => {
      const suggestionItem = document.createElement('li');
      const highlight = `<strong>${match.slice(0, value.length)}</strong>${match.slice(value.length)}`;
      suggestionItem.innerHTML = highlight;
      suggestionItem.style.cursor = 'pointer';
      
      suggestionItem.addEventListener('click', () => {
        searchInput2.value = match;
        suggestionBox2.innerHTML = '';
        suggestionBox2.classList.add('hidden');
        performSearch(match);
      });
      
      suggestionBox2.appendChild(suggestionItem);
    });
    
    suggestionBox2.classList.remove('hidden');
  } else {
    suggestionBox2.classList.add('hidden');
  }
});
searchInput2.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const suggestion = suggestionBox2.querySelector('li');
    if (suggestion) {
      const movieName = suggestion.textContent.trim();
      searchInput2.value = movieName;
      suggestionBox2.innerHTML = '';
      suggestionBox2.classList.add('hidden');
      performSearch(movieName);
      
      searchInput2.blur();
    }
  }
});

searchInput2.addEventListener('blur', () => {
  const value = searchInput2.value.toLowerCase().trim();
  if (value === '') return;
  
  const activeSuggestion = [...suggestionBox2.children].find(li => li.matches(':hover'));
  const fallback = suggestionBox2.querySelector('li');

  const selected = activeSuggestion || fallback;

  if (selected) {
    const movieName = selected.textContent.trim();
    searchInput2.value = movieName;
    suggestionBox2.innerHTML = '';
    suggestionBox2.classList.add('hidden');
    performSearch(movieName);
  }
});

HomeReturn()
