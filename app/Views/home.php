<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AcompanhaBrasil</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="<?= base_url('css/style.css') ?>">
</head>
<body>
    <div class="container mt-4">
        <h1 class="text-center mb-4">AcompanhaBrasil</h1>
        <div class="d-flex justify-content-center mb-3">
            <button class="btn btn-primary me-2" onclick="window.location='<?= base_url('home/trocarOrgao/camara') ?>'">Câmara</button>
            <button class="btn btn-info" onclick="window.location='<?= base_url('home/trocarOrgao/senado') ?>'">Senado</button>
        </div>
        <div class="row">
            <div class="col-md-4">
                <h4 class="text-center">Semana Passada (Senado)</h4>
                <?php if (!empty($temas_passada)): ?>
                    <ul>
                        <?php foreach ($temas_passada as $tema): ?>
                            <li><?= esc($tema['titulo']) ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php else: ?>
                    <p class="text-center">Nenhum tema discutido.</p>
                <?php endif; ?>
                <div class="d-grid">
                    <button class="btn btn-outline-secondary btn-sm" onclick="abrirLista('passada', '<?= $orgao ?>')">Ver Lista Completa</button>
                </div>
            </div>
            <div class="col-md-4">
                <h4 class="text-center">Semana Atual (Senado)</h4>
                <?php if (!empty($temas_atual)): ?>
                    <ul>
                        <?php foreach ($temas_atual as $tema): ?>
                            <li><?= esc($tema['titulo']) ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php else: ?>
                    <p class="text-center">Nenhum tema discutido.</p>
                <?php endif; ?>
                <div class="d-grid">
                    <button class="btn btn-outline-secondary btn-sm" onclick="abrirLista('atual', '<?= $orgao ?>')">Ver Lista Completa</button>
                </div>
            </div>
            <div class="col-md-4">
                <h4 class="text-center">Próxima Semana (Senado)</h4>
                <?php if (!empty($temas_proxima)): ?>
                    <ul>
                        <?php foreach ($temas_proxima as $tema): ?>
                            <li><?= esc($tema['titulo']) ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php else: ?>
                    <p class="text-center">Nenhum tema discutido.</p>
                <?php endif; ?>
                <div class="d-grid">
                    <button class="btn btn-outline-secondary btn-sm" onclick="abrirLista('proxima', '<?= $orgao ?>')">Ver Lista Completa</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalListaTemas" tabindex="-1" aria-labelledby="modalListaTemasLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalListaTemasLabel"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="modalListaTemasBody">
                    </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modalVotos" tabindex="-1" aria-labelledby="modalVotosLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalVotosLabel">Votos da Proposta</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="modalVotosBody">
                    </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="<?= base_url('js/script.js') ?>"></script>
</body>
</html>