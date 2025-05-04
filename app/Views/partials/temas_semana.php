<h4 class="text-center"><?= ucfirst($semana) ?></h4>
<?php if (!empty($temas)): ?>
    <ul>
        <?php foreach ($temas as $tema): ?>
            <li><a href="#" onclick="abrirLista('<?= $semana ?>', '<?= $orgao ?>')"><?= esc($tema['titulo']) ?></a></li>
        <?php endforeach; ?>
    </ul>
<?php else: ?>
    <p class="text-center">Nenhum tema discutido.</p>
<?php endif; ?>
<div class="d-grid">
    <button class="btn btn-outline-secondary btn-sm" onclick="abrirLista('<?= $semana ?>', '<?= $orgao ?>')">Ver Lista Completa</button>
</div>