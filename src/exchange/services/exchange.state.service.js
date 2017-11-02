angular
    .module("Module.exchange.services")
    .service("exchangeStates", class ExchangeStates {
        constructor () {
            this.states = ["CREATING", "DELETING", "REOPENING", "SUSPENDED", "SUSPENDING", "OK", "TASK_ON_DOING", "TASK_ON_ERROR", "INTERNAL_MIGRATION"];
        }

        isValidState (value) {
            return _.some(this.states, (state) => state.toUpperCase() === value);
        }

        static isState (account, state) {
            if (_.isString(account)) {
                return account.toUpperCase() === state.toUpperCase();
            }

            if (_.isString(account.state)) {
                return account.state.toUpperCase() === state.toUpperCase();
            }

            return false;
        }

        static isOk (account) {
            return ExchangeStates.isState(account, "OK");
        }

        static isCreating (account) {
            return ExchangeStates.isState(account, "CREATING");
        }

        static isDeleting (account) {
            return ExchangeStates.isState(account, "DELETING");
        }

        static isSuspended (account) {
            return ExchangeStates.isState(account, "SUSPENDED");
        }

        static isReopening (account) {
            return ExchangeStates.isState(account, "REOPENING");
        }

        static isSuspending (account) {
            return ExchangeStates.isState(account, "SUSPENDING");
        }

        static isMigrating (account) {
            return ExchangeStates.isState(account, "INTERNAL_MIGRATION");
        }

        static isDoing (account) {
            return ExchangeStates.isState(account, "TASK_ON_DOING") || ExchangeStates.isState(account, "DOING");
        }

        static isInError (account) {
            return ExchangeStates.isState(account, "TASK_ON_ERROR") || ExchangeStates.isState(account, "ERROR");
        }
    });
