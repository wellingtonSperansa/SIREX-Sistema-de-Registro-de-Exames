let db;

const request = indexedDB.open('SistemaExames', 4); 

request.onupgradeneeded = function (event) {
    db = event.target.result;
    window.indexedDB_db = db; 

    // Criar store de Médicos
    if (!db.objectStoreNames.contains('medicos')) {
        let medicos = db.createObjectStore('medicos', { keyPath: 'id', autoIncrement: true });
        medicos.createIndex('cpf', 'cpf', { unique: true });
        medicos.createIndex('crm', 'crm', { unique: true });
    }

    // Criar store de Pacientes
    if (!db.objectStoreNames.contains('pacientes')) {
        let pacientes = db.createObjectStore('pacientes', { keyPath: 'id', autoIncrement: true });
        pacientes.createIndex('cpf', 'cpf', { unique: true });
    }

    // Criar store de exames
    if (db.objectStoreNames.contains('exames')) {
        db.deleteObjectStore('exames');
        console.log('Store "exames" existente removida para atualização.');
    }
    // Criar a store de Exames com um índice único para o nome
    let exames = db.createObjectStore('exames', { keyPath: 'id', autoIncrement: true });
    exames.createIndex('nome', 'nome', { unique: true }); 
    console.log('Store "exames" criada/atualizada com índice "nome" único.');

    // Criar store de Requisições
    if (!db.objectStoreNames.contains('requisicoes')) {
        let requisicoes = db.createObjectStore('requisicoes', { keyPath: 'id', autoIncrement: true });
        requisicoes.createIndex('idPaciente', 'idPaciente', { unique: false });
        requisicoes.createIndex('idMedico', 'idMedico', { unique: false });
        requisicoes.createIndex('idExame', 'idExame', { unique: false });
    }

    console.log('Banco de dados e stores criados/atualizados com sucesso.');
    if (typeof window.activateCadExamesForm === 'function') {
        window.activateCadExamesForm();
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    window.indexedDB_db = db; 
    console.log('Banco de dados pronto para uso.');
    if (typeof window.activateCadExamesForm === 'function') {
        window.activateCadExamesForm();
    }
};

request.onerror = function (event) {
    console.error('Erro ao abrir o IndexedDB:', event.target.error);
};