let db;

const request = indexedDB.open('SistemaExames', 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;

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

    // Criar store de Exames
    if (!db.objectStoreNames.contains('exames')) {
        let exames = db.createObjectStore('exames', { keyPath: 'id', autoIncrement: true });
    }

    // Criar store de Requisições
    if (!db.objectStoreNames.contains('requisicoes')) {
        let requisicoes = db.createObjectStore('requisicoes', { keyPath: 'id', autoIncrement: true });
        requisicoes.createIndex('idPaciente', 'idPaciente', { unique: false });
        requisicoes.createIndex('idMedico', 'idMedico', { unique: false });
        requisicoes.createIndex('idExame', 'idExame', { unique: false });
    }

    console.log('Banco e stores criados com sucesso.');
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log('Banco de dados pronto para uso.');
};

request.onerror = function (event) {
    console.error('Erro ao abrir o IndexedDB:', event.target.error);
};