var app = angular.module('CrudApp', ['ngCookies']);

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

app.controller('LoginController', function($scope, $http, $cookies, $rootScope){
	var alertDanger = function(string) {
		$.bootstrapGrowl(string, {
			type: 'danger',
			align: 'center',
			width: 300,
		});
	}

	// chama API para consulta no banco de dados e atualiza tabela na camada view	
	$scope.entrar = function(){
		$http.post('http://localhost:3000/logar', $scope.usuario)
			.then(function (response){
				// response.data contém resultado do select				
				// Quando não é retornado nada, o valor de data é nulo
				if (response.data != null && response.data.length != 0) { 
					preencheUsuario(angular.copy(response.data));
					if ($cookies.getObject('user')){
						window.location.href = 'http://localhost:3000/inicio';
					}
					$scope.entrar();
				} else {
					alertDanger("E-mail ou senha incorreto!");
				}
			});
	};
	var preencheUsuario = function(usuario){
		if (usuario.tp_usuario == 0) {
			$http.post('http://localhost:3000/getAluno', usuario)
				.then(function (response){
					$cookies.putObject('user', angular.copy(response.data), {'domain': 'localhost'});
				});
		} else {
			$http.post('http://localhost:3000/getEmpresa', usuario)
				.then(function (response){
					// response.data contém resultado do select	
					$cookies.putObject('user', angular.copy(response.data), {'domain': 'localhost'});
				});
		}
	};
});

app.controller('nomeUsuario', function($scope, $cookies, $rootScope){
	$scope.setNomeUsuario = function() {
		var usuario = $cookies.getObject('user');
		$rootScope.usuario = angular.copy(usuario);
	}
});

app.controller('controlLogout', function($scope, $cookies, $rootScope){
	$scope.logout = function(){
		$cookies.remove('user');
		$rootScope.usuario = undefined;
		window.location.href = "/logout";
	}
});

