angular
    .module("Module.exchange.controllers")
    .controller("ExchangeExternalContactsModifyCtrl", class ExchangeExternalContactsModifyCtrl {
        constructor ($scope, Exchange, ExchangeExternalContacts, navigation, messaging, $translate) {
            this.services = { $scope, Exchange, ExchangeExternalContacts, navigation, messaging, $translate };

            this.$routerParams = Exchange.getParams();

            this.model = {
                currentAccount: navigation.currentActionData,
                newAccount: angular.copy(navigation.currentActionData),
                hasDisplayNameBeenModified: false
            };

            $scope.accountIsValid = () => this.accountIsValid();
            $scope.modifyContact = () => this.modifyContact();
        }

        isEmailValid () {
            return _.has(this.model, "newAccount.externalEmailAddress") && this.services.Exchange.constructor.isEmailValid(this.model.newAccount.externalEmailAddress);
        }

        modifyContact () {
            this.services
                .ExchangeExternalContacts
                .modifyingContact(this.$routerParams.organization, this.$routerParams.productId, this.model.currentAccount.externalEmailAddress, this.model.newAccount)
                .then(() => {
                    this.services.messaging.writeSuccess(this.services.$translate.instant("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_modify_success"));
                })
                .catch((err) => {
                    this.services.messaging.writeError(this.services.$translate.instant("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_modify_fail"), err);
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
