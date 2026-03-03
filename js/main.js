/*
  Task Planner — main.js
  Author: Soham
  All jQuery programs included:
    1. mouseenter / mouseleave
    2. AJAX
    3. Method chaining
    4. Show / Hide
    5. Selectors
    6. Form validation
*/

$(function () {

  // Set today's date in header
  var today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  $("#today-date").text(today);


  // ─────────────────────────────────────────
  // Program 1 — mouseenter / mouseleave
  // ─────────────────────────────────────────
  $("#profile-card").mouseenter(function () {
    $("#hover-msg").text("👋 Hi there, Soham!");
  }).mouseleave(function () {
    $("#hover-msg").text("");
  });


  // ─────────────────────────────────────────
  // Program 2 — AJAX: load a quote
  // ─────────────────────────────────────────
  $("#load-quote").click(function () {
    $("#quote-box").text("Loading...");
    $.ajax({
      url: "https://jsonplaceholder.typicode.com/posts/" + (Math.floor(Math.random() * 10) + 1),
      type: "GET",
      success: function (data) {
        // Program 3: method chaining used here
        var quote = data.title.charAt(0).toUpperCase() + data.title.slice(1);
        $("#quote-box")
          .hide()
          .html('"' + quote + '."<br><b>— Daily Tip</b>')
          .fadeIn(500);
      },
      error: function () {
        $("#quote-box").text("Could not load. Try again.");
      }
    });
  });


  // ─────────────────────────────────────────
  // Program 4 — Show / Hide: slide panel
  // ─────────────────────────────────────────
  $("#open-reg").click(function () {
    $("#overlay").fadeIn(200);
    $("#reg-panel").show().animate({ right: "0px" }, 280);
  });

  function closePanel() {
    $("#reg-panel").animate({ right: "-430px" }, 250, function () {
      $(this).hide();
    });
    $("#overlay").fadeOut(200);
  }

  $("#close-reg").click(closePanel);
  $("#overlay").click(closePanel);


  // ─────────────────────────────────────────
  // Task list logic
  // ─────────────────────────────────────────
  var tasks = [];

  function updateStats() {
    var total   = tasks.length;
    var done    = tasks.filter(function (t) { return t.done; }).length;
    var pending = total - done;
    var pct     = total ? Math.round((done / total) * 100) : 0;

    $("#s-total").text(total);
    $("#s-done").text(done);
    $("#s-pending").text(pending);
    $("#s-pct").text(pct + "%");
  }

  function renderTasks() {
    var filter = $(".fb.active").data("f") || "all";
    var list   = filter === "all" ? tasks : tasks.filter(function (t) { return t.cat === filter; });
    var $ul    = $("#task-list").empty();

    if (list.length === 0) {
      $ul.html('<div class="empty">No tasks here. Add one above! 🎯</div>');
      return;
    }

    list.forEach(function (t) {
      var $item = $('<div class="ti' + (t.done ? " done" : "") + '" data-id="' + t.id + '" data-cat="' + t.cat + '">')
        .append(
          $('<input type="checkbox"' + (t.done ? " checked" : "") + '>').on("change", function () {
            t.done = this.checked;
            renderTasks();
            updateStats();
          })
        )
        .append(
          $('<div class="ti-info">')
            .append($('<div class="tn">').text(t.name))
            .append($('<div class="tm">').text(
              (t.note ? t.note + " · " : "") + "Due: " + t.date + " · " + t.pri + " priority"
            ))
        )
        .append($('<span class="badge b-' + t.cat + '">').text(t.cat))
        .append(
          $('<button class="del-btn">✕</button>').on("click", function () {
            var idx = tasks.findIndex(function (x) { return x.id === t.id; });
            if (idx > -1) tasks.splice(idx, 1);
            // Program 3: method chaining — fadeOut then remove
            $(this).closest(".ti").fadeOut(280, function () {
              $(this).remove();
              updateStats();
              renderTasks();
            });
          })
        );

      // Program 3: method chaining — hide then slideDown on insert
      $item.hide().appendTo($ul).slideDown(220);
    });
  }

  // Add task form submit
  $("#task-form").on("submit", function (e) {
    e.preventDefault();
    var valid = true;

    $(".em").removeClass("show");
    $("#t-name").removeClass("ef of");

    var name = $.trim($("#t-name").val());
    var cat  = $("#t-cat").val();
    var date = $("#t-date").val();
    var pri  = $("#t-pri").val();

    if (!name) { $("#te-name").addClass("show"); $("#t-name").addClass("ef"); valid = false; }
    else        { $("#t-name").addClass("of"); }
    if (!cat)   { $("#te-cat").addClass("show");  valid = false; }
    if (!date)  { $("#te-date").addClass("show"); valid = false; }
    if (!pri)   { $("#te-pri").addClass("show");  valid = false; }

    if (!valid) return;

    tasks.push({
      id:   Date.now(),
      name: name,
      cat:  cat,
      date: date,
      pri:  pri,
      note: $.trim($("#t-note").val()),
      done: false
    });

    this.reset();
    updateStats();
    renderTasks();
  });


  // ─────────────────────────────────────────
  // Program 5 — jQuery Selectors (filter bar)
  // ─────────────────────────────────────────
  $(".fb").on("click", function () {
    $(".fb").removeClass("active");          // class selector
    $(this).addClass("active");              // $(this) selector
    var f = $(this).data("f");
    if (f === "all") {
      $(".ti").show();                       // class selector — show all
    } else {
      $(".ti").hide();                       // hide all first
      $(".ti[data-cat='" + f + "']").show(); // attribute selector
    }
  });


  // ─────────────────────────────────────────
  // Program 6 — Form Validation
  // ─────────────────────────────────────────
  $("#reg-form").on("submit", function (e) {
    e.preventDefault();
    var valid = true;

    $(".em").removeClass("show");
    $("#reg-form input[type=text], #reg-form input[type=password], #reg-form input[type=datetime-local]")
      .removeClass("ef of");

    // Name
    if (!$.trim($("#r-name").val())) {
      $("#re-name").addClass("show"); $("#r-name").addClass("ef"); valid = false;
    } else { $("#r-name").addClass("of"); }

    // Gender
    if (!$("input[name='rg']:checked").val()) {
      $("#re-gender").addClass("show"); valid = false;
    }

    // Phone
    var ph = $.trim($("#r-phone").val());
    if (!/^\+?[0-9]{7,15}$/.test(ph)) {
      $("#re-phone").addClass("show"); $("#r-phone").addClass("ef"); valid = false;
    } else { $("#r-phone").addClass("of"); }

    // Hobbies
    if (!$("input[name='rh']:checked").length) {
      $("#re-hobby").addClass("show"); valid = false;
    }

    // Appointment
    var appt = $("#r-appt").val();
    if (!appt || new Date(appt) <= new Date()) {
      $("#re-appt").addClass("show"); valid = false;
    }

    // Country
    if (!$("#r-country").val()) {
      $("#re-country").addClass("show"); valid = false;
    }

    // Resume
    var files = $("#r-resume")[0].files;
    if (!files.length) {
      $("#re-resume").addClass("show"); valid = false;
    } else {
      var ext  = files[0].name.split(".").pop().toLowerCase();
      var allowed = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
      if (!allowed.includes(ext)) {
        $("#re-resume").text("Only PDF, Word or image files.").addClass("show"); valid = false;
      } else if (files[0].size > 2 * 1024 * 1024) {
        $("#re-resume").text("File must be under 2MB.").addClass("show"); valid = false;
      }
    }

    // Email
    var em = $.trim($("#r-email").val());
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      $("#re-email").addClass("show"); $("#r-email").addClass("ef"); valid = false;
    } else { $("#r-email").addClass("of"); }

    // Password
    var pw = $("#r-pass").val();
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/[0-9]/.test(pw) || !/[^a-zA-Z0-9]/.test(pw)) {
      $("#re-pass").addClass("show"); $("#r-pass").addClass("ef"); valid = false;
    } else { $("#r-pass").addClass("of"); }

    // Confirm password
    if (!$("#r-cpass").val() || $("#r-cpass").val() !== pw) {
      $("#re-cpass").addClass("show"); $("#r-cpass").addClass("ef"); valid = false;
    } else { $("#r-cpass").addClass("of"); }

    if (valid) {
      // Program 3 + 4: chaining — slide form up, slide success down
      $("#reg-form").slideUp(280, function () {
        $("#reg-success").hide().slideDown(350);
      });
    }
  });

  // Register again button
  $("#reg-again").click(function () {
    $("#reg-success").slideUp(200, function () {
      $("#reg-form")[0].reset();
      $("#reg-form input").removeClass("ef of");
      $("#reg-form").slideDown(280);
    });
  });

});
