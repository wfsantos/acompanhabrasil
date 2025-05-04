<table class="table table-striped">
    <thead>
        <tr>
            <th>Título</th>
            <th>Urgência</th>
            <th>Votos Sim</th>
            <th>Votos Não</th>
            <th>Detalhes dos Votos</th>
        </tr>
    </thead>
    <tbody>
        <?php if (!empty($temas)): ?>
            <?php foreach ($temas as $tema): ?>
                <tr>
                    <td><?= esc($tema['titulo']) ?></td>
                    <td><?= $tema['urgencia'] ? 'Sim' : 'Não' ?></td>
                    <td><?= esc($tema['votos_sim']) ?></td>
                    <td><?= esc($tema['votos_nao']) ?></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="abrirModalVotos(<?= $tema['id'] ?>)">Ver Votos</button>
                    </td>
                </tr>
            <?php endforeach; ?>
        <?php else: ?>
            <tr><td colspan="5" class="text-center">Nenhum tema encontrado para esta semana.</td></tr>
        <?php endif; ?>
    </tbody>
</table>