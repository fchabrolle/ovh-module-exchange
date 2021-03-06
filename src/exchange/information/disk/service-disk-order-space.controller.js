angular
    .module("Module.exchange.controllers")
    .controller("ExchangeOrderDiskSpaceCtrl", class ExchangeOrderDiskSpaceCtrl {
        constructor ($rootScope, $scope, Exchange, messaging, navigation, $translate, $window) {
            this.services = {
                $rootScope,
                $scope,
                Exchange,
                messaging,
                navigation,
                $translate,
                $window
            };
        }

        $onInit () {
            this.$routerParams = this.services.Exchange.getParams();
            this.loading = false;
            this.agree = {
                value: false
            };

            this.services.$scope.submitting = () => this.submitting();
            this.services.$scope.loadContracts = () => this.loadContracts();
            this.services.$scope.getAgreementValue = () => this.agree.value;
            this.services.$scope.backToContracts = () => this.backToContracts();

            this.retrievingDiskSpaceOptions();
        }

        retrievingDiskSpaceOptions () {
            this.loading = true;

            return this.services
                .Exchange
                .getDiskSpaceOptions(this.$routerParams.organization, this.$routerParams.productId)
                .then((order) => {
                    this.order = order;
                    this.loading = false;
                })
                .catch((failure) => {
                    this.services.navigation.resetAction();
                    this.services.messaging.writeError(this.services.$translate.instant("exchange_ACTION_renew_ssl_dcv_failure"), failure);
                });
        }

        loadContracts () {
            this.agree.value = false;

            if (_.isEmpty(this.order.contracts)) {
                this.services.$rootScope.$broadcast("wizard-goToStep", 3);
            }
        }

        backToContracts () {
            if (_.isEmpty(this.order.contracts)) {
                this.services.$rootScope.$broadcast("wizard-goToStep", 1);
            }
        }

        getResumePrice (price) {
            return price.value === 0 ? this.services.$translate.instant("price_free") : this.services.$translate.instant("price_ht_label", { t0: price.text });
        }

        submitting () {
            return this.services
                .Exchange
                .orderDiskSpace(this.$routerParams.organization, this.$routerParams.productId)
                .then((order) => {
                    this.services.messaging.writeSuccess(this.services.$translate.instant("exchange_action_order_space_disk_success", {
                        t0: order.url,
                        t1: order.orderId
                    }));
                    this.services.$window.open(order.url, "_blank");
                })
                .catch((failure) => {
                    this.services.messaging.writeError(this.services.$translate.instant("exchange_action_order_space_disk_failure", {
                        t0: failure
                    }));
                })
                .finally(() => {
                    this.services.navigation.resetAction();
                });
        }
    });
