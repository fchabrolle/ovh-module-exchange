angular
    .module("Module.exchange.controllers")
    .controller("ExchangeAddExternalContactCtrl", class ExchangeAddExternalContactCtrl {
        constructor ($scope, Exchange, ExchangeExternalContacts, navigation, $translate, messaging, exchangeVersion, exchangeServiceInfrastructure) {
            this.services = { $scope, Exchange, ExchangeExternalContacts, navigation, $translate, messaging, exchangeVersion, exchangeServiceInfrastructure };

            this.$routerParams = Exchange.getParams();
            this.model = {
                newAccount: {
                    hiddenFromGAL: false
                },
                hasDisplayNameBeenModified: false
            };

            this.loaders = {
                step1: false
            };

            this.exchange = Exchange.value;

            $scope.addContact = () => this.addContact();
            $scope.getData = () => this.getData();
            $scope.accountIsValid = () => this.accountIsValid();

            this.getData();
        }

        getData () {
            this.loaders.step1 = true;

            if (this.services.exchangeVersion.isVersion(2010) && this.services.exchangeServiceInfrastructure.isProvider()) {
                this.services
                    .ExchangeExternalContacts
                    .gettingContactOptions(this.$routerParams.organization, this.$routerParams.productId)
                    .then((data) => {
                        this.loaders.step1 = false;
                        this.availableMainDomains = data;
                        this.model.attachOrganization2010 = _.get(this.availableMainDomains, "[0]", null);
                    })
                    .catch((failure) => {
                        this.services.navigation.resetAction();
                        this.services.messaging.writeError(this.services.$translate.instant("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_add_fail"), failure);
                    });
            }
        }

        isEmailValid () {
            return _.has(this.model, "newAccount.externalEmailAddress") && this.services.Exchange.constructor.isEmailValid(this.model.newAccount.externalEmailAddress);
        }

        addContact () {
            if (this.model.attachOrganization2010 != null) {
                this.model.newAccount.organization2010 = this.model.attachOrganization2010.name;
            }

            this.services
                .ExchangeExternalContacts
                .addingContact(this.$routerParams.organization, this.$routerParams.productId, this.model.newAccount)
                .then(() => {
                    this.services.messaging.writeSuccess(this.services.$translate.instant("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_add_success"));
                })
                .catch((failure) => {
                    this.services.messaging.writeError(this.services.$translate.instant("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_add_fail"), failure);
                })
                .finally(() => {
                    this.services.navigation.resetAction();
                });
        }

        updateDisplayName () {
            if (this.model.newAccount != null && !this.model.hasDisplayNameBeenModified) {
                const firstName = _.get(this.model.newAccount, "firstName", "");
                const lastName = _.get(this.model.newAccount, "lastName", "");
                const separator = !_.isEmpty(firstName) && !_.isEmpty(lastName) ? " " : "";

                this.model.newAccount.displayName = `${firstName}${separator}${lastName}`;
            }
        }

        updateDisplayNameFlag () {
            this.model.hasDisplayNameBeenModified = !_.isEmpty(this.model.newAccount.displayName);
        }

        accountIsValid () {
            return this.services.ExchangeExternalContacts.isAccountValid(this.model.newAccount);
        }
    });
