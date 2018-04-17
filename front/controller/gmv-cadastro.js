var app = angular.module('CadastroApp', []);

app.controller('CadastroController', function($scope, $http){

	var isVazio = function(value) {
		return angular.isUndefined(value) || value == '';
	}
	
	var alertWarning = function(string) {
		$.bootstrapGrowl(string, {
			type: 'warning',
			align: 'center',
			width: 260,
		});
	}

	var alertDanger = function(string) {
		$.bootstrapGrowl(string, {
			type: 'danger',
			align: 'center',
			width: 260,
		});
	}

	// ALUNO ---------------------------------------------------------------------

	// chama API para consulta no banco de dados e atualiza tabela na camada view	
	$scope.cadastraAluno = function() {
		var aluno = $scope.aluno;
		if (aluno == null || isVazio(aluno.nome_completo) || isVazio(aluno.email) || isVazio(aluno.senha) ||
				isVazio(aluno.universidade) || isVazio(aluno.cod_matricula)) {
			alertWarning("Preencha todos os campos!");
		} else {
			$http.post('http://localhost:3000/verificaEmail', aluno)
				.then(function (response){
					// response.data contém resultado do select			
					if (response.data > 0)
						alertDanger("Email já cadastrado!");
					else
						insereAluno();
			});
		}
	};

	// chama API - insere ou atualiza no banco de dados e atualiza tabela
	var insereAluno = function() {
		//Insere
		$http.post('http://localhost:3000/insereAluno', $scope.aluno)
			.then(function (response){
					window.location.href = '/login';
			});
	}



	// EMPRESA ---------------------------------------------------------------------

	// chama API para consulta no banco de dados e atualiza tabela na camada view	
	$scope.cadastraEmpresa = function() {
		var empresa = $scope.empresa;
		if (empresa == null || isVazio(empresa.nome_usuario) || isVazio(empresa.email) || isVazio(empresa.senha) ||
				isVazio(empresa.nome_empresa) || isVazio(empresa.cnpj)) {
			alertWarning("Preencha todos os campos!");
		}
		else {
			$http.post('http://localhost:3000/verificaEmail', $scope.empresa)
				.then(function (response){				
					// response.data contém resultado do select								
					if (response.data > 0) {
						alertDanger("Email já cadastrado!");
					} else {
						insereEmpresa();
					}
			});
		}
	};

	// chama API - insere ou atualiza no banco de dados e atualiza tabela
	var insereEmpresa = function() {
		//Insere
		$http.post('http://localhost:3000/insereEmpresa', $scope.empresa)
		.then(function (response){
				window.location.href = '/login';
		});
	}

});