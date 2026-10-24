(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark =
      stored === "dark" ||
      (stored === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch {}
})();