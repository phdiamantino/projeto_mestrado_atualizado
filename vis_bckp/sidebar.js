const REPO_FILE_COUNTS = {
    'jUnit': 161,
    'Apache': 1669
};

function loadSidebarData() {
    d3.json("data/rm_technical_debt.json")
        .then(jsonData => {
            if (!jsonData || !Array.isArray(jsonData)) {
                throw new Error("Dados JSON não estão no formato esperado");
            }

            // ✅ Nova lógica: separa os repositórios com base nos campos de 'repository'
            const repositories = Array.from(new Set(jsonData.map(d => d.repository)));

            if (repositories.length < 2) {
                throw new Error("Esperado pelo menos dois repositórios no JSON");
            }

            const repoNames = ['jUnit', 'Apache'];

            const organizedData = {};

            repositories.forEach((repoId, index) => {
                const repoName = repoNames[index] || `Repo${index + 1}`;
                organizedData[repoName] = jsonData.filter(d => d.repository === repoId);
            });

            setupSidebarControls(organizedData);

            // Armazena dados globais (opcional)
            window.sidebarData = organizedData;
        })
        .catch(error => {
            console.error("Erro ao carregar dados:", error);
            showError(error);
        });
}

function setupSidebarControls(data) {
    updateSidebarDisplay(data, 'jUnit');

    d3.select('#selectRep').on('change', function() {
        const selectedRepo = this.value;
        updateSidebarDisplay(data, selectedRepo);

        // Notifica outras visualizações (Sunburst, etc.)
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

        // ✅ Aplica o valor fixo de arquivos
        stats.files = REPO_FILE_COUNTS[selectedRepo] ?? 0;

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
            files: 0, // Sempre sobrescrito depois
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
    d3.select("#card-versions .value").text(stats.versions ?? "0");
    d3.select("#card-files .value").text(stats.files ?? "0");
    d3.select("#card-total .value").text(stats.totalDebts ?? "0");
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