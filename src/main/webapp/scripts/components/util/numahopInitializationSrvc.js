(function () {
	'use strict';

	angular.module('numaHopApp.service')
		.factory('NumaHopInitializationSrvc', function ($q, AuthenticationSharedService, CheckConfigurationSrvc, DocPropertyTypeSrvc, DocUnitSrvc, 
			FTPConfigurationSrvc, IAConfigurationSrvc, LibraryParameterSrvc, LibrarySrvc, LotSrvc, OmekaConfigurationSrvc, ProjectSrvc, SFTPConfigurationSrvc, 
			TrainSrvc, USER_ROLES, UserAuthorizationSrvc, UserRoleSrvc, UserSrvc, ViewsFormatSrvc, WorkflowGroupSrvc, WorkflowModelSrvc, OcrLanguageSrvc) {

			var loadRoles = function () {
				return UserRoleSrvc.query({ dto: "true" }).$promise
					.then(function (roles) {
						return _.sortBy(roles, function (rol) {
							return rol.label.toLowerCase();
						});
					});
			};

			var loadProviders = function () {
				return UserSrvc.providers({}).$promise;
			};

			var loadUsers = function () {
				return UserSrvc.query({ dto: "true" }).$promise;
			};

			var loadPACS = function (library) {
				return SFTPConfigurationSrvc.pacs({ library: library }).$promise
					.then(function (pacs) {
						return _.sortBy(pacs, function (pa) {
							return pa.name ? pa.name.toLowerCase() : pa;
						});
					});
			};

			var loadCinesParamsDefaultValues = function (id) {
				return LibraryParameterSrvc.cinesDefaultValues({ sftpConfig: id }).$promise
					.then(function (defaultValues) {
						return defaultValues;
					});
			};

			var loadCollections = function (library) {
				return IAConfigurationSrvc.collections({ library: library }).$promise
					.then(function (ias) {
						return _.sortBy(ias, function (ia) {
							return ia.name ? ia.name.toLowerCase() : ia;
						});
					});
			};
			
	        var loadOmekaCollections = function (library) {
                return OmekaConfigurationSrvc.omekacollections({ library: library }).$promise
                    .then(function (colls) {
                        return _.sortBy(colls, function (col) {
                            return col.name ? col.name.toLowerCase() : col;
                        });
                    });
            };
            
            var loadOmekaItems = function (library) {
                return OmekaConfigurationSrvc.omekaitems({ library: library }).$promise
                    .then(function (items) {
                        return _.sortBy(items, function (it) {
                            return it.name ? it.name.toLowerCase() : it;
                        });
                    });
            };

			var loadWorkflowModels = function (library) {
				return WorkflowModelSrvc.models({ library: library }).$promise;
			};

			var loadWorkflowGroups = function (library) {
				return WorkflowGroupSrvc.groups({ library: library }).$promise;
			};

			var loadProvidersForLibrary = function (library) {
				if (library) {
					return LibrarySrvc.providers({ id: library }).$promise;
				}
				return $q.when();
			};

			var loadUsersForLibrary = function (library) {
				if (library) {
					return LibrarySrvc.users({ id: library }).$promise
						.then(function (users) {
							return _.sortBy(users, function (user) {
								return user.surname.toLowerCase();
							});
						});
				}
				return $q.when();
			};

			var loadLibraries = function () {
				return LibrarySrvc.query({ dto: "true" }).$promise;
			};

			var loadLots = function (libraries, projects, screenTarget) {
				if (projects && projects.length) {
					return LotSrvc.query({ dto: "true", projects: projects }).$promise
						.then(function (lots) {
							return _.sortBy(lots, function (lot) {
								return lot.label.toLowerCase();
							});
						});
				} else if (libraries && libraries.length) {
					return LotSrvc.query({ dto: "true", libraries: libraries }).$promise
						.then(function (lots) {
							return _.sortBy(lots, function (lot) {
								return lot.label.toLowerCase();
							});
						});
				} else {
					return LotSrvc.query({ dto: "true", target: screenTarget }).$promise
						.then(function (lots) {
							return _.sortBy(lots, function (lot) {
								return lot.label.toLowerCase();
							});
						});
				}
			};

			var loadProjects = function (libraries) {
				return ProjectSrvc.dto({ libraries: libraries }).$promise
					.then(function (projects) {
						return _.sortBy(projects, function (pj) {
							return pj.name.toLowerCase();
						});
					});
			};

			var loadTrains = function (libraries, projects) {
				if (projects && projects.length) {
					return TrainSrvc.query({ dto: "true", projects: projects }).$promise;
				} else if (libraries && libraries.length) {
					return TrainSrvc.query({ dto: "true", libraries: libraries }).$promise;
				} else {
					return TrainSrvc.query({ dto: "true" }).$promise;
				}
			};

			var loadCreatedProjects = function () {
				return ProjectSrvc.query({ loadCreatedProjects: "true" }).$promise;
			};

			var loadDocUnits = function () {
				return DocUnitSrvc.query({ dto: "true" }).$promise;
			};

			var loadPropertyTypes = function () {
				return DocPropertyTypeSrvc.query({ dto: "true" }).$promise;
			};

			var loadAuthorizations = function () {
				return UserAuthorizationSrvc.dto().$promise;
			};

			var loadFTPConfigurationForProject = function (project) {
				if (project && AuthenticationSharedService.isAuthorized(USER_ROLES.FTP_HAB0)) {
					return FTPConfigurationSrvc.query({ project: project }).$promise;
				}
				return $q.when();
			};

			var loadCheckConfigurationForProject = function (project) {
				if (project && AuthenticationSharedService.isAuthorized(USER_ROLES.CHECK_HAB0)) {
					return CheckConfigurationSrvc.query({ project: project }).$promise;
				}
				return $q.when();
			};

			var loadFormatConfigurationForProject = function (project) {
				if (project && AuthenticationSharedService.isAuthorized(USER_ROLES.IMG_FORMAT_HAB0)) {
					return ViewsFormatSrvc.query({ project: project }).$promise;
				}
				return $q.when();
			};
			
			var loadOcrLanguagesForLibrary = function (library) {
                return OcrLanguageSrvc.langs({ library: library }).$promise
                    .then(function (langs) {
                        return _.sortBy(langs, function (la) {
                            return la.label ? la.label.toLowerCase() : la;
                        });
                    });
            };

			return {
				// promises
				loadCollections: loadCollections,
				loadOmekaCollections: loadOmekaCollections,
			    loadOmekaItems: loadOmekaItems, 
				loadWorkflowModels: loadWorkflowModels,
				loadWorkflowGroups: loadWorkflowGroups,
				loadPACS: loadPACS,
				loadRoles: loadRoles,
				loadLibraries: loadLibraries,
				loadProjects: loadProjects,
				loadCreatedProjects: loadCreatedProjects,
				loadDocPropertyTypes: loadPropertyTypes,
				loadLots: loadLots,
				loadDocUnits: loadDocUnits,
				loadTrains: loadTrains,
				loadUsers: loadUsers,
				loadProviders: loadProviders,
				loadAuthorizations: loadAuthorizations,
				loadProvidersForLibrary: loadProvidersForLibrary,
				loadUsersForLibrary: loadUsersForLibrary,
				loadFTPConfigurationForProject: loadFTPConfigurationForProject,
				loadCheckConfigurationForProject: loadCheckConfigurationForProject,
				loadFormatConfigurationForProject: loadFormatConfigurationForProject,
				loadCinesParamsDefaultValues: loadCinesParamsDefaultValues,
				loadOcrLanguagesForLibrary: loadOcrLanguagesForLibrary 
			};
		});
})();