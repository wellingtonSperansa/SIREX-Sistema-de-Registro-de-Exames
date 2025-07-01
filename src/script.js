let db;

const request = indexedDB.open('SistemaExames', 4); 

request.onupgradeneeded = function (event) {
    db = event.target.result;
    window.indexedDB_db = db; 

    if (!db.objectStoreNames.contains('medicos')) {
        let medicos = db.createObjectStore('medicos', { keyPath: 'id', autoIncrement: true });
        medicos.createIndex('cpf', 'cpf', { unique: true });
        medicos.createIndex('crm', 'crm', { unique: true });
    }

    if (!db.objectStoreNames.contains('pacientes')) {
        let pacientes = db.createObjectStore('pacientes', { keyPath: 'id', autoIncrement: true });
        pacientes.createIndex('cpf', 'cpf', { unique: true });
    }

    if (db.objectStoreNames.contains('exames')) {
        db.deleteObjectStore('exames');
    }
    let exames = db.createObjectStore('exames', { keyPath: 'id', autoIncrement: true });
    exames.createIndex('nome', 'nome', { unique: true }); 

    if (!db.objectStoreNames.contains('requisicoes')) {
        let requisicoes = db.createObjectStore('requisicoes', { keyPath: 'id', autoIncrement: true });
        requisicoes.createIndex('idPaciente', 'idPaciente', { unique: false });
        requisicoes.createIndex('idMedico', 'idMedico', { unique: false });
        requisicoes.createIndex('idExame', 'idExame', { unique: false });
    }

    console.log('Estrutura do banco criada/atualizada.');

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
    console.error('Erro ao abrir o banco:', event.target.error);
};