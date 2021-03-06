angular
    .module("Module.exchange.controllers")
    .controller("ExchangeAddSharedAccountCtrl", class ExchangeAddSharedAccountCtrl {
        constructor ($scope, Exchange, ExchangeSharedAccounts, messaging, navigation, $translate, formValidation) {
            this.services = {
                $scope,
                Exchange,
                ExchangeSharedAccounts,
                messaging,
                navigation,
                $translate,
                formValidation
            };

            this.$routerParams = Exchange.getParams();

            this.errors = {
                emailIsAlreadyTaken: false,
                emailLocalPartIsEmpty: false,
                emailLocalPartDoesntRespectsPattern: false,
                quotaIsWrong: false
            };

            this.accountBeingCreated = {
                hiddenFromGAL: false,
                mailingFilter: ["vaderetro"]
            };

            this.localPartValidationRegex = /^[-\w]+((\.|\+)[-\w]+)*$/;

            $scope.loadingCreationOptions = () => this.loadingCreationOptions();
            $scope.addingAccount = () => this.addingAccount();
            $scope.isAccountValid = () => this.isAccountValid();
        }

        hasEmailAccountFieldErrors () {
            this.errors.emailLocalPartIsEmpty = this.services.formValidation.doesFieldContainsErrors(this.sharedAccountForm, "localPart", "required");
            this.errors.emailLocalPartDoesntRespectsPattern = this.services.formValidation.doesFieldContainsErrors(this.sharedAccountForm, "localPart", "pattern");

            return this.errors.emailLocalPartIsEmpty || this.errors.emailLocalPartDoesntRespectsPattern || this.errors.emailIsAlreadyTaken;
        }

        hasQuotaFieldErrors () {
            const quotaIsntANumber = this.services.formValidation.doesFieldContainsErrors(this.sharedAccountForm, "quota", "number");
            this.errors.quotaIsWrong = quotaIsntANumber ||
                this.services.formValidation.doesFieldContainsErrors(this.sharedAccountForm, "quota", "min") ||
                this.services.formValidation.doesFieldContainsErrors(this.sharedAccountForm, "quota", "max");

            return this.errors.quotaIsWrong;
        }

        buildDisplayName () {
            const firstName = this.accountBeingCreated.firstName || "";
            const separator = this.accountBeingCreated.firstName && this.accountBeingCreated.lastName ? " " : "";
            const lastName = this.accountBeingCreated.lastName || "";

            this.accountBeingCreated.displayName = `${firstName}${separator}${lastName}`;
        }

        emailOnChange () {
            this.accountBeingCreated.sharedEmailAddress = `${this.localPart}@${this.domain.name}`.toLowerCase();
            this.errors.emailIsAlreadyTaken = false;
            const matchingEmaiAddress = this.alreadyTakenEmails.find((alreadyTakenEmail) => this.accountBeingCreated.sharedEmailAddress.toUpperCase() === alreadyTakenEmail.toUpperCase());
            this.errors.emailIsAlreadyTaken = matchingEmaiAddress != null;
        }

        loadingCreationOptions () {
            return this.services
                .ExchangeSharedAccounts
                .retrievingNewSharedAccountOptions(this.$routerParams.organization, this.$routerParams.productId)
                .then((data) => {
                    this.optionsToCreateNewAccounts = data;
                    this.alreadyTakenEmails = data.takenEmails;

                    if (_.isEmpty(data.availableDomains)) {
                        this.services.messaging.writeError(this.services.$translate.instant("exchange_ACTION_add_no_domains"));
                        this.services.navigation.resetAction();
                    } else if (this.optionsToCreateNewAccounts.maxQuota.value < this.optionsToCreateNewAccounts.minQuota.value) {
                        this.services.messaging.writeError(this.services.$translate.instant("exchange_SHARED_ACCOUNTS_total_quota_error_message"));
                        this.services.navigation.resetAction();
                    } else {
                        this.domain = data.availableDomains[0];
                        this.accountBeingCreated.quota = this.optionsToCreateNewAccounts.minQuota.value;
                    }
                });
        }

        isDirty () {
            return _.has(this.sharedAccountForm, "localPart.$dirty") && this.sharedAccountForm.localPart.$dirty;
        }

        isAccountValid () {
            return this.isDirty() && !_(this.errors).values().includes(true);
        }

        addingAccount () {
            this.services.messaging.writeSuccess(this.services.$translate.instant("exchange_dashboard_action_doing"));

            return this.services
                .ExchangeSharedAccounts
                .addingSharedAccount(this.$routerParams.organization, this.$routerParams.productId, this.accountBeingCreated)
                .then((data) => {
                    this.services.messaging.writeSuccess(this.services.$translate.instant("exchange_SHARED_ACCOUNTS_add_success_message"), data);
                })
                .catch((failure) => {
                    this.services.messaging.writeError(this.services.$translate.instant("exchange_ACTION_add_account_error_message"), failure.data);
                })
                .finally(() => {
                    this.services.navigation.resetAction();
                });
        }
    });
