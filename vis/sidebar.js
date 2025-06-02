// sidebar.js - Versão Simplificada (somente cards)

// ID real do repositório jUnit no seu dataset
const jUnitRepoId = "5a932d02b8a9f956ba503603";

// Função principal de carregamento
function loadSidebarData() {
    d3.json("data/rm_technical_debt.json").then(function(data) {
        console.log("Dados carregados com sucesso", data);

        if (!data || !Array.isArray(data)) {
            throw new Error("Dados não estão no formato esperado");
        }

        // Filtragem com base no ID do repositório
        const jUnitData = data.filter(d => d.repository === jUnitRepoId);
        const apacheData = data.filter(d => d.repository !== jUnitRepoId);

        const organizedData = {
            'jUnit': jUnitData,
            'Apache': apacheData
        };

        setupSidebarControls(organizedData);

    }).catch(function(error) {
        console.error("Erro ao carregar dados:", error);
        showError(error);
    });
}

// Configura os controles da sidebar
function setupSidebarControls(data) {
    updateSidebarDisplay(data, 'jUnit');

    d3.select('#selectRep').on('change', function() {
        const selectedRepo = this.value;
        updateSidebarDisplay(data, selectedRepo);
    });
}

// Atualiza a exibição na sidebar
function updateSidebarDisplay(data, selectedRepo) {
    try {
        const filteredData = data[selectedRepo];

        if (!filteredData || filteredData.length === 0) {
            throw new Error(`Nenhum dado encontrado para ${selectedRepo}`);
        }

        const stats = calculateStatistics(filteredData);
        updateCardsInfo(stats);
        document.getElementById('selectedRep').textContent = `Selected: ${selectedRepo}`;

    } catch (error) {
        console.error("Erro ao atualizar sidebar:", error);
        showError(error);
    }
}

// Calcula estatísticas dos dados
function calculateStatistics(data) {
    const versions = [...new Set(data.map(d => d.reference))].length;
    const files = data.length;

    const debtCounts = {};
    data.forEach(item => {
        item.debts.forEach(debt => {
            const debtType = debt.name;
            debtCounts[debtType] = (debtCounts[debtType] || 0) + 1;
        });
    });

    const totalDebts = Object.values(debtCounts).reduce((sum, count) => sum + count, 0);

    return {
        versions,
        files,
        totalDebts
    };
}

// Atualiza os cards com as informações
function updateCardsInfo(stats) {
    // Versions
    d3.select("#card-versions .value")
        .text(stats.versions);

    // Files with Debts
    d3.select("#card-files .value")
        .text(stats.files);

    // Total Debts
    d3.select("#card-total .value")
        .text(stats.totalDebts);
}

// Mostra erros na UI
function showError(error) {
    const sidebarInfo = document.getElementById('sidebar-info');
    if (sidebarInfo) {
        sidebarInfo.innerHTML = `
            <div class="alert alert-danger mt-3">
                <h5><i class="fas fa-exclamation-triangle me-2"></i>Erro ao Carregar Dados</h5>
                <p>${error.message}</p>
                <p>Verifique o console para detalhes.</p>
            </div>
        `;
    }

    const selectRep = document.getElementById('selectRep');
    if (selectRep) {
        selectRep.disabled = true;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (!window.sidebarInitialized) {
        window.sidebarInitialized = true;
        loadSidebarData();
    }
});