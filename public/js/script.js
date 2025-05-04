$(document).ready(function() {
    const modalListaTemas = new bootstrap.Modal($('#modalListaTemas'));
    const modalVotos = new bootstrap.Modal($('#modalVotos'));

    window.abrirLista = function(semana, orgao) {
        $.ajax({
            url: `<?= base_url('home/listaTemas') ?>/${semana}/${orgao}`,
            type: 'GET',
            success: function(data) {
                $('#modalListaTemasLabel').text(`Semana de ${data.semana_label} (${orgao === 'camara' ? 'Câmara' : 'Senado'})`);
                $('#modalListaTemasBody').html(data);
                modalListaTemas.show();
            },
            error: function() {
                alert('Erro ao carregar a lista de temas.');
            }
        });
    };

    window.abrirModalVotos = function(temaId) {
        $.ajax({
            url: `<?= base_url('home/getVotos') ?>/${temaId}`,
            type: 'GET',
            success: function(data) {
                $('#modalVotosBody').html(data);
                modalVotos.show();
            },
            error: function() {
                alert('Erro ao carregar os votos.');
            }
        });
    };
});

function trocarOrgaoAjax(orgao) {
    $.ajax({
        url: `<?= base_url('home/trocarOrgaoAjax') ?>/${orgao}`,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data.success) {
                $('#temas-passada').html(data.temas_passada_html);
                $('#temas-atual').html(data.temas_atual_html);
                $('#temas-proxima').html(data.temas_proxima_html);
            } else {
                alert('Erro ao trocar o órgão.');
            }
        },
        error: function() {
            alert('Erro na requisição para trocar o órgão.');
        }
    });
}