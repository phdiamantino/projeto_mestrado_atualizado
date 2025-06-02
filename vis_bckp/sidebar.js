// sidebar.js - Corrigido para manter os valores oficiais fixos

const jUnitRepoId = "5a932d02b8a9f956ba503603";

// VALORES OFICIAIS E FIXOS
const REPO_FILE_COUNTS = {
    'jUnit': 161,
    'Apache': 1669
};

function loadSidebarData() {
    Promise.all([
        d3.json("data/rm_technical_debt.json")
    ]).then(([jsonData]) => {
        if (!jsonData || !Array.isArray(jsonData)) {
            throw new Error("Dados JSON não estão no formato esperado");
        }

        const jUnitData = jsonData.filter(d => d.repository === jUnitRepoId);
        const apacheData = jsonData.filter(d => d.repository !== jUnitRepoId);

        const organizedData = {
            'jUnit': jUnitData,
            'Apache': apacheData
        };

        setupSidebarControls(organizedData);

        // Armazena dados globais (opcional)
        window.sidebarData = organizedData;

    }).catch(error => {
        console.error("Erro ao carregar dados:", error);
        showError(error);
    });
}

function setupSidebarControls(data) {
    updateSidebarDisplay(data, 'jUnit');

    d3.select('#selectRep').on('change', function() {
        const selectedRepo = this.value;
        updateSidebarDisplay(data, selectedRepo);

        // 🔄 Notifica outros módulos (como o Sunburst) da mudança
        if (typeof window.onRepositoryChange === 'function') {
            window.onRepositoryChange(selectedRepo);
        }
    });
}

function updateSidebarDisplay(data, selectedRepo) {
    try {
        const tdData = data[selectedRepo];

        if (!tdData) {
            throw new Error(`Nenhum dado encontrado para ${selectedRepo}`);
        }

        const stats = calculateStatistics(tdData);

        // Usa os valores fixos definidos
        stats.files = REPO_FILE_COUNTS[selectedRepo];

        console.log("Repositório selecionado:", selectedRepo);
        console.log("Valor fixo de arquivos:", REPO_FILE_COUNTS[selectedRepo]);
        console.log(`Estatísticas para ${selectedRepo}:`, stats);

        updateCardsInfo(stats);
        document.getElementById('selectedRep').textContent = `Selected: ${selectedRepo}`;

    } catch (error) {
        console.error("Erro ao atualizar a sidebar:", error);
        showError(error);
    }
}

function calculateStatistics(tdData) {
    try {
        const versions = new Set(tdData.map(d => d.reference)).size;

        let totalDebts = 0;
        tdData.forEach(item => {
            if (item.debts && Array.isArray(item.debts)) {
                totalDebts += item.debts.length;
            }
        });

        return {
            versions,
            files: 0, // Sobrescrito com valor fixo
            totalDebts
        };
    } catch (error) {
        console.error("Erro ao calcular estatísticas:", error);
        return {
            versions: 0,
            files: 0,
            totalDebts: 0
        };
    }
}

function updateCardsInfo(stats) {
    d3.select("#card-versions .value").text(stats.versions);
    d3.select("#card-files .value").text(stats.files);
    d3.select("#card-total .value").text(stats.totalDebts);
}

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
    if (selectRep) selectRep.disabled = true;
}

document.addEventListener('DOMContentLoaded', function() {
    if (!window.sidebarInitialized) {
        window.sidebarInitialized = true;
        loadSidebarData();
    }
});
