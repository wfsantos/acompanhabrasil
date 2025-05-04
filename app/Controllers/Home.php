<?php

namespace App\Controllers;

use App\Models\TemaModel;
use App\Models\VotoModel;

class Home extends BaseController
{
    public function index()
    {
        $temaModel = new TemaModel();
        $data['temas_passada'] = $temaModel->getTemasPorSemana('passada', 'senado'); // Inicialmente Senado
        $data['temas_atual'] = $temaModel->getTemasPorSemana('atual', 'senado');
        $data['temas_proxima'] = $temaModel->getTemasPorSemana('proxima', 'senado');
        $data['orgao'] = 'senado'; // Variável para manter o órgão selecionado
        return view('home_2', $data);
    }

    public function trocarOrgao($orgao)
    {
        $temaModel = new TemaModel();
        $data['temas_passada'] = $temaModel->getTemasPorSemana('passada', $orgao);
        $data['temas_atual'] = $temaModel->getTemasPorSemana('atual', $orgao);
        $data['temas_proxima'] = $temaModel->getTemasPorSemana('proxima', $orgao);
        $data['orgao'] = $orgao;
        return view('home', $data);
    }

    public function listaTemas($semana, $orgao)
    {
        $temaModel = new TemaModel();
        $data['temas'] = $temaModel->getTemasPorSemana($semana, $orgao);
        $data['semana_label'] = $this->getSemanaLabel($semana);
        $data['orgao'] = $orgao;
        return view('lista_temas', $data);
    }

    /*protected function getSemanaLabel($semana)
    {
        // Lógica para obter o período da semana (ex: "28/04/2025 até 04/05/2025")
        // Você precisará implementar esta lógica com base em suas necessidades
        $hoje = new \DateTime();
        if ($semana === 'passada') {
            $inicio = $hoje->modify('-1 week')->format('d/m/Y');
            $fim = $hoje->modify('+6 days')->format('d/m/Y');
            return $inicio . ' até ' . $fim;
        } elseif ($semana === 'atual') {
            $inicio = $hoje->modify('this week')->format('d/m/Y');
            $fim = $hoje->modify('+6 days')->format('d/m/Y');
            return $inicio . ' até ' . $fim;
        } elseif ($semana === 'proxima') {
            $inicio = $hoje->modify('+1 week')->format('d/m/Y');
            $fim = $hoje->modify('+6 days')->format('d/m/Y');
            return $inicio . ' até ' . $fim;
        }
        return '';
    }*/

    protected function getSemanaLabel($semana)
    {
        $hoje = new \DateTimeImmutable();
        $numeroDiaSemana = intval($hoje->format('w')); // 0 (domingo) a 6 (sábado)

        if ($semana === 'passada') {
            $inicioDaSemanaPassada = $hoje->modify('-' . ($numeroDiaSemana + 7) . ' days')->modify('monday this week')->format('d/m/Y');
            $fimDaSemanaPassada = $hoje->modify('-' . ($numeroDiaSemana + 1) . ' days')->modify('sunday this week')->format('d/m/Y');
            return $inicioDaSemanaPassada . ' até ' . $fimDaSemanaPassada;
        } elseif ($semana === 'atual') {
            $inicioDaSemanaAtual = $hoje->modify('monday this week')->format('d/m/Y');
            $fimDaSemanaAtual = $hoje->modify('sunday this week')->format('d/m/Y');
            return $inicioDaSemanaAtual . ' até ' . $fimDaSemanaAtual;
        } elseif ($semana === 'proxima') {
            $inicioDaProximaSemana = $hoje->modify('monday next week')->format('d/m/Y');
            $fimDaProximaSemana = $hoje->modify('sunday next week')->format('d/m/Y');
            return $inicioDaProximaSemana . ' até ' . $fimDaProximaSemana;
        }
        return '';
    }

    public function getVotos($temaId)
    {
        $votoModel = new VotoModel();
        $data['votos'] = $votoModel->getVotosPorTema($temaId);
        return view('modal_votos', $data);
    }

    public function trocarOrgaoAjax($orgao)
    {
        $temaModel = new TemaModel();
        $data['temas_passada'] = $temaModel->getTemasPorSemana('passada', $orgao);
        $data['temas_atual'] = $temaModel->getTemasPorSemana('atual', $orgao);
        $data['temas_proxima'] = $temaModel->getTemasPorSemana('proxima', $orgao);
        $data['orgao'] = $orgao;

        $response = [
            'success' => true,
            'temas_passada_html' => view('partials/temas_semana', ['semana' => 'passada', 'temas' => $data['temas_passada'], 'orgao' => $orgao]),
            'temas_atual_html' => view('partials/temas_semana', ['semana' => 'atual', 'temas' => $data['temas_atual'], 'orgao' => $orgao]),
            'temas_proxima_html' => view('partials/temas_semana', ['semana' => 'proxima', 'temas' => $data['temas_proxima'], 'orgao' => $orgao]),
        ];

        return $this->response->setJSON($response);
    }
}
