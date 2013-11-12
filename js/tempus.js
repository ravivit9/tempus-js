/**
 * @author Aleksey Kuznetsov me@akuzn.com
 * @version 0.1.29
 * @url https://github.com/crusat/tempus-js
 * @description Library with date/time methods
 */
(function () {
    /**
     * TempusJS constructor.
     * @constructor
     * @namespace
     */
    var TempusJS = function () {
        // private
        var that = this;
        var version = '0.1.29';
        var locale = 'en_US';
        var weekStartsFromMonday = false;
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var locales = {
            "en_US": {
                "monthShortNames": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                "monthLongNames": ["January", "February", "March", "April", "May", "June", "July", "August",
                    "September", "October", "November", "December"],
                "daysShortNames": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                "daysLongNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            },
            "ru_RU": {
                "monthShortNames": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
                "monthLongNames": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август",
                    "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
                "daysShortNames": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
                "daysLongNames": ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
            }
        };
        var registeredFormats = {
            '%d': {
                format: function(date) {
                    return formattingWithNulls(date.day, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {day: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%m': {
                format: function(date) {
                    return formattingWithNulls(date.month, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {month: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%Y': {
                format: function(date) {
                    return formattingWithNulls(date.year, 4);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {year: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{4}'
            },
            '%w': {
                format: function(date) {
                    return that.getDayOfWeek(date);
                },
                parse: function(value) {
                    // impossible
                    return {};
                },
                parseLit: '\\d{1}'
            },
            '%a': {
                format: function(date) {
                    return locales[locale]["daysShortNames"][that.getDayOfWeek(date)];
                },
                parse: function(value) {
                    // impossible
                    return {};
                },
                parseLit: '\\w+'
            },
            '%A': {
                format: function(date) {
                    return locales[locale]["daysLongNames"][that.getDayOfWeek(date)];
                },
                parse: function(value) {
                    // impossible
                    return {};
                },
                parseLit: '\\w+'
            },
            '%b': {
                format: function(date) {
                    return locales[locale]["monthShortNames"][date.month-1];
                },
                parse: function(value) {
                    var month = that.getMonthNames().indexOf(value)+1;
                    return {month: month !== -1 ? month : undefined}
                },
                parseLit: '\\w+'
            },
            '%B': {
                format: function(date) {
                    return locales[locale]["monthLongNames"][date.month-1];
                },
                parse: function(value) {
                    var month = that.getMonthNames(true).indexOf(value)+1;
                    return {month: month !== -1 ? month : undefined}
                },
                parseLit: '\\w+'
            },
            '%H': {
                format: function(date) {
                    return formattingWithNulls(date.hours, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {hours: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%M': {
                format: function(date) {
                    return formattingWithNulls(date.minutes, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {minutes: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%S': {
                format: function(date) {
                    return formattingWithNulls(date.seconds, 2);
                },
                parse: function(value) {
                    var v = Number(value);
                    return {seconds: (isNaN(v) ? undefined : v) };
                },
                parseLit: '\\d{2}'
            },
            '%s': {
                format: function(date) {
                    return that.time(date);
                },
                parse: function(value) {
                    var v = Number(value);
                    var date = new Date(Number(v*1000));
                    var obj = that.date(v);
                    return isNaN(v) ? {} : that.incDate(obj, date.getTimezoneOffset(), 'minutes');
                },
                parseLit: '\\d{1,10}'
            },
            '%F': {
                format: function(date) {
                    return formattingWithNulls(date.year, 4) + '-' + formattingWithNulls(date.month, 2) + '-' + formattingWithNulls(date.day, 2);
                },
                parse: function(value) {
                    var year = Number(value.slice(0,4));
                    var month = Number(value.slice(6,7));
                    var day = Number(value.slice(9,10));
                    return {
                        year: year,
                        month: month,
                        day: day
                    }
                },
                parseLit: '\\d{4}-\\d{2}-\\d{2}'
            },
            '%D': {
                format: function(date) {
                    return formattingWithNulls(date.month, 2) + '/' + formattingWithNulls(date.day, 2) + '/' + formattingWithNulls(date.year, 4)
                },
                parse: function(value) {
                    var month = Number(value.slice(0,2));
                    var day = Number(value.slice(3,5));
                    var year = Number(value.slice(6,10));
                    return {
                        year: year,
                        month: month,
                        day: day
                    }
                },
                parseLit: '\\d{2}\/\\d{2}\/\\d{4}'
            }
        };

        /**
         * Returns current timestamp (UTC) in seconds. If "date" parameter is not undefined, timestamp was received from this.
         * @param date {object|string} Date as object {year: 2013, month: 1, day: 2, hours: 15, minutes: 10,
         * seconds: 5} or string (any formatted date, see examples)
         * @param format {string|undefined} Date format as string (see formats doc) or undefined for autodetect format.
         * @returns {number} UTC in seconds.
         * @example
         * // returns 1384252977
         * tempus.time();
         * @example
         * // returns 1381795200
         * tempus.time('15.10.2013', '%d.%m.%Y');
         * @example
         * // returns 1381795200
         * tempus.time('15.10.2013');
         * @example
         * // returns 1383609600
         * tempus.time({year: 2013, month: 11, day: 5});
         * @example
         * // returns 1363046400
         * tempus.time('2013-03-12', '%Y-%m-%d');
         * @example
         * // returns 1363360860
         * tempus.time('2013-03-15 15:21', '%Y-%m-%d %H:%M');
         */
        this.time = function (date, format) {
            if (date !== undefined) {
                if (typeof date === 'string') {
                    date = this.parse(date, format);
                }
                return Math.floor((Date.UTC(
                        date.year !== undefined ? date.year : 1970,
                        date.month !== undefined ? date.month-1 : 0,
                        date.day !== undefined ? date.day : 1,
                        date.hours !== undefined ? date.hours : 0,
                        date.minutes !== undefined ? date.minutes : 0,
                        date.seconds !== undefined ? date.seconds : 0)) / 1000);
            } else {
                return Math.floor(new Date().getTime() / 1000);
            }
        };

        // options.week = true
        this.date = function(date, options) {
            var d;
            if (typeof date === "number") {
                var jsDate = new Date(date*1000);
                d = {
                    year: jsDate.getUTCFullYear(),
                    month: jsDate.getUTCMonth() + 1, // js default months beginning from 0.
                    day: jsDate.getUTCDate(),
                    hours: jsDate.getUTCHours(),
                    minutes: jsDate.getUTCMinutes(),
                    seconds: jsDate.getUTCSeconds()
                };
                if (options && options.week === true) {
                    d.week = that.getWeekNumber(d);
                }
                if (options && options.dayOfWeek === true) {
                    d.dayOfWeek = that.getDayOfWeek(d);
                }
            } else if (typeof date === "object") {
                d = {
                    year: date.year !== undefined ? date.year : 1970,
                    month: date.month !== undefined ? date.month : 1,
                    day: date.day !== undefined ? date.day : 1,
                    hours: date.hours !== undefined ? date.hours : 0,
                    minutes: date.minutes !== undefined ? date.minutes : 0,
                    seconds: date.seconds !== undefined ? date.seconds : 0
                };
                if (options && options.week === true) {
                    d.week = that.getWeekNumber(d);
                }
                if (options && options.dayOfWeek === true) {
                    d.dayOfWeek = that.getDayOfWeek(d);
                }
            }
            return d;
        };

        this.now = function (format) {
            var currentDate = new Date();
            var obj = {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1, // js default months beginning from 0.
                day: currentDate.getDate(),
                dayOfWeek: currentDate.getDay(),
                hours: currentDate.getHours(),
                minutes: currentDate.getMinutes(),
                seconds: currentDate.getSeconds(),
                timestamp: Math.floor((currentDate.getTime() - currentDate.getTimezoneOffset() * 60000) / 1000)
            };
            return format === undefined ? obj : this.format(obj, format);
        };

        // is leap year method
        this.isLeapYear = function (year) {
            year = year !== undefined ? Number(year) : this.now().year;
            if (year % 4 == 0) {
                if (year % 100 == 0) {
                    return year % 400 == 0;
                } else return true;
            }
            return false;
        };

        // get days count in month method
        // from 1 to 12
        this.getDaysCountInMonth = function (month, year) {
            var leapYear = year === undefined ? false : this.isLeapYear(year);
            if (typeof month === 'number') {
                if (month === 2) {
                    return daysInMonth[month - 1] + (leapYear ? 1 : 0);
                } else {
                    return daysInMonth[month - 1]
                }
            }
            if (typeof month === 'string') {
                var month_int = indexOf(locales[locale]["monthShortNames"], month);
                if (month_int === -1) {
                    month_int = indexOf(locales[locale]["monthLongNames"], month);
                }
                if (month_int === -1) {
                    return undefined;
                }
                month = month_int;
                if (month === 2) {
                    return daysInMonth[month - 1] + (leapYear ? 1 : 0);
                } else {
                    return daysInMonth[month - 1]
                }
            }
            return undefined;
        };

        this.getMonthNames = function (longNames) {
            if (longNames === true) {
                return locales[locale]["monthLongNames"];
            } else {
                return locales[locale]["monthShortNames"];
            }
        };

        this.getDayNames = function (longNames) {
            if (longNames === true) {
                return locales[locale]["daysLongNames"];
            } else {
                return locales[locale]["daysShortNames"];
            }
        };

        // Algorithm author: Tomohiko Sakamoto in 1993.
        this.getDayOfWeek = function (date) {
            date = that.date(date);
            var year = date.year;
            var month = date.month;
            var day = date.day;
            var t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
            year -= month < 3;
            return Math.floor((year + year / 4 - year / 100 + year / 400 + t[month - 1] + day) % 7);
        };

        var calcDate = function(date, value, type, modif) {
            if (typeof date !== 'object') {
                return undefined;
            }

            var newDate = clone(date);

            if (typeof value === 'object') {
                newDate = that.date(newDate);
                return that.normalizeDate({
                    year: newDate.year + modif*(value.year !== undefined ? value.year : 0),
                    month: newDate.month + modif*(value.month !== undefined ? value.month : 0),
                    day: newDate.day + modif*(value.day !== undefined ? value.day : 0),
                    hours: newDate.hours + modif*(value.hours !== undefined ? value.hours : 0),
                    minutes: newDate.minutes + modif*(value.minutes !== undefined ? value.minutes : 0),
                    seconds: newDate.seconds + modif*(value.seconds !== undefined ? value.seconds : 0)
                });
            } else if (typeof value === 'number') {
                if (type === 'seconds') {
                    newDate.seconds += modif*Number(value);
                }
                if (type === 'minutes') {
                    newDate.minutes += modif*Number(value);
                }
                if (type === 'hours') {
                    newDate.hours += modif*Number(value);
                }
                if (type === 'day') {
                    newDate.day += modif*Number(value);
                }
                if (type === 'month') {
                    newDate.month += modif*Number(value);
                }
                if (type === 'year') {
                    newDate.year += modif*Number(value);
                }
                return that.normalizeDate(newDate);
            } else {
                return undefined;
            }
        };

        this.incDate = function (date, value, type) {
            return calcDate(date, value, type, 1);
        };

        this.normalizeDate = function(date) {
            return clone(this.date(this.time(date)));
        };

        this.decDate = function (date, value, type) {
            return calcDate(date, value, type, -1);
        };

        this.between = function (dateFrom, dateTo, type) {
            var from = this.time(dateFrom);
            var to = this.time(dateTo);
            switch (type) {
                case 'year':
                    return Math.floor((to - from) / (86400 * 12 * 29.4));
                case 'month':
                    return Math.floor((to - from) / (86400 * 29.4)); // 29.4 - average of days count in months
                case 'day':
                    return Math.floor((to - from) / 86400);
                case 'hours':
                    return Math.floor((to - from) / 3600);
                case 'minutes':
                    return Math.floor((to - from) / 60);
                case 'seconds':
                    return to - from;
                default:
                    return undefined;
            }
        };

        this.format = function(date, format) {
            var result = format;
            var d;
            if ((typeof date === 'number')||(typeof date === 'object')) {
                d = this.date(date);
            } else {
                return undefined;
            }
            // formatting
            for (var key in registeredFormats) {
                if (registeredFormats.hasOwnProperty(key)) {
                    result = result.replace(key, registeredFormats[key].format(d));
                }
            }
            return result;
        };

        this.detectFormat = function(str) {
            var defaultFormats = ['^%d.%m.%Y$', '^%m/%d/%Y$', '^%Y-%m-%d$', '^%d.%m.%Y %H:%M:%S$',
                '^%Y-%m-%d %H:%M:%S$', '^%Y$', '^%Y-%m-%d %H:%M$', '^%Y-%m-%d %H$'];
            for (var i=0; i < defaultFormats.length; i++) {
                if (that.parse(str, defaultFormats[i]) !== undefined) {
                    return defaultFormats[i].slice(1,-1);
                }
            }
            return undefined;
        };

        this.parse = function(str, format) {
            var key;
            var litsarr = [];
            if (format === undefined) {
                format = that.detectFormat(str);
            }
            format = '^'+format+'$';
            var format_re = format;
            for (key in registeredFormats) {
                if (registeredFormats.hasOwnProperty(key)) {
                    litsarr.push(key);
                    format_re = format_re.replace(new RegExp('('+key+')', 'g'), '('+registeredFormats[key].parseLit+')');
                }
            }
            var litsstr = new RegExp('('+litsarr.join('|')+')', 'g');
            var lits = format.match(litsstr);
            var re = new RegExp(format_re, 'g');
            var result = re.exec(str);
            var result2 = [];
            try {
                for (var i=1; i < result.length; i++) {
                    if (typeof result[i] === 'string') {
                        result2.push(result[i]);
                    }
                }
            } catch(e) {
                return undefined;
            }
            var resultdate = {};
            var tmpdate;
            for(key in lits) {
                if (lits.hasOwnProperty(key)&&(registeredFormats.hasOwnProperty(lits[key]))&&!isNaN(Number(key))) {
                    tmpdate = registeredFormats[lits[key]].parse(result2[key]);
                    resultdate = {
                        year: tmpdate.year != undefined ? tmpdate.year : resultdate.year,
                        month: tmpdate.month != undefined ? tmpdate.month : resultdate.month,
                        day: tmpdate.day != undefined ? tmpdate.day : resultdate.day,
                        hours: tmpdate.hours != undefined ? tmpdate.hours : resultdate.hours,
                        minutes: tmpdate.minutes != undefined ? tmpdate.minutes : resultdate.minutes,
                        seconds: tmpdate.seconds != undefined ? tmpdate.seconds : resultdate.seconds
                    };
                }
            }
            return this.date(resultdate);
        };

        this.setTimeout = function(callback, timeout) {
            return setTimeout(callback, Number(timeout)*1000);
        };

        this.setInterval = function(callback, timeout) {
            return setInterval(callback, Number(timeout)*1000);
        };

        this.clock = function(callback) {
            callback(that.now());
            return this.setInterval(function() {
                callback(that.now());
            }, 1);
        };

        this.alarm = function(date, callback) {
            var a = this.setInterval(function() {
                if (that.between(that.now(), date, 'seconds') === 0) {
                    callback(date);
                    clearInterval(a);
                }
            }, 1);
            return a;
        };

        this.validate = function(date, format) {
            if (typeof date === 'string') {
                date = this.parse(date, format);
            }
            var normalizedDate = this.normalizeDate(date);
            return (date.year === normalizedDate.year)&&(date.month === normalizedDate.month)&&(date.day === normalizedDate.day)&&
                    (date.hours === normalizedDate.hours)&&(date.minutes === normalizedDate.minutes)&&(date.seconds === normalizedDate.seconds);
        };

        this.reformat = function(date, formatFrom, formatTo) {
            return this.format(this.parse(date, formatFrom), formatTo);
        };

        this.setLocale = function(loc) {
            locale = loc || "en_US";
            return locale;
        };

        this.getLocale = function() {
            return locale;
        };

        this.setWeekStartsFromMonday = function(v) {
            weekStartsFromMonday = v ? true : false;
            return weekStartsFromMonday;
        };
        this.getWeekStartsFromMonday = function() {
            return weekStartsFromMonday;
        };

        this.getAvailableLocales = function() {
            return Object.keys(locales);
        };

        this.getVersion = function() {
            return version;
        };

        /*
         * options.dateFrom - string or object
         * options.formatFrom - string|undefined
         * options.dateTo - string or object
         * options.formatTo - string|undefined
         * options.period - number (seconds)|string (seconds, minutes, hours, day, month, year)
         * options.format - results format, string
         * options.asObject - results is object
         * options.groupBy - group by someone
         */
        this.generateDates = function(options) {
            var tsFrom = options.dateFrom, tsTo = options.dateTo, period, result;
            // timestamp "from"
            if (typeof options.dateFrom === 'string') {
                tsFrom = that.parse(options.dateFrom, options.formatFrom);
            }
            tsFrom = that.time(tsFrom);
            // timestamp "to"
            if (typeof options.dateTo === 'string') {
                tsTo = that.parse(options.dateTo, options.formatTo);
            }
            tsTo = that.time(tsTo);
            // period
            if (typeof options.period === 'number') {
                period = {
                    year: 0,
                    month: 0,
                    day: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: options.period
                }
            } else if (typeof options.period === 'string') {
                period = {
                    year: options.period === 'year' ? 1 : 0,
                    month: options.period === 'month' ? 1 : 0,
                    day: options.period === 'day' ? 1 : 0,
                    hours: options.period === 'hours' ? 1 : 0,
                    minutes: options.period === 'minutes' ? 1 : 0,
                    seconds: options.period === 'seconds' ? 1 : 0
                }
            } else if (typeof options.period === 'object') {
                period = {
                    year: options.period.year !== undefined ? options.period.year : 0,
                    month: options.period.month !== undefined ? options.period.month : 0,
                    day: options.period.day !== undefined ? options.period.day : 0,
                    hours: options.period.hours !== undefined ? options.period.hours : 0,
                    minutes: options.period.minutes !== undefined ? options.period.minutes : 0,
                    seconds: options.period.seconds !== undefined ? options.period.seconds : 0
                }
            }

            // result
            if (options.groupBy === undefined) {
                result = options.asObject === true ? {} : [];
            } else {
                result = [];
                result.push([]);
                var prevValue = that.date(tsFrom, {week:true})[options.groupBy];
            }
            var addTo = function(array, value) {
                if (options.asObject === true) {
                    if (options.format !== undefined) {
                        array[that.format(value, options.format)] = {};
                    } else {
                        array[that.format(value, '%F %H:%M:%S')] = {};
                    }
                } else {
                    if (options.format !== undefined) {
                        array.push(that.format(value, options.format));
                    } else {
                        array.push(value);
                    }
                }
                return array;
            };

            for (; tsFrom <= tsTo; tsFrom = this.time(that.incDate(that.date(tsFrom), period))) {
                if (options.groupBy === undefined) {
                    addTo(result, tsFrom);
                } else {
                    if (that.date(tsFrom, {week:true})[options.groupBy] === prevValue) {
                        addTo(result[result.length-1], tsFrom);
                    } else {
                        result.push([]);
                        addTo(result[result.length-1], tsFrom);
                        prevValue = that.date(tsFrom, {week:true})[options.groupBy];
                    }
                }
            }
            return result;
        };

        this.registerFormat = function(value, formatFunc, parseFunc, parseLit) {
            registeredFormats[value] = {
                format: formatFunc,
                parse: parseFunc,
                parseLit: parseLit
            }
        };
        this.unregisterFormat = function(value) {
            delete registeredFormats[value];
        };

        this.getWeekNumber = function(date) {
            var weekNumber;
            var start;
            var currentDay = this.time(date);
            start = that.time({year: date.year});
            start -= that.getDayOfWeek(start)*86400;
            weekNumber = Math.floor((((currentDay - start)/86400 + (weekStartsFromMonday !== true ? 1 : 0))) / 7) + 1;
            return weekNumber;
        };

        // *** HELPERS ***
        var indexOf = function (obj, fromIndex) {
            if (fromIndex == null) {
                fromIndex = 0;
            } else if (fromIndex < 0) {
                fromIndex = Math.max(0, this.length + fromIndex);
            }
            for (var i = fromIndex, j = this.length; i < j; i++) {
                if (this[i] === obj)
                    return i;
            }
            return -1;
        };
        var formattingWithNulls = function(val, symb_count) {
            var v = val.toString();
            while (v.length < symb_count) {
                v = '0' + v;
            }
            return v;
        };
        var clone = function(obj){
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        };
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(obj, start) {
                for (var i = (start || 0), j = this.length; i < j; i++) {
                    if (this[i] === obj) { return i; }
                }
                return -1;
            }
        }
    };

    window.tempus = new TempusJS();
})();
