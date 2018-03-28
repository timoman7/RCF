var OPTIONS = {
  mode: (localStorage.getItem('OPTIONS') != undefined ? JSON.parse(localStorage.getItem('OPTIONS')).mode : "formatted"),
  fcColor: (localStorage.getItem('OPTIONS') != undefined ? JSON.parse(localStorage.getItem('OPTIONS')).fcColor : "rgb(255,0,0)")
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
function updatePreview(){
  let inputR = document.querySelector('#inputR') || {value:255};
  let inputG = document.querySelector('#inputG') || {value:0};
  let inputB = document.querySelector('#inputB') || {value:0};
  let previewColor = `rgb(${parseFloat(inputR.value)},${parseFloat(inputG.value)},${parseFloat(inputB.value)})`;
  document.querySelector('#preview').style.background = previewColor;
}
function setfcColor(){
  let inputR = document.querySelector('#inputR') || {value:255};
  let inputG = document.querySelector('#inputG') || {value:0};
  let inputB = document.querySelector('#inputB') || {value:0};
  let OPTCOLOR = `rgb(${parseFloat(inputR.value)},${parseFloat(inputG.value)},${parseFloat(inputB.value)})`;
  chrome.tabs.executeScript({
    code: "setOptionValue(\"fcColor\",\""+OPTCOLOR+"\")"
  });
  OPTIONS.fcColor = OPTCOLOR;
  localStorage.setItem('OPTIONS', JSON.stringify(OPTIONS));
}
let toggleButton = document.querySelector("#ToggleButton");
toggleButton.addEventListener('click', toggleMode);
let inputR = document.querySelector('#inputR');
let inputG = document.querySelector('#inputG');
let inputB = document.querySelector('#inputB');
inputR.addEventListener('change', updatePreview);
inputG.addEventListener('change', updatePreview);
inputB.addEventListener('change', updatePreview);
let setColorBtn = document.querySelector('#setColor');
setColorBtn.addEventListener('click', setfcColor);
window.addEventListener('load',function(){
  let _fcColor = OPTIONS.fcColor.match(/\d*/g).filter((e)=>{return e!=""});
  inputR.value = ""+_fcColor[0];
  inputG.value = ""+_fcColor[1];
  inputB.value = ""+_fcColor[2];
  updatePreview();
  chrome.tabs.executeScript({
    code: "setOptionValue(\"mode\",\""+OPTIONS.mode+"\")"
  });
  toggleButton.innerHTML = OPTIONS.mode == "formatted" ? "Formatted" : "Original";
});
