;(function ($, window, document, undefined) {
    var $win = $(window);
    var $doc = $(document);
    var startHourDefault, startMinutesDefault, nowDate, nowHours, nowMinutes, nowYear, nowMonth, stations;

    if (!String.prototype.padStart) {
        String.prototype.padStart = function padStart(targetLength, padString) {
            targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
            padString = String((typeof padString !== 'undefined' ? padString : ' '));
            if (this.length > targetLength) {
                return String(this);
            } else {
                targetLength = targetLength - this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
                }
                return padString.slice(0, targetLength) + String(this);
            }
        };
    }

    function showReturnJourneyFormIfAppropriate() {
        var isChecked = $('#book_return').prop('checked');

        var $formToggleRow = $('.form-toggle-row');
        if (isChecked) {
            $formToggleRow.slideDown();
        } else {
            $formToggleRow.slideUp();
        }

        $formToggleRow.find('input, select').prop('disabled', !isChecked);
    }

    $doc.ready(function () {
        var dateToday = new Date();
        var dateFormat = 'dd/mm/yy';
        var timeDifference = 1;
        var startHour = '09:00';
        var firstStartHours = '06:00';


        var $startTimeSelect = $('#field-departure-time');
        var $endTimeSelect = $('#field-return-time');

        nowYear = moment().year();
        nowMonth = moment().month();
        nowDate = moment().date();
        nowHours = moment().hour();
        nowMinutes = moment().minutes();

        // // Datepicker start date
        var from = $('#field-outward').datepicker({
            dateFormat: dateFormat,
            showOn: 'both',
            firstDay: 1,
            buttonImage: 'css/images/calendar.png',
            buttonImageOnly: true,
            buttonText: 'Select date',
            minDate: dateToday
        }).on('change', function () {
            var that = this;

            to.datepicker('option', 'minDate', getDate(that));

            checkDurationBetweenDates(getDate(that), to.datepicker('getDate', '+1d'));
        });

        // Datepicker end date
        var to = $('#field-return').datepicker({
            dateFormat: dateFormat,
            showOn: 'both',
            firstDay: 1,
            buttonImage: 'css/images/calendar.png',
            buttonImageOnly: true,
            buttonText: 'Select date',
            minDate: dateToday

        }).on('change', function () {
            var that = this;

            from.datepicker('option', 'maxDate', getDate(that));

            checkDurationBetweenDates(from.datepicker('getDate', '+1d'), getDate(that));
        });

        // Set default value in datepickers
        $('.datepicker').datepicker('setDate', dateToday);

        // and the default in the departure time picker...
        // var now = new Date();
        // var val = Math.ceil((now.getMinutes()+(now.getHours() * 60)) / 30.0) * 30;
        // if (val >= 1410) {
        // 	val = val % 1410;
        // }
        // document.getElementById("field-departure-time").selectedIndex = val/30;

        // Time Counting 
        $startTimeSelect.on('change', function () {
            var departureValue = $(this).find('option:selected').val();
            var departureMoment = moment(departureValue, 'HH:mm');
            var minReturnMoment = departureMoment.add(timeDifference, 'hours').format('HH:mm');
            var returnMomentMins = moment.duration(minReturnMoment).asMinutes();
            var departureDate = $('#field-outward').datepicker('getDate', '+1d');
            var returnDate = $('#field-return').datepicker('getDate', '+1d');

            if (moment(departureDate, dateFormat).date() === moment(returnDate, dateFormat).date() && moment(departureDate, dateFormat).month() === moment(returnDate, dateFormat).month() && moment(departureDate, dateFormat).year() === moment(returnDate, dateFormat).year()) {

                if (returnMomentMins >= 0 && returnMomentMins <= 330) {
                    returnMomentMins = 540;

                    departureDate.setDate(departureDate.getDate() + 1);

                    $('#field-return').datepicker('setDate', departureDate);
                }
            }

            // Years
            var startYear = moment(departureDate, dateFormat).year();
            var endYear = moment(returnDate, dateFormat).year();

            // Month
            var startMonth = moment(departureDate, dateFormat).month();
            var endMonth = moment(returnDate, dateFormat).month();

            // Date
            var startDate = moment(departureDate, dateFormat).date();
            var endDate = moment(returnDate, dateFormat).date();

            var startDateEndDateDiff = (startDate !== endDate && startMonth === endMonth && startYear === endYear) || (startDate === endDate && startMonth !== endMonth && startYear === endYear) || (startDate === endDate && startMonth === endMonth && startYear !== endYear) || (startDate !== endDate && startMonth !== endMonth && startYear === endYear) || (startDate === endDate && startMonth !== endMonth && startYear !== endYear) || (startDate !== endDate && startMonth === endMonth && startYear !== endYear) || (startDate !== endDate && startMonth !== endMonth && startYear !== endYear);

            if (startDateEndDateDiff) {
                $endTimeSelect.find('option').prop('disabled', false);
            } else {
                $endTimeSelect.find('option').each(function () {
                    var returnValue = $(this).val()
                    var returnValueMoment = moment.duration(returnValue).asMinutes()

                    if (returnValueMoment === returnMomentMins) {
                        $(this).prevAll().prop('disabled', true);

                        $(this).prop({
                            'disabled': false,
                            'selected': true
                        }).nextAll().prop('disabled', false);
                    }
                });
            }
        });

        // Parse Date Datepicker 
        function getDate(element) {
            var date;
            try {
                date = $.datepicker.parseDate(dateFormat, element.value);
            } catch (error) {
                date = null;
            }

            return date;
        }

        function checkDurationBetweenDates(start, end) {
            // Datepicker years
            var startYear = moment(start, dateFormat).year();
            var endYear = moment(end, dateFormat).year();

            // Datepicker month
            var startMonth = moment(start, dateFormat).month();
            var endMonth = moment(end, dateFormat).month();

            // Datepicker Date
            var startDate = moment(start, dateFormat).date();
            var endDate = moment(end, dateFormat).date();

            // Select Start Hour
            var selectStartValue = $startTimeSelect.find('option:selected').val();

            // Change End Hour in select
            var changeEndHourPlusDuration = moment(selectStartValue, 'HH:mm').add(timeDifference, 'hours').format('HH:mm');
            var changeEndHour = moment(startHour, 'HH:mm').add(timeDifference, 'hours').format('HH:mm');

            var currentSelectValues = setHoursDuration(nowMinutes, nowHours);

            var startDateEndDateDiff = (startDate !== endDate && startMonth === endMonth && startYear === endYear) || (startDate === endDate && startMonth !== endMonth && startYear === endYear) || (startDate === endDate && startMonth === endMonth && startYear !== endYear) || (startDate !== endDate && startMonth !== endMonth && startYear === endYear) || (startDate === endDate && startMonth !== endMonth && startYear !== endYear) || (startDate !== endDate && startMonth === endMonth && startYear !== endYear) || (startDate !== endDate && startMonth !== endMonth && startYear !== endYear);

            var startDateNowDateDiff = (nowDate !== startDate && nowMonth === startMonth && nowYear === startYear) || (nowDate === startDate && nowMonth !== startMonth && nowYear === startYear) || (nowDate === startDate && nowMonth === startMonth && nowYear !== startYear) || (nowDate !== startDate && nowMonth !== startMonth && nowYear === startYear) || (nowDate === startDate && nowMonth !== startMonth && nowYear !== startYear) || (nowDate !== startDate && nowMonth === startMonth && nowYear !== startYear) || (nowDate !== startDate && nowMonth !== startMonth && nowYear !== startYear);

            var endDateNowDateDiff = (nowDate !== endDate && nowMonth === endMonth && nowYear === endYear) || (nowDate === endDate && nowMonth !== endMonth && nowYear === endYear) || (nowDate === endDate && nowMonth === endMonth && nowYear !== endYear) || (nowDate !== endDate && nowMonth !== endMonth && nowYear === endYear) || (nowDate === endDate && nowMonth !== endMonth && nowYear !== endYear) || (nowDate !== endDate && nowMonth === endMonth && nowYear !== endYear) || (nowDate !== endDate && nowMonth !== endMonth && nowYear !== endYear);

            var startDateEndDateEqual = startDate === endDate && startMonth === endMonth && startYear === endYear;

            var startDateNowDateEqual = startDate === nowDate && startMonth === nowMonth && startYear === nowYear;

            var endDateNowDateEqual = endDate === nowDate && endMonth === nowMonth && endYear === nowYear;

            if (startDateEndDateDiff && endDateNowDateDiff && startDateNowDateDiff) {
                $startTimeSelect.find('option[value="' + firstStartHours + '"]')
                    .prop({
                        'disabled': false,
                        'selected': true
                    })
                    .siblings().prop('disabled', false);

                $endTimeSelect.find('option[value="' + firstStartHours + '"]')
                    .prop({
                        'disabled': false,
                        'selected': true
                    })
                    .siblings().prop('disabled', false);

            } else if (startDateEndDateEqual && endDateNowDateDiff && startDateNowDateDiff) {
                $startTimeSelect.find('option[value="' + firstStartHours + '"]')
                    .prop({
                        'disabled': false,
                        'selected': true
                    })
                    .siblings().prop('disabled', false);

                $endTimeSelect.find('option[value="' + moment(firstStartHours, 'HH:mm').add(timeDifference, 'hours').format('HH:mm') + '"]')
                    .prop({
                        'disabled': false,
                        'selected': true
                    })
                    .nextAll().prop('disabled', false);

                $endTimeSelect.find('option[value="' + moment(firstStartHours, 'HH:mm').add(timeDifference, 'hours').format('HH:mm') + '"]')
                    .prop({
                        'disabled': false,
                        'selected': true
                    }).prevAll().prop('disabled', true);

            } else if (startDateNowDateEqual && endDateNowDateDiff && startDateEndDateDiff) {
                $startTimeSelect.find('option[value="' + currentSelectValues[0] + '"]')
                    .prop('selected', 'selected')
                    .prevAll().prop('disabled', true);

                $endTimeSelect.find('option[value="' + firstStartHours + '"]')
                    .prop({
                        'disabled': false,
                        'selected': true
                    })
                    .siblings().prop('disabled', false);

            } else if (startDateNowDateEqual && endDateNowDateEqual) {
                $startTimeSelect.find('option[value="' + currentSelectValues[0] + '"]').prop('selected', 'selected')
                    .prevAll().prop('disabled', true);

                $endTimeSelect.find('option[value="' + currentSelectValues[1] + '"]').prop('selected', 'selected')
                    .prevAll().prop('disabled', true);

            }
        }

        function setValues(date) {
            startHourDefault = moment(date, dateFormat).hour();
            startMinutesDefault = moment(date, dateFormat).minutes();

            var startDate = moment(from.datepicker('getDate', '+1d'), dateFormat).date();
            var endDate = moment(to.datepicker('getDate', '+1d'), dateFormat).date();

            if (nowDate === startDate && nowDate === endDate) {
                var currentHours = setHoursDuration(startMinutesDefault, startHourDefault);

                $startTimeSelect.find('option[value="' + currentHours[0] + '"]').prop('selected', 'selected')
                    .prevAll().prop('disabled', true);

                $endTimeSelect.find('option[value="' + currentHours[1] + '"]').prop('selected', 'selected')
                    .prevAll().prop('disabled', true);
            } else {
                $startTimeSelect.find('option[value="' + startHour + '"]')
                    .prop({
                        'disabled': false,
                        'selected': true

                    })
                    .nextAll().prop('disabled', false);
            }
        }

        function setHoursDuration(startMinutesDefault, startHourDefault) {
            if (startMinutesDefault < 30) {
                startMinutesDefault = '30';
            } else {
                startMinutesDefault = '00';
                startHourDefault += 1;
            }

            var newDate = $('#field-outward').datepicker('getDate');
            newDate.setDate(newDate.getDate() + 1);
            var originalStartHour = startHourDefault;
            if (startHourDefault >= 24) {
                startHourDefault = startHourDefault % 24;
                $('#field-outward').datepicker('setDate', newDate);

            }

            if (originalStartHour + timeDifference >= 24) {
                // startHourDefault = '09';
                startMinutesDefault = '00';
                $('#field-return').datepicker('setDate', newDate);

                var returnHours = ((startHourDefault+timeDifference) % 24)+"";
                return [(startHourDefault+"").padStart(2, "0") + ':' + startMinutesDefault, (returnHours).padStart(2, "0") + ':' + startMinutesDefault];
            } else {
                return [(startHourDefault+"").padStart(2, "0") + ':' + startMinutesDefault, ((startHourDefault+timeDifference) + "").padStart(2, "0") + ':' + startMinutesDefault];
            }
        }

        setValues(dateToday);

        var maxNumberPeople = 8;
        var $selectAdult = $('#field-adult');
        var $selectChild = $('#field-child');

        $selectAdult.on('change', function () {
            var currentValue = $(this).val();

            var currentIndex = maxNumberPeople - currentValue - 1;
            var $currentOption = $selectChild.prop('disabled', false).find('option').eq(currentIndex + 1);

            if (currentIndex < 0) {
                $selectChild.prop('disabled', true);
            } else {
                $currentOption.prop('disabled', false);
                $currentOption.prevAll().prop('disabled', false);
                $currentOption.nextAll().prop('disabled', true);
            }
        });

        $selectChild.on('change', function () {
            var currentValue = $(this).val();

            var currentIndex = maxNumberPeople - currentValue - 1;
            var $currentOption = $selectAdult.prop('disabled', false).find('option').eq(currentIndex);

            if (currentIndex < 0) {
                $selectAdult.prop('disabled', true);
            } else if (currentIndex === 7) {
                $selectAdult.find('option').prop('disabled', false);
            } else {
                $currentOption.prop('disabled', false);
                $currentOption.prevAll().prop('disabled', false);
                $currentOption.nextAll().prop('disabled', true);
            }
        });

        //  Autocomplete
        $('.field-autocomplete').each(function () {
            var field = $(this);
            $(this).autocomplete({
                source: function (request, response) {
                    field.parent().find("svg").removeClass("hide");
                    $.ajax({
                        url: 'https://api.fastjp.com:9001/api/StationLookup?station=' + request.term,
                        dataType: 'json',
                        success: function (data) {
                            var stations = data.stations;
                            field.parent().find("svg").addClass("hide");
                            response($.map(stations, function (item) {
                                return {
                                    label: item.name,
                                    value: item.name,
                                    uic: item.uic
                                }
                            }));
                        }
                    });
                },
                select: function (event, ui) {
                    var uicNumber = ui.item.uic;

                    $(this).attr('data-uic', uicNumber);
                },
                minLength: 3
            });
        });

        $('.form-planner form').on('submit', function () {
            $('body').addClass('loading');
            $('.form-btn').find('svg').removeClass('hide');
        });

        $('.form-toggle-trigger').on('change', showReturnJourneyFormIfAppropriate);
        showReturnJourneyFormIfAppropriate(); // browser may cache ticked checkbox
    });
})(jQuery, window, document);
