var OPTIONS = {
  mode: (localStorage.getItem('OPTIONS') != undefined ? JSON.parse(localStorage.getItem('OPTIONS')).mode : "formatted")
};
function toggleMode(e){
  console.log(e);
  e.srcElement.innerHTML = e.srcElement.innerHTML == "Formatted" ? "Original" : "Formatted";
  let OPTMODE = e.srcElement.innerHTML.toLowerCase();
  chrome.tabs.executeScript({
    code: "setOptionValue(\"mode\",\""+OPTMODE+"\")"
  });
  OPTIONS.mode = OPTMODE;
  localStorage.setItem('OPTIONS', JSON.stringify(OPTIONS));
}
let toggleButton = document.querySelector("#ToggleButton");
toggleButton.addEventListener('click', toggleMode);
window.addEventListener('load',function(){
  chrome.tabs.executeScript({
    code: "setOptionValue(\"mode\",\""+OPTIONS.mode+"\")"
  });
  toggleButton.innerHTML = OPTIONS.mode == "formatted" ? "Formatted" : "Original";
});
