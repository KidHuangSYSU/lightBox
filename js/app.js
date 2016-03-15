(function($) {
  var LightBox = function() {
    var self = this;

    this.popupMask = $('<div id="mask">');
    this.popupWin = $('<div id="popup">');

    this.bodyNode = $(document.body);

    this.renderDOM();

    this.picViewArea = this.popupWin.find(".pic-view");
    this.popupPic = this.popupWin.find(".image");
    this.picCaptionArea = this.popupWin.find(".pic-caption");
    this.nextBtn = this.popupWin.find(".next-btn");
    this.previousBtn = this.popupWin.find(".pre-btn");
    this.captionText = this.popupWin.find(".pic-desc");
    this.currentIndex = this.popupWin.find(".of-index");
    this.closeBtn = this.popupWin.find(".close-btn");

    this.groupName = null;
    this.groupData = [];
    this.bodyNode.delegate(".lightbox", "click", function(e){
      e.stopPropagation();

      var currentGroupName = $(this).attr("data-group");

      if (currentGroupName != self.groupName) {
      	self.groupName = currentGroupName;

      	self.getGroup();
      }

      self.initPopup($(this));
    });

    this.popupMask.click(function() {
      $(this).fadeOut();
      self.popupWin.fadeOut();
    });
    this.closeBtn.click(function() {
      self.popupMask.fadeOut();  
      self.popupWin.fadeOut();    
    });
    this.flag = true;
    this.nextBtn.hover(function(){
      if (!$(this).hasClass("disabled")&&self.groupData.length>1) {
        $(this).addClass("next-btn-show");
      }
    },function() {
      if (!$(this).hasClass("disabled")&&self.groupData.length>1) {
        $(this).removeClass("next-btn-show");
      }	
    }).click(function(e) {
      e.stopPropagation(e);
      if (!$(this).hasClass("disabled")&&self.flag) {
      	self.flag = false;
      	self.goto("next");
      }
    });
    this.previousBtn.hover(function(){
      if (!$(this).hasClass("disabled")&&self.groupData.length>1) {
        $(this).addClass("prev-btn-show");
      }
    },function() {
      if (!$(this).hasClass("disabled")&&self.groupData.length>1) {
        $(this).removeClass("prev-btn-show");
      }	
    }).click(function(e) {
      if (!$(this).hasClass("disabled")&&self.flag) {
      	self.flag = false;
      	e.stopPropagation();
      	self.goto("prev");
      }
    });
  };

  LightBox.prototype = {
    goto: function(dir) {
      if (dir === "next") {
        this.index++;
        if (this.index >= this.groupData.length-1) {
          this.nextBtn.addClass("disabled").removeClass("next-btn-show");
        }
        if (this.index != 0) {
          this.previousBtn.removeClass("disabled");
        }
        var src = this.groupData[this.index].src;
        this.loadPicSize(src);
      } else if (dir === "prev") {
        this.index--;
        if (this.index <= 0) {
          this.previousBtn.addClass("disabled").removeClass("prev-btn-show");
        }
        if (this.index != this.groupData.length-1) {
          this.nextBtn.removeClass("disabled");
        }
        var src = this.groupData[this.index].src;
        this.loadPicSize(src);
      }
    },

  	changePic: function(w, h) {
      var self = this,
          ww = $(window).width();
          wh = $(window).height();

      var scale = Math.min(ww/(w+10), wh/(h+10), 1);
      w = w * scale;
      h = h * scale;
      this.picViewArea.animate({width: w-10,
                                height: h-10});
      this.popupWin.animate({width: w,
                             height: h,
                             marginLeft:-(w/2),
                             top: (wh-h)/2}, function() {
                               self.popupPic.css({width: w-10,
                                                  height: h-10})
                                            .fadeIn();
                               self.picCaptionArea.fadeIn();
                               self.flag = true;
                             });

      this.captionText.text(this.groupData[this.index].caption);
      this.currentIndex.text("当前索引: "+(this.index+1)+" of "+this.groupData.length)
  	},

  	loadPicSize: function(src) {
  	  var self = this;
  	  self.popupPic.css({width:"auto",
  	                     height:"auto"})
  	               .hide();
  	  this.preLoadImg(src, function(){
  	  	self.popupPic.attr("src", src);
  	  	self.changePic(self.popupPic.width(), self.popupPic.height());
  	  })
  	},

    preLoadImg: function(src, callback) {
      var img = new Image();
      if (!!window.ActiveXObject) {
      	img.onreadystatechange = function() {
      	  if (this.readystate == "complete") {
      	  	callback();
      	  }
      	}
      } else {
      	img.onload = function() {
      	  callback();
      	}
      }
      img.src = src;
    },

  	showMaskAndPopup: function(src, currentId) {
  	  var self = this;
  	  this.popupPic.hide();
  	  this.picCaptionArea.hide();
  	  this.popupMask.fadeIn();

  	  var winWidth = $(window).width();
  	  var winHeight = $(window).height();

  	  this.picViewArea.css({width:winWidth/2,
  	                        height:winHeight/2});
  	  var viewHeight = winHeight/2 + 10;
  	  this.popupWin.fadeIn()
  	               .css({width:winWidth/2+10,
  	                     height:viewHeight,
  	                     marginLeft: -(winWidth/2+10)/2,
  	                     top: -viewHeight})
  	               .animate({top:(winHeight-viewHeight)/2}, function(){
  	               	 self.loadPicSize(src);
  	               });

  	  this.index = this.getIndexOf(currentId);
  	  if (this.groupData.length > 1) {
	  	if (this.index == 0) {
	  	  this.previousBtn.addClass("disabled");
	  	  this.nextBtn.removeClass("disabled");
	  	} else if (this.index == this.groupData.length-1) {
	  	  this.nextBtn.addClass("disabled");
	  	  this.previousBtn.removeClass("disabled");
	  	} else {
	  	  this.nextBtn.removeClass("disabled");
	  	  this.previousBtn.removeClass("disabled");
	  	}
	  }
  	},

  	getIndexOf: function(currentId) {
  	  var index = 0;
      $(this.groupData).each(function(i){
      	index = i;
      	if (this.id === currentId) {
      	  return false;
      	}
      })
  	  return index;
  	},

    getGroup: function() {
      var self = this;

      var groupList = this.bodyNode.find("[data-group="+this.groupName+"]");
      self.groupData.length = 0;
      groupList.each(function(){
        self.groupData.push({
          src: $(this).attr("src"),
          id: $(this).attr("data-id"),
          caption: $(this).attr("data-caption")
        });
      });
      
    },

    initPopup: function(currentObj) {
      var self = this,
          src = currentObj.attr("src"),
          currentId = currentObj.attr("data-id");

      this.showMaskAndPopup(src, currentId);
    },

    renderDOM: function() {
      var strDom = '<div class="pic-view">'+
				  	  '<span class="btn pre-btn"></span>'+
				  	  '<img class="image" src="">'+
				  	  '<span class="btn next-btn"></span>'+
				  	'</div>'+
				  	'<div class="pic-caption">'+
				  	  '<div class="caption-area">'+
				  	  	'<p class="pic-desc"></p>'+
				  	  	'<span class="of-index">当前索引：0 of 0</span>'+
				  	  '</div>'+
				  	  '<span class="close-btn"></span>'+
				  	'</div>';
	  this.popupWin.html(strDom);
	  this.bodyNode.append(this.popupMask).append(this.popupWin);
    },
  }

  window["LightBox"] = LightBox;
})(jQuery);