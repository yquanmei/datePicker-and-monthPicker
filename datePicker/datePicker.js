(function ($) {
  var originThis;

  // 面向对象
  function DatePicker(options) {
    originThis = this;
    this.opts = $.extend({}, DatePicker.DEFAULTS, options);
    this.init();
  }

  // 默认参数
  DatePicker.DEFAULTS = {
    year: null,
    month: null,
    day: null,
    dayCallback: null, // 点击日期之后返回的日期
    swiperDate: null // 开始进入页面或滑动后获取到的日期
  };

  var monthData;
  var clickDay = {};
  // 函数：初始化
  DatePicker.prototype.init = function () {
    this.beforeRender();
    this.render();
    this.clickDay();
    this.aboutTouch();
  };
  // 函数：第一次进入页面，如果带入了值，就显示带入的值
  DatePicker.prototype.beforeRender = function () {
    if (originThis.opts.year && originThis.opts.month && originThis.opts.day) {
      monthData = {
        year: originThis.opts.year,
        month: originThis.opts.month,
        markDay: originThis.opts.day
      }
    }
  };
  // 函数：获取日期
  DatePicker.prototype._getMonthData = function (year, month, markDay) {
    var ret = [];
    var firstDay;
    var markFirstDate;
    if (!year && !month && !markDay) {
      var today = new Date();
      year = today.getFullYear();
      month = today.getMonth() + 1;
      markFirstDate = today.getDate();
      firstDay = new Date(year, month - 1, markFirstDate);
    } else {
      firstDay = new Date(year, month - 1, markDay);
      markFirstDate = markDay - 0;
    }
    var firstDayWeekDay = firstDay.getDay();
    year = firstDay.getFullYear(); // 哪年
    month = firstDay.getMonth() + 1; // 哪月
    var lastDayOfLastMoth = new Date(year, month - 1, 0); // 上个月最后一天
    var lastDateOfLastMonth = lastDayOfLastMoth.getDate(); // 上个月最后一天是几号
    var preMonthDayCount = firstDayWeekDay - 1; // 上个月最后一天是星期几
    var lastDay = new Date(year, month, 0); // 这个月最后一天
    var lastDate = lastDay.getDate(); // 这个月最后一天是几号
    for (var i = 0; i < 7 * 3; i++) {
      var date = i - firstDayWeekDay - 7;
      date = markFirstDate + date;
      var thisMonth = month;
      var showDate = date;
      if (date <= 0) {
        thisMonth = month - 1; // 上个月月份
        showDate = lastDateOfLastMonth + date; // 上个月日期
      } else if (date > lastDate) {
        // 下一月
        thisMonth = month + 1; // 下个月月份
        showDate = showDate - lastDate; // 下个月日期
      }
      thisMonth = thisMonth === 0 ? 12 : thisMonth === 13 ? 1 : thisMonth;
      ret.push({
        month: thisMonth,
        date: date,
        showDate: showDate
      });
    }
    // console.log({
    //   year: year,
    //   month: month,
    //   markDay: markFirstDate,
    //   days: ret
    // });
    return {
      year: year,
      month: month,
      markDay: markFirstDate,
      days: ret
    };
  };

  // 日期选择器的html内容
  DatePicker.prototype._buildUi = function (year, month, markDay) {
    monthData = this._getMonthData(year, month, markDay);
    var html = '<div class="ui-datepicker-container"><ul class="ui-datepicker-head flex-con"><li>SUN</li><li>MON</li><li>TUE</li><li>WED</li><li>THU</li><li>FRI</li><li>SAT</li></ul><div class="ui-datepicker-main-container"><ul class="ui-datepicker-body d-ui-datepicker-body">';
    $('.d-ui-date-day').remove();
    for (var i = 0; i < monthData.days.length; i++) {
      var date = monthData.days[i];
      html += '<li class="ui-date-day d-ui-date-day" data-idx="' + i + '" data-year="' + monthData.year + '" data-month="' + date.month + '" data-date="' + date.date + '"><span class="ui-date-day-span d-ui-date-day-span">' + date.showDate + '</span></li>';
    }
    html += '</ul></div></div>';
    return html;
  };
  // 函数：日期渲染
  DatePicker.prototype.render = function (direction) {
    var year, month, markDay;
    if (monthData) {
      year = monthData.year;
      month = monthData.month;
      markDay = monthData.markDay;
    }
    var operateDate;
    var markMonth;
    var $uiDateDay = $('.d-ui-date-day');
    if (direction === 'prev') {
      markMonth = $uiDateDay.eq(0).attr('data-date') - 0;
      markDay = $uiDateDay.eq(0).text() - 0;
    } else if (direction === 'next') {
      markMonth = $uiDateDay.eq(14).attr('data-date') - 0;
      markDay = $uiDateDay.eq(14).text() - 0;
    }
    if (markMonth) {
      month = markMonth === markDay ? month : markMonth < 0 ? month - 1 : month + 1;
    }
    var isToday = 1;
    if (!year && !month && !markDay) {
      var today = new Date();
      year = today.getFullYear();
      month = today.getMonth() + 1;
      markDay = today.getDate();
      isToday = 2;
    }
    originThis.opts.swiperDate && originThis.opts.swiperDate(year, month, markDay);
    var html = this._buildUi(year, month, markDay);
    var smallDiv = '<div class="d-ui-datepicker-wrapper ui-datepicker-wrapper ui-datepicker-wrapper-show"></div>';
    if (!$('.d-ui-datepicker-wrapper').length) {
      $('.d-ui-datepicker').append(smallDiv);
    }
    $('.d-ui-datepicker-wrapper').html(html);
    _searchThatDay();
    // 函数：找到指定的点击过的点
    function _searchThatDay() {
      if (!monthData) {
        return;
      }
      if (originThis.opts.year && originThis.opts.month && originThis.opts.day) {
        clickDay = {
          year: originThis.opts.year,
          month: originThis.opts.month,
          markDay: originThis.opts.day
        }
      } else {
        if (!clickDay && !clickDay.year) {
          var today1 = new Date();
          clickDay = {
            year: today1.getFullYear(),
            month: today1.getMonth() + 1,
            markDay: today1.getDate()
          }
        }
      }
      var year = clickDay.year;
      var month = clickDay.month;
      var day = clickDay.markDay;
      var specifiedYear = monthData.year;
      var days = monthData.days;
      if (year === specifiedYear) {
        function _getIdx() {
          for (var j = 0; j <days.length; j ++) {
            if (days[j].month === month && days[j].showDate === day) {
              return j;
            }
          }
        }
        var idx = _getIdx();
        if (idx > -1) {
          $('.d-ui-date-day').eq(idx).addClass('active');
        }
      }
    }
  };

  // 函数：touch
  DatePicker.prototype.aboutTouch = function () {
    var that = this;
    $('.dom-agent').off('touchstart', '.d-ui-date-day').on('touchstart', '.d-ui-date-day', aboutTouchStart);
    $('.dom-agent').off('touchmove', '.d-ui-date-day').on('touchmove', '.d-ui-date-day', aboutTouchMove);
    $('.dom-agent').off('touchend', '.d-ui-date-day').on('touchend', '.d-ui-date-day', aboutTouchEnd);
    var touchObj;

    function aboutTouchStart(e) {
      // console.log('touchstart');
      touchObj = {};
      const touch = e.originalEvent.touches[0];
      touchObj.startX = touch.pageX;
      touchObj.initiated = true;
    }

    function aboutTouchMove(e) {
      // console.log('touchmove');
      const touch = e.originalEvent.touches[0];
      const deltaX = touch.pageX - touchObj.startX;
      touchObj.percent = Math.abs(deltaX / window.innerWidth);
      var originWidth;
      originWidth = -window.innerWidth;
      touchObj.deltaX = deltaX;
      if (touchObj.deltaX < 0) { // 左滑
        var today = new Date();
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth() + 1;
        var todayDate = today.getDate();
        for (var i = 7; i < 14; i++) {
          var allYear = $('.d-ui-date-day').eq(i).attr('data-year');
          var allMonth = $('.d-ui-date-day').eq(i).attr('data-month');
          var allDate = $('.d-ui-date-day-span').eq(i).text();
          if (todayYear == allYear && todayMonth == allMonth && todayDate == allDate) {
            touchObj.initiated = false;
            return;
          }
        }
      }
      if (!touchObj.initiated) {
        return;
      }
      if (!Math.abs(touchObj.deltaX) || Math.abs(touchObj.deltaX) < 10) {
        return;
      }
      var moveWidth = deltaX + originWidth;
      var $datepickerBody = $('.d-ui-datepicker-body');
      $datepickerBody.css({
        'transform': 'translate3d(' + moveWidth + 'px, 0, 0)',
        '-webkit-transform': 'translate3d(' + moveWidth + 'px, 0, 0)'
      });
    }

    function aboutTouchEnd(e) {
      // console.log('touchend');
      if (!touchObj.initiated) {
        return;
      }
      if (!Math.abs(touchObj.deltaX) || Math.abs(touchObj.deltaX) < 10) {
        return;
      }
      var $datepickerBody = $('.d-ui-datepicker-body');
      if (touchObj.percent > 0.1) {
        var width = window.innerWidth;
        $datepickerBody.css({
          'transform': 'translate3d(' + width + 'px, 0, 0)',
          '-webkit-transform': 'translate3d(' + width + 'px, 0, 0)',
          'transition-duration': '1s',
          '-webkit-transition-duration': '1s',
        });
        var dir;
        if (touchObj.deltaX > 0) { // 右滑，出现小的日期
          dir = 'prev';
        } else if (touchObj.deltaX < 0) {
          dir = 'next';
        }
        that.render(dir);
      } else {
        $datepickerBody.css({
          'transform': 'translate3d('  + (-window.innerWidth) + 'px, 0, 0)',
          '-webkit-transform': 'translate3d(' + (-window.innerWidth) + 'px, 0, 0)'
        });
      }
      touchObj = {};
    }
  };
  // 函数：点击日期
  DatePicker.prototype.clickDay = function () {
    $('.dom-agent').on('click', '.d-ui-date-day', aboutClick);
    function aboutClick() {
      var that = $(this);
      var idx = that.attr('data-idx');
      var year = monthData.year;
      var month = monthData.days[idx].month;
      var markDay = monthData.days[idx].showDate;
      clickDay = {
        year: year,
        month: month,
        markDay: markDay
      };
      $('.d-ui-date-day').removeClass('active');
      that.addClass('active');
      originThis.opts.dayCallback && originThis.opts.dayCallback(that, clickDay);
    }
  };

  // 直接跟在jquery对象，是一个工具函数。(工具方法)
  $.extend({
    datePicker: function (opts) {
      new DatePicker(opts);
    }
  });
})(jQuery);