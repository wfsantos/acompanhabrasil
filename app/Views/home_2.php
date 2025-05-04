<!doctype html>
<html lang="pt-br" data-bs-theme="auto">

<head>
    <?= csrf_meta() ?>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Sistema estilo jornal AcompanhaBrasil">
    <meta name="author" content="Seu Nome">
    <title>AcompanhaBrasil - Estilo Jornal</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Playfair+Display:700,900&display=swap" rel="stylesheet">
    <link href="css/jornal.css" rel="stylesheet">
    <style>
        .blog-header-logo {
            font-family: "Playfair Display", serif;
            font-size: 2.5rem;
        }
    </style>
</head>

<body>
    <div class="container jornal-container">
        <header class="blog-header py-3 mb-4 pt-0 mt-0border-bottom">
            <div class="row flex-nowrap justify-content-between align-items-center">
                <div class="col-md-12 text-center">
                    <a class="blog-header-logo text-body-emphasis text-decoration-none" href="#">Acompanha Brasil</a>
                </div>
            </div>
            <div class="p-4 p-5 pt-2 pb-2 mb-4 rounded text-body-emphasis bg-body-secondary">
                <div class="col-lg-12 px-0">
                    <p class="lead my-2">
                        Acompanha Brasil é uma iniciativa para aproximar a população brasileira das decisões políticas tomadas no Congresso Nacional. 
                    </p>
                    <p class="pt-0">
                        O projeto simplifica o acesso às informações sobre votações na Câmara dos Deputados e no Senado Federal, demonstrando quais as pautas estão em discussão, ou ainda aquelas já pautadas e respondendo de forma direta:
                    </p>
                    <p class="pt-0">
                        - Quem votou<br>
                        - Qual foi o voto (Sim, Não, Abstenção)<br>
                        - A qual partido o político está vinculado</p>
                    </p>
                </div>
            </div>

            <div class="row flex-nowrap justify-content-between align-items-center">
                <div class="col-md-12 text-center">
                    <div class="d-flex justify-content-center mt-2">
                        <button class="btn btn-outline-secondary me-2" onclick="trocarOrgaoAjax('camara')">Câmara</button>
                        <button class="btn btn-outline-secondary" onclick="trocarOrgaoAjax('senado')">Senado</button>
                    </div>
                </div>
            </div>
        </header>

        <div class="row mb-4">
            <div class="col-md-4">
                <section class="temas-semana" id="temas-passada">
                    <h4 class="text-center">Semana Passada</h4>
                    <?php if (!empty($temas_passada)): ?>
                        <ul>
                            <?php foreach ($temas_passada as $tema): ?>
                                <li><a href="#" onclick="abrirLista('passada', '<?= $orgao ?>')"><?= esc($tema['titulo']) ?></a></li>
                            <?php endforeach; ?>
                        </ul>
                    <?php else: ?>
                        <p class="text-center">Nenhum tema discutido.</p>
                    <?php endif; ?>
                    <div class="d-grid">
                        <button class="btn btn-outline-secondary btn-sm" onclick="abrirLista('passada', '<?= $orgao ?>')">Ver Lista Completa</button>
                    </div>
                </section>
            </div>
            <div class="col-md-4">
                <section class="temas-semana" id="temas-atual">
                    <h4 class="text-center">Semana Atual</h4>
                    <?php if (!empty($temas_atual)): ?>
                        <ul>
                            <?php foreach ($temas_atual as $tema): ?>
                                <li><a href="#" onclick="abrirLista('atual', '<?= $orgao ?>')"><?= esc($tema['titulo']) ?></a></li>
                            <?php endforeach; ?>
                        </ul>
                    <?php else: ?>
                        <p class="text-center">Nenhum tema discutido.</p>
                    <?php endif; ?>
                    <div class="d-grid">
                        <button class="btn btn-outline-secondary btn-sm" onclick="abrirLista('atual', '<?= $orgao ?>')">Ver Lista Completa</button>
                    </div>
                </section>
            </div>
            <div class="col-md-4">
                <section class="temas-semana" id="temas-proxima">
                    <h4 class="text-center">Próxima Semana</h4>
                    <?php if (!empty($temas_proxima)): ?>
                        <ul>
                            <?php foreach ($temas_proxima as $tema): ?>
                                <li><a href="#" onclick="abrirLista('proxima', '<?= $orgao ?>')"><?= esc($tema['titulo']) ?></a></li>
                            <?php endforeach; ?>
                        </ul>
                    <?php else: ?>
                        <p class="text-center">Nenhum tema discutido.</p>
                    <?php endif; ?>
                    <div class="d-grid">
                        <button class="btn btn-outline-secondary btn-sm" onclick="abrirLista('proxima', '<?= $orgao ?>')">Ver Lista Completa</button>
                    </div>
                </section>
            </div>
        </div>

        <footer class="jornal-footer py-3 text-center text-muted border-top">
            <p>&copy; 2025 AcompanhaBrasil - Todos os direitos reservados.</p>
        </footer>
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

</body>

</html>