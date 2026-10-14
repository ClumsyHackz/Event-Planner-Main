// Shared auth helper: guards private pages and handles sign-out.
// Token keys: eventPlannerToken (JWT), eventPlannerUser (JSON of the user).
(function () {
  var HOME = { student: 'student/dashboard.html', organizer: 'organizer/dashboard.html', admin: 'admin/dashboard.html' };
  var base = (document.currentScript.src || '').replace(/js\/auth\.js.*$/, ''); // site root URL
  window.EventPlannerAuth = {
    homeFor: function (role) { return base + (HOME[role] || HOME.student); },
    save: function (data) {
      localStorage.setItem('eventPlannerToken', data.token);
      localStorage.setItem('eventPlannerUser', JSON.stringify(data.user));
    },
    logout: function () {
      localStorage.removeItem('eventPlannerToken');
      localStorage.removeItem('eventPlannerUser');
    }
  };
  // Guard: pages inside /student, /organizer, /admin need a signed-in user of that role.
  var m = location.pathname.match(/\/(student|organizer|admin)\//);
  if (m) {
    var user = null;
    try { user = JSON.parse(localStorage.getItem('eventPlannerUser')); } catch (e) {}
    if (!localStorage.getItem('eventPlannerToken') || !user) { location.replace(base + 'login.html'); return; }
    var role = user.role;
    // admins may see everything; otherwise role must match the folder
    if (role !== 'admin' && role !== m[1]) location.replace(window.EventPlannerAuth.homeFor(role));
  }
  // Sign-out: any link to login.html inside a page folder clears the session.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href$="login.html"]');
    if (a && m) window.EventPlannerAuth.logout();
  });
})();
