/**
 * Things to add
 * 1. Give each favorite comment in localStorage an additional data segment: weither or not it cotains a reaction link
 *  1.1 If it does contain it, add a class identifier to the comment, indicating the requirement of a regex link search.
 *
 */
var pastCommentCount = 0;
var OPTIONS = localStorage.getItem('ICFOPTIONS')!=null?JSON.parse(localStorage.getItem('ICFOPTIONS')):{
  mode: "formatted",
  fcColor: "red"
};
var DATA = localStorage.getItem('ICFDATA')!=null?JSON.parse(localStorage.getItem('ICFDATA')):{
  favoriteComments: {}
};
function setOptionValue(opt, val){
  if(opt == "mode" && OPTIONS.mode != val){
    pastCommentCount = 0;
  }
  OPTIONS[opt] = val;
  localStorage.setItem("ICFOPTIONS", JSON.stringify(OPTIONS));
}
function setDataValue(dat, val){
  DATA[dat] = val;
  localStorage.setItem("ICFDATA", JSON.stringify(DATA));
}
(function Factory(){
  let jsStylesheet = `
    body{
      background: #141518;
    }
    .favcomment-caption-link{
      transform: scale(0.75);
      height: 0px;
      text-align: center;
      margin: 0;
      border: 0;
      padding: 0;
      vertical-align: sub;
    }
    .favcomment-caption-link.icon-favorite-outline{
      transition-property: transform;
      transition-duration: 0.2s;
    }
    .favcomment-caption-link.icon-favorite-fill{
      transition-property: color transform;
      transition-duration: 0.2s;
      color: ${OPTIONS.fcColor};
    }
    .favcomment-caption-link:active{
      transform: scale(1);
    }
  `;
  function stylize(el, params){
    // $.extend(el.style, params);
    for(let prop in params){
      el.style[prop] = params[prop];
    }
  }
  function addElement(params){
    let e = document.createElement(params.tagName || 'div');
    let appendTo = params.appendTo || document.body;
    let eClass = params.class!=undefined?params.class instanceof Array?params.class.join(' '):typeof params.class=='string'?params.class:'':'';
    let listeners = params.listeners || 'none';
    let style = params.style || 'none';
    delete params.style;
    delete params.tagName;
    delete params.appendTo;
    delete params.class;
    delete params.listeners;
    $.extend(e, params);
    if(eClass.length>0){
      eClass.split(' ').forEach((c)=>{
        e.classList.add(c);
      });
    }
    if(listeners != 'none' && (!(listeners instanceof Array) && (listeners instanceof Object))){
      Object.keys(listeners).forEach((eventName)=>{
        let events = listeners[eventName];
        events.forEach((_event)=>{
          e.addEventListener(eventName, _event);
        });
      });
    }
    if(style != 'none' && (!(style instanceof Array) && (style instanceof Object))){
      stylize(e, style);
    }
    if(appendTo != 'none'){
      appendTo.appendChild(e);
    }
    return e;
  }
  let fileTypes = [
    'jpg',
    'jpeg',
    'gifv',
    'gif',
    'png',
    'mp4'
  ];
  let ICFReactionRegex = new RegExp(`^((http[s]?|ftp):\\/)?\\/?([^:\\/\\s]+)((\\/\\w+)*\\/)([\\w\\-\\.]+(${fileTypes.join('|')}))(.*)?(#[\\w\\-]+)?$`);
  let _clientId = '6a5400948b3b376';
  async function getCommentById(commentId){
    return await $.ajax({
    	url: `https://api.imgur.com/3/comment/${commentId}`,
    	type: 'GET',
    	headers: {
    		Authorization: `Client-ID ${_clientId}`,
      },
    	success: function(){
        return arguments;
      }
    });
  }
  async function getImageById(imageHash){
    return await $.ajax({
    	url: `https://api.imgur.com/3/image/${imageHash}`,
    	type: 'GET',
    	headers: {
    		Authorization: `Client-ID ${_clientId}`,
      },
    	success: function(){
        return arguments;
      }
    });
  }
  async function getAlbumById(albumHash){
    return await $.ajax({
    	url: `https://api.imgur.com/3/album/${albumHash}`,
    	type: 'GET',
    	headers: {
    		Authorization: `Client-ID ${_clientId}`,
      },
    	success: function(){
        return arguments;
      }
    });
  }
  window.ICFFunctions = {
    getCommentById,
    getImageById,
    getAlbumById
  };
  var originalComments = {};
  const Formatting = {
    Super: "^",
    Strong: "*",
    Emphasis: "~",
    Code: "`",
    Sub: "_",
    Strike: "-",
    Color: "#",
    Gradient: "$"
  };
  const RegExpList = {
    Super: {
      Start: {
        _RegExp: new RegExp('\\^\\[','g'),
        Replacer: "<sup style=\"vertical-align: super\">",
      },
      End: {
        _RegExp: new RegExp('\\]\\^','g'),
        Replacer: "</sup>"
      }
    },
    Strong: {
      Start: {
        _RegExp: new RegExp('\\*\\[','g'),
        Replacer: "<strong>",
      },
      End: {
        _RegExp: new RegExp('\\]\\*','g'),
        Replacer: "</strong>"
      }
    },
    Emphasis: {
      Start: {
        _RegExp: new RegExp('\\~\\[','g'),
        Replacer: "<em>",
      },
      End: {
        _RegExp: new RegExp('\\]\\~','g'),
        Replacer: "</em>"
      }
    },
    Code: {
      Start: {
        _RegExp: new RegExp('\\`\\[','g'),
        Replacer: "<pre style=\"background-color: rgba(255,255,255,0.1); white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word; font-family: Courier, 'New Courier', monospace; font-size: 12px;\">",
      },
      End: {
        _RegExp: new RegExp('\\]\\`','g'),
        Replacer: "</pre>"
      }
    },
    Sub: {
      Start: {
        _RegExp: new RegExp('\\_\\[','g'),
        Replacer: "<sub style=\"vertical-align: sub\">",
      },
      End: {
        _RegExp: new RegExp('\\]\\_','g'),
        Replacer: "</sub>"
      }
    },
    Strike: {
      Start: {
        _RegExp: new RegExp('\\-\\[','g'),
        Replacer: "<strike>",
      },
      End: {
        _RegExp: new RegExp('\\]\\-','g'),
        Replacer: "</strike>"
      }
    },
    Color: {
      Start: {
        _RegExp: new RegExp('\\#\\{([a-zA-Z0-9]+)\\}\\[','g'),
        Replacer: "<color style=\"color: #$1\">"
      },
      End: {
        _RegExp: new RegExp('\\]\\#','g'),
        Replacer: "</color>"
      }
    },
    Gradient: {
      Start: {
        _RegExp: new RegExp('\\$\\{(([#a-zA-Z0-9 ]+)(,[#a-zA-Z0-9 ]+)+)\\}\\[','g'),
        Replacer: "<color style=\"background:linear-gradient($1);-webkit-background-clip: text;-webkit-text-fill-color:transparent;\">"
      },
      End: {
        _RegExp: new RegExp('\\]\\$','g'),
        Replacer: "</color>"
      }
    }
  };

  function getCommentList(){
    return document.querySelectorAll(".comment");
  }
  function checkForPairs(Format, _String){
    Format.Start._RegExp.lastIndex = 0;
    Format.End._RegExp.lastIndex = 0;
    return (Format.Start._RegExp.test(_String) && Format.End._RegExp.test(_String));
  }
  function styleComment(_Comment, FormatStyle){
    _Comment.innerHTML = _Comment.innerHTML.replace(FormatStyle.Start._RegExp, FormatStyle.Start.Replacer);
    _Comment.innerHTML = _Comment.innerHTML.replace(FormatStyle.End._RegExp, FormatStyle.End.Replacer);
  }
  function parseComment(_Comment){
    if(!_Comment.classList.contains("formatted")){
      for(let FormatStyle in RegExpList){
        if(checkForPairs(RegExpList[FormatStyle], _Comment.innerHTML)){
          styleComment(_Comment, RegExpList[FormatStyle]);
        }
      }
    }
    _Comment.classList.add("formatted");
  }
  function updateFCButtons(){
    if(localStorage.getItem('ICFDATA') != null){
      if(JSON.parse(localStorage.getItem('ICFDATA')).favoriteComments != undefined){
        let fc = JSON.parse(localStorage.getItem('ICFDATA')).favoriteComments;
        Object.keys(fc).forEach((kn)=>{
          c = fc[kn];
          let e = document.querySelector(`[data-id="${kn}"]`);
          if(e){
            if(e.querySelector){
              let ec = e.querySelector('.favcomment-caption-link');
              if(ec){
                if(ec.classList){
                  ec.classList.add('isfavorite');
                }
              }
            }
          }
        });
      }
    }
    let replyButton = document.querySelectorAll('.comment-create-reply:not(.comment-favorite)');
    replyButton.forEach((b)=>{
      stylize(b, {
        height: '50%',
        borderRadius: '0px 6px 0px 0px'
      });
    });
    let favButtons = document.querySelectorAll('.favcomment-caption-link:not(.isfavorite)');
    favButtons.forEach((b)=>{
      b.classList.add('icon-favorite-outline');
      b.classList.remove('icon-favorite-fill');
      //b.classList.remove('red');
    });
    let favButtonsActFav = document.querySelectorAll('.favcomment-caption-link.isfavorite');
    favButtonsActFav.forEach((b)=>{
      b.classList.remove('icon-favorite-outline');
      b.classList.add('icon-favorite-fill');
      //b.classList.add('red');
    });
  }
  async function addToFavComments(clickComment){
    if(localStorage.getItem('ICFDATA') == null){
      localStorage.setItem('ICFDATA', JSON.stringify({favoriteComments: {}}));
    }
    let commentId = clickComment.getAttribute('data-id');
    let albumHash = await (async function(e){
      let d = await getCommentById(e);
      return d.data.image_id;
    })(commentId);
    let imageHash = await (async function(e){
      let d = await getCommentById(e);
      return d.data.album_cover;
    })(commentId);
    let ICFDATA = JSON.parse(localStorage.getItem('ICFDATA'));
    let newComments = Object.assign({}, ICFDATA.favoriteComments);
    newComments[commentId] = {
      commentId: commentId,
      imageHash: imageHash,
      albumHash: albumHash
    };
    setDataValue('favoriteComments', newComments);
  }
  function removeFavComment(clickComment){
    if(localStorage.getItem('ICFDATA') == null){
      localStorage.setItem('ICFDATA', JSON.stringify({favoriteComments: {}}));
    }
    let commentId = clickComment.getAttribute('data-id');
    let ICFDATA = JSON.parse(localStorage.getItem('ICFDATA'));
    let newComments = Object.assign({}, ICFDATA.favoriteComments);
    delete newComments[commentId];
    setDataValue('favoriteComments', newComments);
  }
  function clickFavButton(b){
    let clickComment = b.currentTarget.parentNode.parentNode.parentNode; // b.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    if(localStorage.getItem('ICFDATA') == null){
      localStorage.setItem('ICFDATA', JSON.stringify({favoriteComments: {}}));
    }
    let ICFDATA = JSON.parse(localStorage.getItem('ICFDATA'));
    if(ICFDATA.favoriteComments[clickComment.getAttribute('data-id')]){
      b.currentTarget.querySelector('.favcomment-caption-link').classList.remove('isfavorite');
      removeFavComment(clickComment);
    }else{
      b.currentTarget.querySelector('.favcomment-caption-link').classList.add('isfavorite');
      addToFavComments(clickComment);
    }
    updateFCButtons();
  }
  function addFCButtons(CommentList){
    for(let CommentIndex = 0; CommentIndex < CommentList.length; CommentIndex++){
      let CommentContainer = CommentList[CommentIndex].querySelector(".caption");
      let UserText = CommentContainer.querySelector(".usertext");
      if(!UserText.classList.contains('addedBtn')){
        let commentFavorite = addElement({
          tagName: 'div',
          appendTo: 'none',
          class: [
            'comment-favorite',
            'comment-create-reply'
          ],
          style: {
            top: "50%",
            height: "50%",
            borderRadius: "0px 0px 6px 0px"
          },
        });
        let favCommentWrapper = addElement({
          tagName: 'div',
          appendTo: commentFavorite,
          listeners: {
            click: [
              clickFavButton
            ]
          },
          class:[
            'comment-favorite-wrapper'
          ],
          style:{
            lineHeight: "0px",
            transform: "translateY(-3px)"
          }
        });
        let favCommentBtn = addElement({
          tagName: 'div',
          appendTo: favCommentWrapper,
          class: [
            'post-action-icon',
            'favcomment-caption-link'
          ],
          style: {
            transition: "transform 0.2s color 0.2s"
          },
          innerHTML: ''
        });
        UserText.appendChild(commentFavorite);
        UserText.classList.add('addedBtn');
      }
    }
  }
  function formatComments(CommentList){
    for(let CommentIndex = 0; CommentIndex < CommentList.length; CommentIndex++){
      let CommentContainer = CommentList[CommentIndex].querySelector(".caption");
      let UserText = CommentContainer.querySelector(".usertext");
      let CurCommentTextEl = UserText.children[1].children[0];
      if(!CurCommentTextEl.classList.contains("formatted")){
        originalComments[CommentContainer.getAttribute("data-id")] = CurCommentTextEl.innerHTML+"";
        localStorage.setItem("originalComments", JSON.stringify(originalComments));
      }
      let lsOPTIONS = localStorage.getItem('ICFOPTIONS') ? JSON.parse(localStorage.getItem('ICFOPTIONS')) : OPTIONS;
      if(lsOPTIONS.mode == "formatted"){
        if(!CurCommentTextEl.classList.contains("formatted")){
          parseComment(CurCommentTextEl);
        }
      }else if(lsOPTIONS.mode == "original"){
        if(CurCommentTextEl.classList.contains("formatted")){
          let commentDataId = CommentContainer.getAttribute("data-id");
          let _originalComments = JSON.parse(localStorage.getItem("originalComments"));
          if(_originalComments.hasOwnProperty(commentDataId)){
            CurCommentTextEl.innerHTML = _originalComments[commentDataId];
            CurCommentTextEl.classList.remove("formatted");
          }
        }
      }
    }
  }
  function checkCommentCount(CommentList){
    if(CommentList.length > pastCommentCount){
      pastCommentCount = CommentList.length;
      return true;
    }else{
      return false;
    }
  }
  function containerUpdate(){
    let commentList = getCommentList();
    if(checkCommentCount(commentList)){
      formatComments(commentList);
      addFCButtons(commentList);
    }
    updateFCButtons();
    setTimeout(containerUpdate, 5000);
  }
  function CommentLoop(){
    containerUpdate();
  }
  function textToLink(commentText){
    let _domLink = `<img src='${commentText.replace('.gifv','.gif')}' style='height:64px;'>`;
    let rv = {
      toReplace: commentText,
      domLink: _domLink
    };
    return rv;
  }
  let favFix = `
    .comment-favorite.comment-create-reply{
      height:100%;
      margin: auto 0 auto 0;
    }
    .comment-favorite-wrapper{
      position: absolute;
      padding: 50% 0;
      left: 50px;
      top:50%;
    }
  `;
  function commentToDOM(comD, imgD, albD){
    let ct = document.getElementById('commentTemplate');
    ct.content.querySelector('#comment-item').querySelector('.caption.unvotable').setAttribute('data-id',comD.data.id);
    ct.content.querySelector('#comment-item').querySelector('#imgHREF').href = `/gallery/${imgD.data.id}`;
    ct.content.querySelector('#comment-item').querySelector('#imgSRC').src = `//i.imgur.com/${albD.data.cover||imgD.data.id}b.jpg`;
    ct.content.querySelector('#comment-item').querySelector('#author').querySelector('#comment-username').href=`/user/${comD.data.author}`;
    ct.content.querySelector('#comment-item').querySelector('#author').querySelector('#comment-username').title=`${comD.data.author}`;
    ct.content.querySelector('#comment-item').querySelector('#author').querySelector('#comment-username').innerHTML=`${comD.data.author} via ${comD.data.platform}`;
    let linkifiedComment = comD.data.comment;
    let commentWords = linkifiedComment.replace(',','').split(/\s/);
    let imageLinksInComment = [];
    commentWords.forEach((w)=>{
      let wCheck = w.match(ICFReactionRegex);
      if(wCheck != null){
        let tempCommentText = textToLink(wCheck[0]);
        imageLinksInComment.push(tempCommentText);
      }
    });
    imageLinksInComment.forEach((l)=>{
      linkifiedComment = linkifiedComment.replace(l.toReplace,l.domLink);
    });
    ct.content.querySelector('#comment-item').querySelector('#commentText').innerHTML = linkifiedComment;//`${comD.data.comment}`;
    ct.content.querySelector('#comment-item').querySelector('#context').href = `/gallery/${albD.data.id||imgD.data.id}/comment/${comD.data.id}/1`;
    ct.content.querySelector('#comment-item').querySelector('#context').innerHTML = `context`;
    let newComment = document.importNode(ct.content, true);
    return newComment;
  }
  async function getFavComments(){
    let _ICFDATA = JSON.parse(localStorage.getItem('ICFDATA')) || {favoriteComments:{}};
    let favComments = _ICFDATA.favoriteComments || {};
    Object.keys(favComments).forEach(async function(kn){
      let v = favComments[kn];
      let commentData = await getCommentById(v.commentId);
      let imageData = commentData.data.on_album?await getImageById(commentData.data.album_cover):await getImageById(v.imageHash);
      let albumData = commentData.data.on_album?(v.albumHash?await getAlbumById(v.albumHash):await getAlbumById(v.imageHash)):await getImageById(v.imageHash);
      document.querySelector('.captions').appendChild(commentToDOM(commentData, imageData, albumData));
    });
  }

  function onFavoriteComments(){
    addElement({
      tagName: 'link',
      appendTo:document.head,
      rel: 'stylesheet',
      href: 'https://s.imgur.com/min/user.css?1522103590'
    });
    addElement({
      tagName: 'link',
      appendTo: document.head,
      rel: 'stylesheet',
      href: 'https://s.imgur.com/min/global.css?1522103590'
    });
    addElement({
      tagName: 'link',
      appendTo: document.head,
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i,800,800i'
    });
    addElement({
      tagName: 'style',
      appendTo: document.head,
      innerHTML: favFix
    });
    ///document.body.style.backgroundColor = "#141518";
    let mCommentContainer = document.createElement('div');
    mCommentContainer.id="comments-container";
    mCommentContainer.classList.add("comments-initialized");
    let mCaptions = document.createElement('div');
    mCaptions.classList.add('captions');
    mCommentContainer.appendChild(mCaptions);
    document.body.appendChild(mCommentContainer);
    let cTemplate = document.createElement('template');
    cTemplate.id = 'commentTemplate';
    cTemplate.innerHTML =
    '<div id="comment-item" style="background: #2c2f34; padding: 9px 12px 11px 15px; border-radius: 6px 6px 6px 0;">\n'+
      '<div class="image" style="display: inline-block">\n'+
        '<a id="imgHREF">\n'+
          '<img id="imgSRC" style="width: 64px; height: 64px;">\n'+
        '</a>\n'+
      '</div>\n'+
      '<div class="comment-wrapper" style="display: inline-block">\n'+
        '<div class="comment">\n'+
          '<div class="caption unvotable">\n'+
            '<div class="usertext cf">\n'+
              '<div id="author" class="author">\n'+
                '<a id="comment-username" class="comment-username">\n'+
                '</a>\n'+
              '</div>\n'+
              '<span>\n'+
                '<span id="commentText">\n'+
                '</span>\n'+
              '</span>\n'+
            '</div>\n'+
          '</div>\n'+
        '</div>\n'+
        '<a id="context">\n'+
        '</a>\n'+
      '</div>\n'+
      '<div class="clear">\n'+
      '</div>\n'+
    '</div>';
    document.body.appendChild(cTemplate);
    let _root = document.getElementById('root');
    getFavComments();
  }
  function addFCButton(){
    let uud = document.querySelector('.user-dropdown-container');
    if(uud){
      let a = document.createElement('li');
      let ud = uud.querySelector('.user-dropdown');
      let aref = document.createElement('a');
      aref.href = `//imgur.com/user/ICFExtension/favoriteComments`;
      aref.innerHTML = 'favorite comments';
      a.appendChild(aref);
      $(a).insertBefore($(ud).children()[3]);
    }else{
      let ddl = document.querySelector('.NavbarUserMenu');
      if(ddl){
        let myMenu = ddl.querySelector('.Dropdown-menu').querySelector('.Dropdown-list').querySelector('.Dropdown-option-group');
        if(myMenu){
          let newOption = document.createElement('a');
          newOption.classList.add('Dropdown-option');
          newOption.href = `//imgur.com/user/ICFExtension/favoriteComments`;
          newOption.innerHTML = 'Favorite comments';
          $(newOption).insertBefore($(myMenu).children()[3]);
        }
      }
    }
  }
  function windowOnLoad(){
    if(window.location.origin == 'https://imgur.com'){
      addElement({
        tagName: 'style',
        appendTo: document.head,
        innerHTML: jsStylesheet
      });
      addFCButton();
      if(window.location.pathname.match(/\/gallery\/[a-zA-Z0-9]*\b/g)){
        setTimeout(CommentLoop, 500);
      }else if(window.location.pathname.match(/\/user\/[a-zA-Z0-9_]*\/favoriteComments/)){
        addElement({
          tagName: 'link',
          appendTo: document.head,
          rel: 'stylesheet',
          href: 'https://s.imgur.com/min/gallery.css?1522188452'
        });
        onFavoriteComments();
        setTimeout(CommentLoop, 500);
      }
    }
  }
  window.addEventListener('load',windowOnLoad);
})();

/**
 * Ideas:
 * Add color tag
 * #{HEXCOLOR}[]#
**/
