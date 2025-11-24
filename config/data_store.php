<?php

function data_path($file)
{
    return __DIR__ . '/../data/' . $file;
}

function load_json($file)
{
    $path = data_path($file);
    if (!file_exists($path)) {
        return [];
    }
    $content = file_get_contents($path);
    return json_decode($content, true) ?: [];
}

function save_json($file, $data)
{
    $path = data_path($file);
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
