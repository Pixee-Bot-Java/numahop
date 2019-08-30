(function () {
    'use strict';

    angular.module('numaHopApp.controller')
        .controller('CSVMappingCtrl', CSVMappingCtrl);

    function CSVMappingCtrl($q, gettext, gettextCatalog, HistorySrvc, LibrarySrvc, CSVMappingSrvc, MessageSrvc, ModalSrvc, Principal, USER_ROLES) {
        var mainCtrl = this;
        mainCtrl.mappingModified = mappingModified;
        /** Mapping */
        mainCtrl.create = create;
        mainCtrl.delete = del;
        mainCtrl.edit = edit;
        mainCtrl.getDocfieldLabel = getDocfieldLabel;
        mainCtrl.reload = reload;
        mainCtrl.save = save;
        mainCtrl.duplicate = duplicate;
        /** Règles */
        mainCtrl.addRule = addRule;
        mainCtrl.copyRule = copyRule;
        mainCtrl.delRule = delRule;
        mainCtrl.editRule = editRule;
        mainCtrl.sortRule = sortRule;

        /* Listes ui-select */
        mainCtrl.uioptions = {
            libraries: {
                text: "name",
                placeholder: gettextCatalog.getString("Bibliothèque"),
                trackby: "identifier",
                // Chargement avec mise en cache du résultat
                refresh: function () {
                    if (!mainCtrl.uioptions.libraries.data) {
                        mainCtrl.uioptions.libraries.data = LibrarySrvc.query({ dto: true });
                        return mainCtrl.uioptions.libraries.data.$promise;
                    }
                    else {
                        return $q.when(mainCtrl.uioptions.libraries.data);
                    }
                },
                'refresh-delay': 0, // pas de refresh-delay, car on lit les données en cache après le 1er chargement
                'allow-clear': true
            }
        };


        init();

        /** Initialisation du contrôleur */
        function init() {
            HistorySrvc.add(gettextCatalog.getString("Configuration des mappings"));

            mainCtrl.isSuperAdmin = Principal.isInRole(USER_ROLES.SUPER_ADMIN);
            mainCtrl.rwCheckLib = Principal.isInRole(USER_ROLES.ADMINISTRATION_LIB);    // mapping des autres bib en lecture seule
            mainCtrl.library = Principal.library();

            loadMappings();
        }
        /** Chargement des mappings existants */
        function loadMappings() {
            mainCtrl.mappings = CSVMappingSrvc.query();
            mainCtrl.mappings.$promise
                .then(updateMappingLibraries);
        }
        function updateMappingLibraries(mappings) {
            mainCtrl.libraries = _.chain(mappings)
                .pluck("library")
                .uniq(false, function (l) {
                    return l.identifier;
                })
                .value();
        }
        /** Le mapping a été modifié */
        function mappingModified() {
            mainCtrl.modified = true;
        }
        /** Création d'un mapping */
        function create() {
            mainCtrl.editedMapping = new CSVMappingSrvc();
            mainCtrl.editedMapping.rules = [];
            if (mainCtrl.library) {
                mainCtrl.editedMapping.library = _.find(mainCtrl.uioptions.libraries.data, function (lib) { return lib.identifier = mainCtrl.library; });
            }

            mainCtrl.rw = Principal.isInRole(USER_ROLES.MAP_HAB1);
            mainCtrl.modified = true;
            mainCtrl.loaded = true;
        }
        /** Édition d'un mapping */
        function edit(mapping) {
            mainCtrl.loaded = false;

            mainCtrl.editedMapping = CSVMappingSrvc.get({ id: mapping.identifier });
            mainCtrl.editedMapping.$promise
                .then(function () {
                    mainCtrl.rw = mainCtrl.isSuperAdmin || (Principal.isInRole(USER_ROLES.MAP_HAB1) && (!mainCtrl.rwCheckLib || mapping.library.identifier === mainCtrl.library));
                    mainCtrl.modified = false;
                    mainCtrl.loaded = true;
                });
        }
        /** Rechargement d'un mapping */
        function reload(mapping) {
            if (angular.isDefined(mapping.identifier)) {
                edit(mapping);
            }
            else {
                create();
            }
        }
        /** Suppression d'un mapping */
        function del(mapping) {
            if (!mapping) {
                return;
            }
            ModalSrvc.confirmDeletion(gettextCatalog.getString("Le mapping {{label}}", mapping))
                .then(function () {
                    return mapping.$delete();
                })
                .then(function () {
                    MessageSrvc.addSuccess(gettext("Le mapping {{label}} a été supprimé"), mapping);
                    loadMappings();

                    mainCtrl.modified = false;
                    mainCtrl.loaded = false;
                });
        }
        /** Duplication d'un mapping */
        function duplicate(mapping) {
            if (!mapping) {
                return;
            }
            var params = { id: mapping.identifier };
            if (mainCtrl.library) {
                params.library = mainCtrl.library;
            }
            CSVMappingSrvc.duplicate(params, function (newMapping) {
                loadMappings();
                edit(newMapping);
            });
        }
        /** Sauvegarde d'un mapping */
        function save(mapping) {
            if (!mapping) {
                return;
            }
            var isCreation = !mapping.identifier;

            mapping.$save()
                .then(function () {
                    MessageSrvc.addSuccess(gettext("Le mapping {{label}} a été sauvegardé"), mapping);
                    mainCtrl.modified = false;

                    // Mise à jour de la liste des DTOs
                    if (isCreation) {
                        var editedDtoC = _.pick(mapping, "identifier", "label", "library");
                        mainCtrl.mappings.push(editedDtoC);
                    }
                    else {
                        var editedDtoU = _.find(mainCtrl.mappings, function (m) {
                            return m.identifier === mapping.identifier;
                        });
                        if (angular.isDefined(editedDtoU)) {
                            editedDtoU.label = mapping.label;
                            editedDtoU.library = mapping.library;
                        }
                    }
                    updateMappingLibraries(mainCtrl.mappings);
                });
        }

        /** Ajout d'une nouvelle règle */
        function addRule(mapping) {
            return copyRule(false, mapping);
        }
        /** Copie d'une règle existante */
        function copyRule(rule, mapping) {
            var copyOfRule = rule
                ? _.pick(rule, "csvField", "docUnitField")
                : {};
            var options = { rule: copyOfRule };
            return ModalSrvc.open("scripts/app/configuration/csvMapping/csvModalEditRule.html", options, "lg", "CSVModalEditRuleCtrl")
                .then(function (edRule) {
                    mapping.rules.push(edRule);
                    mainCtrl.modified = true;
                    return edRule;
                });
        }
        /** Suppression d'une règle existante */
        function delRule(rule, mapping) {
            mainCtrl.modified = true;

            var idx = mapping.rules.indexOf(rule);
            if (idx >= 0) {
                mapping.rules.splice(idx, 1);
            }
        }
        /** Suppression d'une règle existante */
        function editRule(rule, mapping) {
            var options = { rule: angular.copy(rule) };
            return ModalSrvc.open("scripts/app/configuration/csvMapping/csvModalEditRule.html", options, "lg", "CSVModalEditRuleCtrl")
                .then(function (edRule) {
                    mainCtrl.modified = true;

                    var idx = mapping.rules.indexOf(rule);
                    if (idx >= 0) {
                        mapping.rules.splice(idx, 1, edRule);   // remplacement de la règle originale par la règle éditée
                    }
                    return rule;
                });
        }
        /** Tri des règles */
        function sortRule(rule) {
            if (rule.docUnitField) {
                return rule.docUnitField;
            }
        }
        /**
         * Libellé d'un champ d'une unité documentaire
         * 
         * @param {any} field 
         */
        function getDocfieldLabel(field) {
            if (!field) {
                return;
            }
            var found = _.find(CSVMappingSrvc.docUnitFields, function (f) {
                return f.code === field;
            });
            return found ? found.label : "";
        }
    }
})();