angular
    .module("Module.exchange.controllers")
    .controller("ExchangeToolboxSharedCtrl", class ExchangeToolboxSharedCtrl {
        constructor ($scope, Exchange, messaging, navigation, $translate, exchangeStates) {
            this.services = {
                $scope,
                Exchange,
                messaging,
                navigation,
                $translate,
                exchangeStates
            };
        }

        updateShared (shared) {
            if (this.services.exchangeStates.constructor.isOk(shared)) {
                this.services.navigation.setAction("exchange/shared/update/shared-update", angular.copy(shared));
            }
        }

        removeShared (shared) {
            if (this.services.exchangeStates.constructor.isOk(shared) && !shared.hasChildren) {
                this.services.navigation.setAction("exchange/shared/remove/shared-remove", angular.copy(shared));
            }
        }

        sharedPermissions (shared) {
            if (this.services.exchangeStates.constructor.isOk(shared)) {
                this.services.navigation.setAction("exchange/shared/permission/update/shared-permission-update", angular.copy(shared));
            }
        }
    });
