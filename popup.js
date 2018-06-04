// chrome.tabs.executeScript({
//   code: //Function string
// });
// Initialize Firebase
var config = {
  apiKey: "AIzaSyA_-Qv1YXYfIMqEoaYhfsljZ_PzOb6GAt4",
  authDomain: "imgurreddit-59dd3.firebaseapp.com",
  databaseURL: "https://imgurreddit-59dd3.firebaseio.com",
  projectId: "imgurreddit-59dd3",
  storageBucket: "imgurreddit-59dd3.appspot.com",
  messagingSenderId: "772446851764"
};
firebase.initializeApp(config);
window.addEventListener('load', function(){
  console.log(reddit);
});