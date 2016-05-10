var index = (function () {

    var vm;

    function init() {
        createVm();

        vm.buttonSearchAppointments.attr("disabled", "disabled");
        vm.buttonImFeelingLucky.attr("disabled", "disabled");

        bindEvents();

        loadDienstleistungen();

        function createVm() {
            vm = {
                dienstleistungenSelector: $("#selDienstleistung"),
                linkAppointment: $("#lnkGotoAppointmentSelector"),
                linkLucky: $("#lnkLucky"),
                buttonSearchAppointments: $("#btnSearchAppointment"),
                buttonImFeelingLucky: $("#btnImFeelingLucky"),
                dienstleistungen: {
                    key: "dienstleistungen",
                    get: function() {
                        var localDienstleistungen = localStorage.getItem(vm.dienstleistungen.key);
                        if (localDienstleistungen !== null) {
                            return JSON.parse(localDienstleistungen);
                        }
                        return null;
                    },
                    set: function(items) {
                        localStorage.setItem(vm.dienstleistungen.key, JSON.stringify(items));
                    }
                },
                standOrtenDienstleistung: {
                    key: "standOrtenDienstleistung-",
                    get: function () {
                        var localStandOrtenDienstleistung = localStorage.getItem(vm.standOrtenDienstleistung.key + vm.dienstleistung);
                        if (localStandOrtenDienstleistung !== null) {
                            return JSON.parse(localStandOrtenDienstleistung);
                        }
                        return null;
                    },
                    set: function (items) {
                        localStorage.setItem(vm.standOrtenDienstleistung.key + vm.dienstleistung, JSON.stringify(items));
                    }
                },
                dienstleistung: null
            };
        }

        function bindEvents() {
            vm.dienstleistungenSelector.on("change", function () {
                var newVal = $(this).val();
                if (newVal != "-1") {
                    vm.dienstleistung = newVal;
                    vm.buttonSearchAppointments.removeAttr("disabled");
                    vm.buttonImFeelingLucky.removeAttr("disabled");
                } else {
                    vm.buttonImFeelingLucky.attr("disabled", "disabled");
                    vm.buttonSearchAppointments.attr("disabled", "disabled");
                }
            });

            vm.buttonSearchAppointments.on("click", function () {
                searchFastestAppointment();
            });
            
            vm.buttonImFeelingLucky.on("click", function () {
                imFeelingLucky();
            });
        }
    }

    function loadDienstleistungen(notForceReload) {
        if (!notForceReload && vm.dienstleistungen.get() !== null) {
            reloadSelect();
        } else {
            $.get(utils.baseServiceUrlWithProxy + "dienstleistungen/", function(html) {
                var dienstleistungenPage = $(html);
                var dienstleistungLinks = $(".azlist div ul li a", dienstleistungenPage);
                var dienstleistungen = [];

                for (var i = 0; i < dienstleistungLinks.length; i++) {
                    var item = $(dienstleistungLinks[i]);
                    var itemIdRaw = item.attr("href");
                    if (itemIdRaw.lastIndexOf("/") != -1) {
                        itemIdRaw = itemIdRaw.substr(0, itemIdRaw.length - 1);
                    }
                    var itemId = itemIdRaw.substr(itemIdRaw.lastIndexOf("/") + 1, itemIdRaw.length - itemIdRaw.lastIndexOf("/"));

                    dienstleistungen.push({
                        id: itemId,
                        text: item.html().trim(),
                    });
                }
                vm.dienstleistungen.set(dienstleistungen);
                reloadSelect();

            }).fail(function (err) {
                console.log(err);
                utils.showError(err);
            });
        }

        function reloadSelect() {
            var list = vm.dienstleistungen.get();
            for (var i = 0; i < list.length; i++) {
                vm.dienstleistungenSelector.append("<option value='" + list[i].id + "'>" + list[i].text + "</option>");
            }
            vm.dienstleistungenSelector.selectize();
        }
    }

    function searchFastestAppointment(notForceReload) {
        
        getStandOrten(openAppointment);        

        function openAppointment() {
            var link = utils.baseServiceUrl + getAppointmentLinkAction();
            vm.linkAppointment.attr("href", link);
            vm.linkAppointment.text("Go to select Appointment");

            window.open(link);
        }
    }
    
    function imFeelingLucky(){
        getStandOrten(feelingLucky);
        
        function feelingLucky() {
            $.get(utils.phantomCloudedUrl(utils.baseServiceUrl + getAppointmentLinkAction()), function(html) {
                var terminPage = $(html);
                var terminLinks = $(".calendar-month-table a.tagesauswahl", terminPage);
                if(terminLinks.length > 0) {
                    var link = $(terminLinks[0]).attr("href");
                    link = utils.baseServiceUrl + "terminvereinbarung/termin/" + link;
                    $.get(utils.phantomCloudedUrl(link), function(html) {
                        var terminHourPage = $(html);
                        var terminHourLinks = $(".timetable td.frei a", terminHourPage);
                        if(terminHourLinks.length > 0) {
                            var luckyLink =  utils.baseServiceUrl + $(terminHourLinks[0]).attr("href");
                            vm.lnkLucky.attr("href", luckyLink);
                            vm.lnkLucky.text("Clikc here, you lucky bastard!");
                            window.open(luckyLink);
                        } else {                            
                            window.open(link);
                            utils.showError("it looks like theres not available hours on the appoitment, you should definetely try clicking the 'Open Appointments Page' button");
                        }
                    }).fail(function (err) {
                        console.log(err);
                        utils.showError("there was an error booking the appointment, fast! click the 'Open Appointments Page' button before someone else took your appointment!");
                    });
                } else {
                    utils.showError("it looks like theres not available appoitment, anyway you should try clicking the 'Open Appointments Page' button");
                }
            }).fail(function (err) {
                console.log(err);
                utils.showError("there was an error :/ you should try clicking the 'Open Appointments Page' button");
            });
        }
    }
    
    function getStandOrten(callback, notForceReload) {
        if (!notForceReload && vm.standOrtenDienstleistung.get() !== null) {
            callback();
        } else {
            $.get(utils.baseServiceUrlWithProxy + "dienstleistung/" + vm.dienstleistung, function(html) {

                var dienstleistungPage = $(html);
                var standortenLinks = $("a.referdienstleister", dienstleistungPage);
                var standorten = [];

                for (var i = 0; i < standortenLinks.length; i++) {
                    var item = $(standortenLinks[i]);
                    var itemIdRaw = item.attr("href");
                    if (itemIdRaw.lastIndexOf("/") != -1) {
                        itemIdRaw = itemIdRaw.substr(0, itemIdRaw.length - 1);
                    }
                    var itemId = itemIdRaw.substr(itemIdRaw.lastIndexOf("/") + 1, itemIdRaw.length - itemIdRaw.lastIndexOf("/"));

                    standorten.push(itemId);
                }
                vm.standOrtenDienstleistung.set(standorten);                
                callback();

            }).fail(function(err) {
                console.log(err);
                utils.showError(err);
            });
        }
    }
    
    function getAppointmentLinkAction() {
        return "terminvereinbarung/termin/tag.php?termin=1&anliegen[]=" + vm.dienstleistung +
               "&dienstleisterlist=" + vm.standOrtenDienstleistung.get().join() +
               "&herkunft=FuckYouUglySite";
    }
    
    return {
        init: init
    };
})();