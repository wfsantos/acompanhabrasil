<?php

use App\Controllers\Home;

$routes->get('/', [Home::class, 'index']);
$routes->get('home', [Home::class, 'index']);
$routes->get('home/trocarOrgao/(:segment)', [Home::class, 'trocarOrgao/$1']);
$routes->get('home/listaTemas/(:segment)/(:segment)', [Home::class, 'listaTemas/$1/$2']);
$routes->get('home/getVotos/(:num)', [Home::class, 'getVotos/$1']);
$routes->get('home/trocarOrgaoAjax/(:segment)', [Home::class, 'trocarOrgaoAjax/$1']);