app.controller('CrudController', function($scope, $http, $cookies, $rootScope){
	var format = function(date, format) {
	    var z = {
	        M: x.getMonth() + 1,
	        d: x.getDate(),
	        h: x.getHours(),
	        m: x.getMinutes(),
	        s: x.getSeconds()
	    };
	    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
	        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
	    });

	    return y.replace(/(y+)/g, function(v) {
	        return x.getFullYear().toString().slice(-v.length)
	    });
	}

	var alertSucess = function(string) {
		$.bootstrapGrowl(string, {
			type: 'success',
			align: 'center',
			width: 300,
		});
	}
	var alertDanger = function(string) {
		$.bootstrapGrowl(string, {
			type: 'danger',
			align: 'center',
			width: 300,
		});
	}
	var alertWarning = function(string) {
		$.bootstrapGrowl(string, {
			type: 'warning',
			align: 'center',
			width: 300,
		});
	}

	// chama API para consulta no banco de dados e atualiza tabela na camada view	
	var atualizaTabelaProjeto = function(){
		var id_criador = $rootScope.usuario.id_usuario;
		var tp_usuario = $rootScope.usuario.tp_usuario;
		$http.get('http://localhost:3000/consultaProjeto/' + id_criador + '/' + tp_usuario)
			.then(function (response){
				// response.data contém resultado do select
				$scope.listaProjetos = response.data;						
			});
	};

	// chama API para consulta no banco de dados e atualiza tabela na camada view	
	var atualizaTabelaArea = function(){
		$http.get('http://localhost:3000/consultaArea')
		.then(function (response){
				// response.data contém resultado do select
				$scope.listaAreas = response.data;
		});
	};

	// apenas chama função atualizaTabela
	$scope.consultaProjeto = function(){
			atualizaTabelaProjeto();
			$scope.time = new Date().toString().substring(16, 25);
	};

	// apenas chama função atualizaTabela
	$scope.consultaArea = function(){
			atualizaTabelaArea();
			$scope.time = new Date().toString().substring(16, 25);
	};

	// chama API - insere ou atualiza no banco de dados e atualiza tabela
	$scope.salvaProjeto = function(){
		if ($rootScope.usuario.tp_usuario == 0 && $scope.projeto.id_projeto > 0){
			$http.get('http://localhost:3000/existeProjeto' + '/' + angular.copy($scope.projeto.id_projeto) + '/' + angular.copy($rootScope.usuario.id_usuario))
				.then(function (response) {
					if (response.data > 0) {
						alertWarning("Projeto já adicionado.");
					} else {
						$http.post('http://localhost:3000/addProjeto', {
									'id_usuario' : angular.copy($rootScope.usuario.id_usuario),
									'id_projeto' : angular.copy($scope.projeto.id_projeto)
									})
							.then(function (response){
								alertSucess("Adicionado com sucesso");
						});
					}	
			});
		} else {
			if ($scope.projeto.id_projeto > 0){
				if($scope.projeto.id_criador == $rootScope.usuario.id_usuario){
					$http.put('http://localhost:3000/atualizaProjeto', $scope.projeto)
					.then(function (response){
							alertSucess("Atualização com sucesso");
							$scope.titulo = "Detalhes do Projeto";
					});
				}else{
					alertDanger("Você não pode alterar este projeto.");
				}
			}
			else {
				$http.post('http://localhost:3000/insereProjeto', $scope.projeto)
				.then(function (response){
						alertSucess("Inserção com sucesso");
				});
				$http.get('http://localhost:3000/lastIdProjeto')
				.then(function (response){
						$scope.projeto.id_projeto = response.data;
						$scope.ng_excluir = false;
				});
			}
		}
	}

	$scope.consultaMeuProjeto = function(){
		$http.get('http://localhost:3000/consultaMeuProjeto/' + $rootScope.usuario.tp_usuario + '/' + $rootScope.usuario.id_usuario)
			.then(function (response){
					// response.data contém resultado do select
					$scope.listaMeusProjetos = response.data;
			});
	}

	// chama API - insere ou atualiza no banco de dados e atualiza tabela
	$scope.salvaArea = function(){
		if ($scope.area.id_area > 0) {
			//Editar
			$http.put('http://localhost:3000/atualizaArea', $scope.area)
			.then(function (response){
					alertSucess("Atualização com sucesso");
					$scope.titulo = "Detalhes da Área";
			});
		} else {
			//Insere
			$http.post('http://localhost:3000/insereArea', $scope.area)
			.then(function (response){
					alertSucess("Inserção com sucesso");
			});
			$http.get('http://localhost:3000/lastIdArea')
			.then(function (response){
					$scope.area.id_area = response.data;
					$scope.ng_excluir = false;
			});
		}
	}

	$scope.removeProjeto = function(){
		if($scope.projeto.id_criador == $rootScope.usuario.id_usuario){
			var excluir = confirm("O registro " + $scope.projeto.titulo + " será excluido.");
			$http.delete('http://localhost:3000/removeProjeto/' + $scope.projeto.id_projeto)
			.then(function (response){
					window.location.href = "/projeto-consulta";
			});
		}else{
			alertDanger("Você não pode excluir este projeto.");
		}
	}

	$scope.removeArea = function(){
		var excluir = confirm("O registro " + $scope.area.ds_area + " será excluido.");
		if (excluir) {
			$http.delete('http://localhost:3000/removeArea/' + $scope.area.id_area)
			.then(function (response){
					window.location.href = "/area-consulta";
			});
		}
		alertDanger("Área utilizada em um projeto.");
	}

	// coloca o projeto para edição
	$scope.editarProjeto = function(index){
		$cookies.putObject('objProjeto',angular.copy( $scope.listaProjetos[index]), {'domain': 'localhost'});
		window.location.href = "/projeto-cadastro";
	}

	$scope.editarMeusProjetos = function(id){
		$http.get('http://localhost:3000/getProjeto/' + id)
			.then(function (response){
					$cookies.putObject('objProjeto', response.data, {'domain': 'localhost'});
					window.location.href = "/projeto-cadastro";
			});
	}

	// guarda posicao no cookie
	$scope.editarArea = function(index){
		$cookies.putObject('objArea', angular.copy($scope.listaAreas[index]), {'domain': 'localhost'});
		window.location.href = "/area-cadastro";
	}

	$scope.preencheCamposProjeto = function(){
		var objProjeto;
		if ( angular.isDefined($cookies.getObject('objProjeto')) ){
			objProjeto = $cookies.getObject('objProjeto');
			$cookies.remove('objProjeto');
		} else {
			objProjeto = undefined;
		}
		
		setProjeto(objProjeto);

		$scope.ng_editavel = $rootScope.usuario.tp_usuario == 0 || ($scope.projeto.id_projeto != 'Automático' && $rootScope.usuario.id_usuario != $scope.projeto.id_criador)
	}

	// coloca o projeto para edição
	$scope.preencheCamposArea = function(){	
		var objArea;
		if ( angular.isDefined($cookies.getObject('objArea')) ){
			objArea = $cookies.getObject('objArea');
			$cookies.remove('objArea');
		} else {
			objArea = undefined;
		}

		setArea(objArea);
	}
	
	$scope.novoProjeto = function() {
		novoProjeto();
	}

	$scope.novaArea = function() {
		novaArea();
	}

	var setProjeto = function(projeto) {		
		if (angular.isUndefined(projeto)) {
			$scope.titulo = "Novo Projeto";			
			$scope.ng_excluir = true;
			$scope.projeto = {
				"id_projeto": "Automático",
				"id_criador": $rootScope.usuario.id_usuario,
				"titulo": "",
				"ds_projeto": "",
				"privacidade": false,
				"s_privacidade": "Público",
				"prazo" : undefined,
				"cursos": "",
				"tema": "",
				"id_area": 0,
				"ds_area": ""
			};
		} else {
			$scope.titulo = "Detalhes do Projeto";
			$scope.ng_excluir = false;
			$scope.projeto = {
				"id_projeto":projeto.id_projeto,
				"id_criador":projeto.id_criador,
				"titulo":projeto.titulo,
				"ds_projeto":projeto.ds_projeto,
				"privacidade": projeto.privacidade,
				"s_privacidade":projeto.s_privacidade,
				"prazo" : (projeto.prazo != null && angular.isDefined(projeto.prazo) ? new Date(projeto.prazo) : undefined),
				"cursos":projeto.cursos,
				"tema":projeto.tema,
				"id_area":projeto.id_area,
				"ds_area":projeto.ds_area
			};
		}
	}

	var setArea = function(area) {
		if (angular.isUndefined(area)) {
			$scope.titulo = "Nova Área";
			$scope.ng_excluir = true;
			$scope.area = {
				"id_area": "Automático",
				"ds_area":"",
				"cursos":""
			};
		} else {
			$scope.titulo = "Detalhes da Área";
			$scope.ng_excluir = false;
			$scope.area = {
				"id_area":area.id_area,
				"ds_area":area.ds_area,
				"cursos":area.cursos
			};
		}
	}

	$scope.limpaArea = function() {
		$scope.area.ds_area = "";
		$scope.area.cursos = "";
	}

	$scope.limpaProjeto = function() {
		$scope.projeto.titulo = "";
		$scope.projeto.ds_projeto = "";
		$scope.projeto.privacidade = false;
		$scope.projeto.s_privacidade = "Público";
		$scope.projeto.prazo = undefined;
		$scope.projeto.cursos = "";
		$scope.projeto.tema = "";
		$scope.projeto.id_area = 0;
		$scope.projeto.ds_area = "";
	}

	var novoProjeto = function() {
		setProjeto(undefined);
	}
	var novaArea = function() {
		setArea(undefined);
	}

	$scope.abrirConsultaProjeto = function() {
		window.location.href = "/projeto-consulta";
	}

	$scope.abrirConsultaArea = function() {
		window.location.href = "/area-consulta";
	}

	var retornaIndiceProjeto = function(id_projeto){
		var i;
		for (i=0;i<$scope.listaProjetos.length;i++){
			if ($scope.listaProjetos[i].id_projeto == id_projeto){
				return i; // retorna posição do projeto desejado
			}
		}
		return -1;
	}

	$scope.removeMeusProjetos = function(id){
		var excluir = confirm("Deseja remover?");
		if (excluir) {
			$http.delete('http://localhost:3000/removeMeusProjeto/' + id + '/' + 
				$rootScope.usuario.id_usuario).then(function (response){
					alertSucess("Projeto removido com sucesso!");
					window.location.href = "/meus-projetos";				
			});
		}
	}

});