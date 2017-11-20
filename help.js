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
    let CurCommentTextEl = CommentList[CommentIndex];
    if(!CurCommentTextEl.classList.contains("formatted")){
      parseComment(CurCommentTextEl);
    }
  }
}
document.querySelector('#backButton').addEventListener('click',function(){
  document.querySelector('#hiddenBack').click();
});
window.addEventListener('load',function(){
  formatComments(getCommentList());
});
