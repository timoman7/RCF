var pastCommentCount = 0;
var OPTIONS = {
  mode: "formatted"
};
function setOptionValue(opt, val){
  console.log(opt, val);
  if(opt == "mode" && OPTIONS.mode != val){
    pastCommentCount = 0;
  }
  OPTIONS[opt] = val;
  localStorage.setItem("ICFOPTIONS", JSON.stringify(OPTIONS));
}
(function Factory(){
  var originalComments = {};
  const Formatting = {
    Super: "^",
    Strong: "*",
    Emphasis: "~",
    Code: "`",
    Sub: "_",
    Strike: "-"
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
  function formatComments(CommentList){
    for(let CommentIndex = 0; CommentIndex < CommentList.length; CommentIndex++){
      let CommentContainer = CommentList[CommentIndex].querySelector(".caption");
      let CurCommentTextEl = CommentContainer.querySelector(".usertext").children[1].children[0];
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
    }
    setTimeout(containerUpdate, 5000);
  }
  function CommentLoop(){
    containerUpdate();
  }
  function windowOnLoad(){
    setTimeout(CommentLoop, 500);
  }
  window.addEventListener('load',windowOnLoad);
  console.log(originalComments)
  //console.log(localStorage);
})();
