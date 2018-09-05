(function (global, factory) {
  var obj = factory();
  global.MonthPicker = obj.MonthPicker;
})(window, function () {
  // 为了防止模块编写的时候污染外部环境，就会用匿名函数。
  var originThis;
  var MonthPicker = function (options) {
    originThis = this;
    // this.opts = Object.assign({}, MonthPicker.DEFAULTS, options);
    this.opts = $.extend({}, MonthPicker.DEFAULTS, options);;
    originThis.init();
  };
  // 默认参数
  MonthPicker.DEFAULTS = {
    year: null,
    month: null,
    monthCallback: null, // 点击日期之后返回的日期
    swiperMonth: null // 开始进入页面或滑动后获取到的日期
  };
  var monthData;
  var $wrapper;
  var $monthpickerBody;
  var $monthpickerContainer;
  var clickDay = {};
  var numDir = '';
  MonthPicker.prototype = {
    getMonthData: function (year, month) {
      var ret = [];
      var firstDay;
      var markFirstDate;
      var year, month;
      if (!year && !month) {
        var today = new Date();
        year = today.getFullYear();
        month = today.getMonth() + 1;
      } else {
        year = year;
        month = month;
      }
      var wholeMonthArr = [];
      for (var i = 0; i < 7 * 3; i++) {
        var date = i - 13 + month;
        var thisMonth = month;
        var eMonth = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        var finalMonthStr;
        if (date <= 12) {
          if (date === 0) {
            finalMonthStr = finalMonthStr = eMonth.slice(date - 1);
          } else {
            if (date === -12) {
              finalMonthStr = eMonth.slice(date - 1 + 12);
            } else if (date < -12) {
              finalMonthStr = eMonth.slice(date - 1 + 12, date + 12);
            } else {
              finalMonthStr = eMonth.slice(date - 1, date);
            }
          }
        } else if (date > 12) {
          finalMonthStr = eMonth.slice(date - 12 - 1, date - 12);
        } else if (date === 0) {

        }
        finalMonthStr = finalMonthStr.toString();
        var thisYear;
        if (date <= 0) {
          if (date <= -12) {
            thisYear = year - 2;
            thisMonth = 24 + date;
          } else {
            thisYear = year - 1;
            thisMonth = 12 + date;
          }
        } else if (date > 12) {
          thisYear = year + 1;
          thisMonth = date - 12;
        } else {
          thisYear = year;
          thisMonth = date;
        }
        var chineseMonth = _sectionToChinese(thisMonth);
        ret.push({
          year: thisYear,
          showMonth: thisMonth,
          chineseMonth: chineseMonth,
          eMonthStr: finalMonthStr
        });
      }
      console.log(ret);
      function _sectionToChinese(section) {
        var chnNumChar = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
        // var num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        section = parseInt(section);
        var chnStr = chnNumChar[section - 1];
        return chnStr;
      }

      return ret;
    },
    init: function () {
      originThis.beforeRender();
      originThis.render();
      originThis.clickDay();
      originThis.aboutTouch();
    },
    buildUi: function (year, month) {
      monthData = originThis.getMonthData(year, month);
      var html = '<div class="ui-monthpicker-head-container"><ul class="ui-monthpicker-head">';
      $('.d-ui-monthpicker-day').remove();
      $('.ui-monthpicker-eMonth').remove();
      for (var i = 0; i < monthData.length; i++) {
        var date = monthData[i];
        html += '<li class="ui-monthpicker-eMonth">' + date.eMonthStr + '</li>';
      }
      html += '</ul></div><div class="ui-monthpicker-main-container"><ul class="ui-monthpicker-body">';
      for (var j = 0; j < monthData.length; j++) {
        var date2 = monthData[j];
        html += '<li class="ui-monthpicker-day d-ui-monthpicker-day" data-idx="' + j + '" data-year="' + date2.year + '" data-month="' + date2.showMonth + '"><span class="ui-monthpicker-day-span">' + date2.chineseMonth + '</span></li>';
      }
      html += '</ul></div>';
      return html;
    },
    // 函数：第一次进入页面，如果带入了值，就显示带入的值
    beforeRender: function () {
      if (originThis.opts.year && originThis.opts.month) {
        monthData = {
          year: originThis.opts.year,
          month: originThis.opts.month
        }
      }
    },
    render: function (direction) {
      var year, month;
      if (monthData) {
        year = monthData.year;
        month = monthData.month;
      }
      var operateDate;
      var markMonth;
      if (direction === 'prev') {
        year = $('.ui-monthpicker-day').eq(6).attr('data-year') - 0;
        markMonth = $('.ui-monthpicker-day').eq(6).attr('data-month') - 0;
      } else if (direction === 'next') {
        year = $('.ui-monthpicker-day').eq(20).attr('data-year') - 0;
        markMonth = $('.ui-monthpicker-day').eq(20).attr('data-month') - 0;
      }
      if (markMonth) {
        month = markMonth;
      }
      var isToday = 1;
      if (!year && !month) {
        var today = new Date();
        year = today.getFullYear();
        month = today.getMonth() + 1;
        isToday = 2;
      }
      originThis.opts.swiperMonth && originThis.opts.swiperMonth(year, month);
      var html = originThis.buildUi(year, month);
      $wrapper = document.querySelector('.ui-monthpicker-wrapper');
      if (!$wrapper) {
        $wrapper = document.createElement('div');
        document.querySelector('.ui-monthpicker').appendChild($wrapper);
        $wrapper.className = 'ui-monthpicker-wrapper ui-monthpicker-wrapper-show d-ui-monthpicker-wrapper';
        var divCon = document.createElement('div');
        divCon.className = 'ui-monthpicker-container-wrapper';
        var divSmallCon = document.createElement('div');
        divSmallCon.className = 'ui-monthpicker-container';
        $wrapper.appendChild(divCon);
        divCon.appendChild(divSmallCon);
        // $wrapper.appendChild('<div class="ui-monthpicker-container-wrapper"><div class="ui-monthpicker-container">')
      }

      $monthpickerContainer = document.querySelector('.ui-monthpicker-container');

      $monthpickerContainer.innerHTML = html;
      searchThatDay();
      function searchThatDay() {
        if (!monthData) {
          return;
        }
        if (originThis.opts.year && originThis.opts.month) {
          clickDay = {
            year: originThis.opts.year,
            month: originThis.opts.month
          }
        } else {
          if (!clickDay && !clickDay.year) {
            var today = new Date();
            clickDay = {
              year: today.getFullYear(),
              month: today.getMonth() + 1
            }
          }
        }
        var _year = clickDay.year - 0;
        var _month = clickDay.month - 0;
        var days = monthData;
        function _getIdx() {
          for (var j = 0; j < days.length; j++) {
            if (days[j].year === _year && days[j].showMonth === _month) {
              return j;
            }
          }
        }
        var idx = _getIdx();
        // var idx = days.findIndex((item) => {
        //   return item.year === year && item.showMonth === month;
        // });
        if (idx > -1) {
          $('.d-ui-monthpicker-day').eq(idx).addClass('active');
        }
      }
    },
    clickDay: function () {
      $wrapper.addEventListener('click', function (e) {
        var $target = e.target;
        if ($target.classList.contains('ui-monthpicker-day') || $target.classList.contains('ui-monthpicker-day-span')) {
          var idx;
          if ($target.classList.contains('ui-monthpicker-day')) {
            idx = $target.dataset.idx - 0;
          } else {
            idx = $target.parentNode.dataset.idx - 0;
          }
          var year = monthData[idx].year;
          var month = monthData[idx].showMonth;
          clickDay = {
            year: year,
            month: month
          };
          $('.ui-monthpicker-day').removeClass('active');
          if (e.target.classList.contains('ui-monthpicker-day')) {
            e.target.classList.add('active');
          } else {
            e.target.parentNode.classList.add('active');
          }
          e.target.classList.add('active');
          originThis.opts.monthCallback && originThis.opts.monthCallback(e, clickDay);
        }
      });
    },
    aboutTouch: function () {
      var touchObj;
      $monthpickerContainer.addEventListener('touchstart', function (e) {
        touchObj = {};
        var $target = e.currentTarget;
        if ($target.classList.contains('ui-monthpicker-container')) {
          const touch = e.touches[0];
          touchObj.startX = touch.pageX;
          touchObj.initiated = true;
        }
      });
      $monthpickerContainer.addEventListener('touchmove', function (e) {
        var $target = e.currentTarget;
        if ($target.classList.contains('ui-monthpicker-container')) {
          const touch = e.touches[0];
          const deltaX = touch.pageX - touchObj.startX;
          touchObj.percent = Math.abs(deltaX / window.innerWidth);
          var originWidth;
          originWidth = -window.innerWidth;
          touchObj.deltaX = deltaX;
          if (touchObj.deltaX < 0) { // 左滑
            var today = new Date();
            var todayYear = today.getFullYear();
            var todayMonth = today.getMonth() + 1;
            for (var i = 7; i < 14; i++) {
              var allYear = document.querySelectorAll('.d-ui-monthpicker-day')[i].dataset.year;
              var allMonth = document.querySelectorAll('.d-ui-monthpicker-day')[i].dataset.month;
              if (todayYear == allYear && todayMonth == allMonth) {
                touchObj.initiated = false;
                return;
              }
            }
          }
          if (!touchObj.initiated) {
            return;
          }
          if (Math.abs(touchObj.deltaX) < 10) {
            return;
          }
          var moveWidth;
          moveWidth = deltaX;
          document.querySelector('.ui-monthpicker-head-container').style.transform = 'translate3d(' + moveWidth + 'px, 0, 0)';
          document.querySelector('.ui-monthpicker-main-container').style.webkitTransform = 'translate3d(' + moveWidth + 'px, 0, 0)';
          document.querySelector('.ui-monthpicker-head-container').style.webkitTransform = 'translate3d(' + moveWidth + 'px, 0, 0)';
          document.querySelector('.ui-monthpicker-main-container').style.webkitTransform = 'translate3d(' + moveWidth + 'px, 0, 0)';
        }
      });
      $wrapper.addEventListener('touchend', function (e) {
        if (!touchObj.initiated) {
          return;
        }
        if (!Math.abs(touchObj.deltaX) || Math.abs(touchObj.deltaX) < 10) {
          return;
        }
        var $monthpickerBody = document.querySelector('.ui-monthpicker-head-container');
        var $monthpickerBody2 = document.querySelector('.ui-monthpicker-main-container');
        if (touchObj.percent > 0.1) {
          var width = window.innerWidth;
          $monthpickerBody.style.transform = 'translate3d(' + width + 'px, 0, 0)';
          $monthpickerBody.style.webkitTransform = 'translate3d(' + width + 'px, 0, 0)';
          $monthpickerBody.style.transitionDuration = '1s';
          $monthpickerBody.style.webkitTransitionDuration = '1s';
          $monthpickerBody2.style.transform = 'translate3d(' + width + 'px, 0, 0)';
          $monthpickerBody2.style.webkitTransform = 'translate3d(' + width + 'px, 0, 0)';
          $monthpickerBody2.style.transitionDuration = '1s';
          $monthpickerBody2.style.webkitTransitionDuration = '1s';
          if (touchObj.deltaX > 0) { // 右滑，出现小的日期
            originThis.render('prev');
            numDir = 'prev';
          } else if (touchObj.deltaX < 0) {
            originThis.render('next');
            numDir = 'next';
          }
        } else {
          $monthpickerBody.style.transform = 'translate3d(' + (-window.innerWidth) + 'px, 0, 0)';
          $monthpickerBody.style.webkitTransform = 'translate3d(' + (-window.innerWidth) + 'px, 0, 0)';
          $monthpickerBody2.style.transform = 'translate3d(' + (-window.innerWidth) + 'px, 0, 0)';
          $monthpickerBody2.style.webkitTransform = 'translate3d(' + (-window.innerWidth) + 'px, 0, 0)';
        }
        touchObj = {};
        // searchThatDay();
        // 函数：找到指定的点击过的点

      });
    }
  };
  return {
    MonthPicker: MonthPicker
  }
});