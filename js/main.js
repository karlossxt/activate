/* ==========================================================================
   Actívate — Scripts compartidos (Inicio + Tienda)
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---------- Menú móvil ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var navList = document.getElementById("nav-list");

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var open = navList.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.innerHTML = open
        ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
        : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
    });

    /* Submenús en móvil: tocar la categoría abre/cierra el desplegable */
    navList.querySelectorAll(".nav-group").forEach(function (group) {
      var link = group.querySelector(":scope > .nav-link");
      var sub = group.querySelector(":scope > .nav-sub");
      if (!sub || !link) return;

      link.addEventListener("click", function (e) {
        if (window.innerWidth >= 1024) return;
        var isOpen = sub.classList.contains("open");
        navList.querySelectorAll(".nav-sub.open").forEach(function (s) {
          s.classList.remove("open");
        });
        if (!isOpen) sub.classList.add("open");
      });
    });
  }

  /* ---------- Carrusel de servicios ---------- */
  var track = document.getElementById("carousel-track");
  if (track) {
    var slides = track.querySelectorAll(".carousel-slide");
    var prevBtn = document.getElementById("carousel-prev");
    var nextBtn = document.getElementById("carousel-next");
    var dotsWrap = document.getElementById("carousel-dots");
    var index = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Ir a la diapositiva " + (i + 1));
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll(".carousel-dot");

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (d, di) {
        d.classList.toggle("is-active", di === index);
      });
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        goTo(index + 1);
      }, 5000);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(index - 1); restart(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(index + 1); restart(); });

    track.addEventListener("mouseenter", function () {
      if (timer) clearInterval(timer);
    });
    track.addEventListener("mouseleave", restart);

    restart();
  }

  /* ---------- Reproductor de radio (UI) ---------- */
  var playBtn = document.getElementById("radio-play-btn");
  var statusEl = document.getElementById("radio-status");
  var closeBtn = document.getElementById("radio-close");
  var player = document.getElementById("radio-player");
  var playing = false;

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      playing = !playing;
      playBtn.innerHTML = playing
        ? '<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'
        : '<svg class="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      if (statusEl) statusEl.textContent = playing
        ? "EN VIVO — RADIO ACTIVATE EN VIVO"
        : "RADIO ACTIVATE — PAUSADA";
      playBtn.setAttribute("title", playing ? "Pausar" : "Reproducir");
    });
  }

  if (closeBtn && player) {
    closeBtn.addEventListener("click", function () {
      player.classList.add("hidden");
    });
  }

  /* ---------- Animación de aparición ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Carrito de la tienda (pedido por WhatsApp) ---------- */
  var addButtons = document.querySelectorAll(".add-btn");
  var cartFab = document.getElementById("cart-fab");
  var cartBar = document.getElementById("cart-bar");
  var cartCount = document.getElementById("cart-count");
  var cartItems = document.getElementById("cart-items");
  var cartTotal = document.getElementById("cart-total");
  var cartWhatsapp = document.getElementById("cart-whatsapp");
  var cartClear = document.getElementById("cart-clear");
  var cart = [];

  if (addButtons.length) {
    function updateCart() {
      var totalItems = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
      var totalPrice = cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);

      if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.classList.toggle("hidden", totalItems === 0);
        cartCount.classList.toggle("flex", totalItems > 0);
      }

      if (cartItems) {
        cartItems.innerHTML = "";
        cart.forEach(function (item) {
          var row = document.createElement("div");
          row.className = "flex justify-between items-center gap-3 text-sm";
          var name = document.createElement("span");
          name.className = "flex-1";
          name.textContent = item.name + " ×" + item.qty;
          var price = document.createElement("span");
          price.className = "font-semibold text-amber-300";
          price.textContent = "$" + item.price * item.qty;
          row.appendChild(name);
          row.appendChild(price);
          cartItems.appendChild(row);
        });
      }

      if (cartTotal) cartTotal.textContent = "$" + totalPrice;

      if (cartWhatsapp) {
        var message = "Hola, me interesa hacer un pedido:\n";
        cart.forEach(function (item) {
          message += "- " + item.name + " x" + item.qty + " ($" + item.price * item.qty + ")\n";
        });
        message += "Total: $" + totalPrice;
        cartWhatsapp.href = "https://wa.me/+525521120335?text=" + encodeURIComponent(message);
        cartWhatsapp.classList.toggle("hidden", totalItems === 0);
      }
    }

    addButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = btn.dataset.name;
        var price = parseFloat(btn.dataset.price) || 0;
        var found = cart.find(function (item) { return item.name === name; });
        if (found) {
          found.qty += 1;
        } else {
          cart.push({ name: name, price: price, qty: 1 });
        }
        updateCart();

        var original = btn.innerHTML;
        btn.innerHTML =
          '<svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>Agregado';
        btn.disabled = true;
        setTimeout(function () {
          btn.innerHTML = original;
          btn.disabled = false;
        }, 1200);
      });
    });

    if (cartFab) {
      cartFab.addEventListener("click", function () {
        cartBar.classList.toggle("hidden");
      });
    }

    if (cartClear) {
      cartClear.addEventListener("click", function () {
        cart = [];
        updateCart();
      });
    }
  }

  /* ---------- Aviso para secciones "Próximamente" ---------- */
  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.setAttribute("role", "status");
      toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] bg-stone-950 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-2xl border border-amber-500/40 pointer-events-none transition-all duration-300 opacity-0 translate-y-4";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(function () {
      toast.classList.remove("opacity-0", "translate-y-4");
      toast.classList.add("opacity-100", "translate-y-0");
    });
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.add("opacity-0", "translate-y-4");
      toast.classList.remove("opacity-100", "translate-y-0");
    }, 2400);
  }

  document.querySelectorAll(".nav-disabled").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showToast("Sección en construcción — próximamente");
    });
  });

  /* ---------- Año actual en el pie ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
