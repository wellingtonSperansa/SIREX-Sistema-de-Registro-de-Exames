let allPacientes = [];
let searchTimeout = null; 

document.addEventListener('DOMContentLoaded', () => {
    const pacienteInput = document.getElementById('pacienteInput');
    const pacientesDatalist = document.getElementById('pacientesDatalist');
    const pacienteIdHidden = document.getElementById('pacienteIdHidden');

    const medicoSelect = document.getElementById('medico');
    const examesSelect = document.getElementById('exames');
    const dataRequisicaoInput = document.getElementById('dataRequisicao');
    
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); 
    const dia = String(hoje.getDate()).padStart(2, '0');
    
    dataRequisicaoInput.value = `${ano}-${mes}-${dia}`;

    function getDb() {
        if (window.indexedDB_db) {
            return Promise.resolve(window.indexedDB_db);
        } else {
            return new Promise((resolve, reject) => {
                const checkDbInterval = setInterval(() => {
                    if (window.indexedDB_db) {
                        clearInterval(checkDbInterval);
                        resolve(window.indexedDB_db);
                    }
                }, 50); 
                setTimeout(() => {
                    clearInterval(checkDbInterval);
                    reject(new Error('Timed out waiting for IndexedDB to be available.'));
                }, 5000); 
            });
        }
    }

    async function carregarOpcoesIndexedDB(element, storeName, placeholderText) {
        if (storeName === 'pacientes') {
            pacientesDatalist.innerHTML = '';
        } else {
            element.innerHTML = `<option value="">${placeholderText}</option>`; 
        }

        try {
            const dbInstance = await getDb(); 
            const transaction = dbInstance.transaction([storeName], 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll(); 

            request.onsuccess = function(event) {
                const data = event.target.result;
                
                if (storeName === 'pacientes') {
                    allPacientes = data; 
                    if (data && data.length > 0) {
                        data.forEach(item => {
                            const option = document.createElement('option');
                            option.value = `${item.nome} (CPF: ${item.cpf})`; 
                            option.dataset.id = item.id; 
                            pacientesDatalist.appendChild(option);
                        });
                    }
                } else {
                    if (data && data.length > 0) {
                        data.forEach(item => {
                            const option = document.createElement('option');
                            option.value = item.id;
                            option.textContent = item.nome || item.descricao || `ID: ${item.id}`; 
                            element.appendChild(option);
                        });
                    } else {
                        element.innerHTML = `<option value="">Nenhum ${storeName.slice(0, -1)} cadastrado</option>`; 
                        element.value = ""; 
                    }
                }
            };

            request.onerror = function(event) {
                console.error(`Erro ao ler dados da store '${storeName}':`, event.target.error);
                if (storeName === 'pacientes') {
                    pacienteInput.placeholder = `Erro ao carregar pacientes`;
                } else {
                    element.innerHTML = `<option value="">Erro ao carregar ${storeName}</option>`;
                }
            };

        } catch (error) {
            console.error(`Erro ao carregar ${storeName} do IndexedDB:`, error);
            if (storeName === 'pacientes') {
                pacienteInput.placeholder = `Erro ao carregar pacientes`;
            } else {
                element.innerHTML = `<option value="">Erro ao carregar dados</option>`;
            }
        }
    }

    pacienteInput.addEventListener('input', () => {
        const selectedText = pacienteInput.value;
        const foundPaciente = allPacientes.find(p => `${p.nome} (CPF: ${p.cpf})` === selectedText);
        
        if (foundPaciente) {
            pacienteIdHidden.value = foundPaciente.id;
        } else {
            pacienteIdHidden.value = '';
        }
    });

    carregarOpcoesIndexedDB(pacientesDatalist, 'pacientes', 'Carregando pacientes...');
    carregarOpcoesIndexedDB(medicoSelect, 'medicos', 'Carregando médicos...');
    carregarOpcoesIndexedDB(examesSelect, 'exames', 'Carregando exames...');

    
    const form = document.querySelector('.form-cadastro-requisicao');
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const dataRequisicao = dataRequisicaoInput.value; 
        const pacienteId = parseInt(pacienteIdHidden.value); 
        
        const medicoId = parseInt(medicoSelect.value);     

        const examesSelecionadosIds = Array.from(examesSelect.selectedOptions).map(option => parseInt(option.value));
        
        const observacoes = document.getElementById('observacoes').value;

        if (!dataRequisicao || isNaN(pacienteId) || isNaN(medicoId) || examesSelecionadosIds.length === 0) {
            alert('Por favor, preencha todos os campos obrigatórios: Data, Paciente, Médico e Exames.');
            return; 
        }

        const novaRequisicao = {
            dataRequisicao: dataRequisicao,
            idPaciente: pacienteId,
            idMedico: medicoId, 
            idExames: examesSelecionadosIds, 
            observacoes: observacoes
        };

        try {
            const dbInstance = await getDb(); 

            const transaction = dbInstance.transaction(['requisicoes'], 'readwrite');
            const requisicoesStore = transaction.objectStore('requisicoes');

            const addRequest = requisicoesStore.add(novaRequisicao);

            addRequest.onsuccess = function() {
                console.log('Requisição cadastrada com sucesso!', novaRequisicao);
                alert('Requisição cadastrada com sucesso!');
                form.reset(); 
                
                const hojeAposReset = new Date();
                const anoAposReset = hojeAposReset.getFullYear();
                const mesAposReset = String(hojeAposReset.getMonth() + 1).padStart(2, '0');
                const diaAposReset = String(hojeAposReset.getDate()).padStart(2, '0');
                dataRequisicaoInput.value = `${anoAposReset}-${mesAposReset}-${diaAposReset}`;
                
                pacienteInput.value = '';
                pacienteIdHidden.value = '';
            };

            addRequest.onerror = function(event) {
                console.error('Erro ao cadastrar requisição:', event.target.error);
                alert('Erro ao cadastrar requisição. Verifique o console do navegador para mais detalhes.');
            };

        } catch (error) {
            console.error('Erro ao acessar o banco de dados para cadastrar a requisição:', error);
            alert('Erro interno ao cadastrar a requisição. Verifique o console.');
        }
    });
});