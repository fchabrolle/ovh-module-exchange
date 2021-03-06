angular
    .module("Module.exchange.controllers")
    .controller("ExchangeTabGroupsCtrl", class ExchangeTabGroupsCtrl {
        constructor ($scope, Exchange, navigation, messaging, $translate, exchangeStates) {
            this.services = {
                $scope,
                Exchange,
                navigation,
                messaging,
                $translate,
                exchangeStates
            };

            this.$routerParams = Exchange.getParams();

            this.loading = false;
            this.mailingLists = null;
            this.search = {
                value: null
            };

            this.displayGroups();

            $scope.$on(Exchange.events.groupsChanged, () => $scope.$broadcast("paginationServerSide.reload", "groupsTable"));
            $scope.$on("showGroups", () => this.displayGroups());
            $scope.$on("showManagers", () => this.displayManagersByGroup());
            $scope.$on("showMembers", () => this.displayMembersByGroup());
            this.debouncedGetMailingLists = _.debounce(this.getMailingLists, 300);

            $scope.getLoading = () => this.getLoading();
            $scope.getMailingListObjects = () => this.getMailingListObjects();
            $scope.getMailingLists = (count, offset) => this.getMailingLists(count, offset);
        }

        onSearchValueChange () {
            this.debouncedGetMailingLists();
        }

        displayGroups () {
            this.search = null;
            this.showGroups = true;
            this.showManagers = false;
            this.showMembers = false;
            this.showAliases = false;
            this.services.navigation.selectedGroup = null;
        }

        displayManagersByGroup (ml) {
            this.search = null;
            this.showGroups = false;
            this.showManagers = true;
            this.showMembers = false;
            this.showAliases = false;
            this.services.navigation.selectedGroup = ml;
            this.services.$scope.$broadcast("paginationServerSide.loadPage", 1, "managersTable");
        }

        displayMembersByGroup (ml) {
            this.search = null;
            this.showGroups = false;
            this.showManagers = false;
            this.showMembers = true;
            this.showAliases = false;
            this.services.navigation.selectedGroup = ml;
            this.services.$scope.$broadcast("paginationServerSide.loadPage", 1, "membersTable");
        }

        displayAliasesByGroup (ml) {
            this.search = null;
            this.showGroups = false;
            this.showManagers = false;
            this.showMembers = false;
            this.showAliases = true;
            this.services.navigation.selectedGroup = ml;
            this.services.$scope.$broadcast("paginationServerSide.loadPage", 1, "groupAliasTable");
        }

        getLoading () {
            return this.loading;
        }

        resetSearch () {
            this.search.value = null;
            this.services.$scope.$broadcast("paginationServerSide.loadPage", 1, "groupsTable");
        }

        getMailingListObjects () {
            return this.mailingLists;
        }

        getMailingLists (count, offset) {
            this.services.messaging.resetMessages();
            this.loading = true;

            this.services
                .Exchange
                .getGroups(this.$routerParams.organization, this.$routerParams.productId, count, offset, this.search ? this.search.value : "")
                .then((data) => {
                    this.mailingLists = data;
                })
                .catch((failure) => {
                    this.services.messaging.writeError(this.services.$translate.instant("exchange_tab_GROUPS_all_error_message"), failure);
                })
                .finally(() => {
                    this.services.$scope.$broadcast("paginationServerSide.loadPage", 1, "groupsTable");
                    this.loading = false;
                });
        }

        newGroup () {
            this.services.navigation.setAction("exchange/group/add/group-add");
        }
    });
