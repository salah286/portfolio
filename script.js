/**
 * Salah Khaled - Personal Portfolio Scripts
 * Features:
 *  - Interactive Canvas Background (Constellation particles reactive to Mouse & Scroll)
 *  - Dynamic Typing Effect
 *  - Navbar Sticky & ScrollSpy
 *  - Mobile Hamburger Menu
 *  - Animated Skill Bars on Viewport Entry
 *  - Contact Form Interaction & Modern Toast Alert
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. INTERACTIVE CANVAS BACKGROUND (Mouse & Scroll Reactive)
     ========================================================================== */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles = [];
    const particleCount = window.innerWidth < 768 ? 40 : 85;
    const connectionDistance = 115;
    const mouseRadius = 150;

    // Mouse Tracking state
    const mouse = {
      x: null,
      y: null,
      targetX: null,
      targetY: null
    };

    // Scroll Tracking state
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let scrollOffset = 0;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2.2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        // Parallax factor: different depths move at different speeds
        this.depth = Math.random() * 0.6 + 0.4;
        
        // Colors: cyan, violet, and electric blue
        const colors = [
          'rgba(6, 182, 212, ',   // Cyan
          'rgba(139, 92, 246, ',  // Purple
          'rgba(59, 130, 246, '   // Blue
        ];
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;

        // Apply scroll drift with parallax depth
        this.y -= scrollVelocity * 0.08 * this.depth;

        // Screen boundary wrap-around
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interaction (Repulsion / Attraction field)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius) {
            const forceDirectionX = dx / dist;
            const forceDirectionY = dy / dist;
            const maxDistance = mouseRadius;
            const force = (maxDistance - dist) / maxDistance;
            const direction = -1; // -1 for gentle push, 1 for pull

            this.x += forceDirectionX * force * 3 * direction;
            this.y += forceDirectionY * force * 3 * direction;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + this.opacity + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.colorPrefix + '0.6)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    // Initialize particles
    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    initParticles();

    // Connect close particles with faint glowing lines
    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const alpha = (1 - distance / connectionDistance) * 0.22;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // Animation Loop
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Smooth scroll velocity decay
      scrollVelocity *= 0.92;
      if (Math.abs(scrollVelocity) < 0.01) scrollVelocity = 0;

      // Smooth mouse follow (lerp)
      if (mouse.targetX !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.1;
          mouse.y += (mouse.targetY - mouse.y) * 0.1;
        }
      }

      // Update & Draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      connectParticles();
      requestAnimationFrame(animate);
    }

    animate();

    // Event Listeners for Canvas
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.targetX = null;
      mouse.targetY = null;
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
    }, { passive: true });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });
  }


  /* ==========================================================================
     2. DYNAMIC TYPING EFFECT
     ========================================================================== */
  const typingElement = document.getElementById('typing');
  if (typingElement) {
    const roles = [
      'Frontend Web Developer',
      'AI & Machine Learning Enthusiast',
      'UI / UX Designer',
      'Computer Science Student'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 110;

    function typeLoop() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 45;
      } else {
        typingElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 95;
      }

      // If full word is typed
      if (!isDeleting && charIndex === currentRole.length) {
        typeDelay = 1900; // Pause before deleting
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeDelay = 500; // Pause before typing next word
      }

      setTimeout(typeLoop, typeDelay);
    }

    typeLoop();
  }


  /* ==========================================================================
     3. NAVBAR: SCROLL EFFECTS & SCROLLSPY
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function handleScrollSpy() {
    const scrollPos = window.scrollY + 140;

    // Toggle navbar glass background on scroll
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Section highlight
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScrollSpy, { passive: true });
  handleScrollSpy();


  /* ==========================================================================
     4. MOBILE MENU TOGGLE
     ========================================================================== */
  const menuToggle = document.getElementById('menuToggle');
  const navLinksContainer = document.getElementById('navLinks');

  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !expanded);
      menuToggle.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
    });

    // Close mobile menu when clicking any nav item
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinksContainer.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        menuToggle.classList.remove('active');
        navLinksContainer.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ==========================================================================
     5. SKILL BARS ANIMATION ON SCROLL INTO VIEW
     ========================================================================== */
  const skillsSection = document.getElementById('skills');
  const skillBars = document.querySelectorAll('.bar div');

  if (skillsSection && skillBars.length > 0) {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          skillBars.forEach((bar) => {
            const targetWidth = bar.getAttribute('data-width') || '80%';
            bar.style.width = targetWidth;
          });
          skillObserver.unobserve(skillsSection); // Animate once
        }
      });
    }, { threshold: 0.25 });

    skillObserver.observe(skillsSection);
  }


  /* ==========================================================================
     6. CONTACT FORM SUBMISSION TOAST
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');

      const name = nameInput ? nameInput.value.trim() : '';

      // Create modern toast alert
      showToast(`Thank you, ${name || 'friend'}! Your message has been sent successfully.`);

      contactForm.reset();
    });
  }

  function showToast(message) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--primary); font-size: 1.2rem;"></i> <span></span>`;
      document.body.appendChild(toast);
    }

    toast.querySelector('span').textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

});
