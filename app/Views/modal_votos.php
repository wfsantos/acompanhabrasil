<?php if (!empty($votos)): ?>
    <ul class="list-group">
        <?php foreach ($votos as $voto): ?>
            <li class="list-group-item">
                <strong>Partido:</strong> <?= esc($voto['partido']) ?><br>
                <strong>Político:</strong> <?= esc($voto['politico']) ?><br>
                <strong>Voto:</strong> <?= esc($voto['voto']) ?>
            </li>
        <?php endforeach; ?>
    </ul>
<?php else: ?>
    <p class="text-center">Nenhum voto registrado para esta proposta.</p>
<?php endif; ?>