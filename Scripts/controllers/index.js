var index = (function () {

    var vm;

    function init() {
        createVm();

        vm.buttonSearchAppointments.attr("disabled", "disabled");

        bindEvents();

        loadDienstleistungen();

        function createVm() {
            vm = {
                dienstleistungenSelector: $("#selDienstleistung"),
                linkAppointment: $("#lnkGotoAppointmentSelector"),
                buttonSearchAppointments: $("#btnSearchAppointment"),
                dienstleistungen: {
                    key: "dienstleistungen",
                    get: function() {
                        var localDienstleistungen = localStorage.getItem(vm.dienstleistungen.key);
                        if (localDienstleistungen != null) {
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
                        if (localStandOrtenDienstleistung != null) {
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
                } else {
                    vm.buttonSearchAppointments.attr("disabled", "disabled");
                }
            });

            vm.buttonSearchAppointments.on("click", function () {
                searchFastestAppointment();
            });
        }
    }

    function loadDienstleistungen(notForceReload) {
        if (!notForceReload && vm.dienstleistungen.get() != null) {
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
        if (!notForceReload && vm.standOrtenDienstleistung.get() != null) {
            openAppointment();
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
                openAppointment();

            }).fail(function(err) {
                console.log(err);
                utils.showError(err);
            });
        }

        function openAppointment() {
            var link = utils.baseServiceUrl +
                "terminvereinbarung/termin/tag.php?termin=1&anliegen[]=" + vm.dienstleistung +
                "&dienstleisterlist=" + vm.standOrtenDienstleistung.get().join() +
                "&herkunft=FuckYouUglySite";

            vm.linkAppointment.attr("href", link);
            vm.linkAppointment.text("Go to select Appointment");

            window.open(link);
        }
    }

    return {
        init: init
    };
})();