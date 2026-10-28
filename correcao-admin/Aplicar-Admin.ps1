$ErrorActionPreference = "Stop"
$projeto = (Get-Location).Path
$origem = Join-Path $PSScriptRoot "arquivos"
if (!(Test-Path (Join-Path $projeto "backend\app")) -or !(Test-Path (Join-Path $projeto "frontend\src"))) {
    throw "Execute este comando dentro da pasta vive-ai-photobooth, onde estao backend e frontend."
}
if (!(Test-Path $origem)) { throw "Extraia o ZIP completo antes de executar." }
$servicos = & docker compose config --services
if ($LASTEXITCODE -ne 0) { throw "Nao foi possivel ler o Docker Compose do projeto." }
foreach ($servico in @("backend", "celery", "frontend")) {
    if ($servicos -notcontains $servico) { throw "Servico ausente no Compose: $servico" }
}
$backup = Join-Path $projeto ("backup-admin-" + (Get-Date -Format "yyyyMMdd-HHmmss-fff"))
$baseOrigem = $origem.TrimEnd([char[]]"\/") + [IO.Path]::DirectorySeparatorChar
$arquivos = @(Get-ChildItem -LiteralPath $origem -File -Recurse)
foreach ($arquivo in $arquivos) {
    $relativo = $arquivo.FullName.Substring($baseOrigem.Length)
    $destino = Join-Path $projeto $relativo
    if (Test-Path -LiteralPath $destino) {
        $copia = Join-Path $backup $relativo
        New-Item -ItemType Directory -Path (Split-Path $copia -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $destino -Destination $copia -Force
    }
}
foreach ($arquivo in $arquivos) {
    $relativo = $arquivo.FullName.Substring($baseOrigem.Length)
    $destino = Join-Path $projeto $relativo
    New-Item -ItemType Directory -Path (Split-Path $destino -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $arquivo.FullName -Destination $destino -Force
}
Write-Host "Arquivos aplicados. Backup do codigo: $backup"
Write-Host "Construindo e iniciando os servicos. Aguarde a conclusao."
& docker compose up -d --build backend celery frontend
if ($LASTEXITCODE -ne 0) {
    throw "O Docker nao concluiu o build. Os arquivos anteriores estao no backup informado acima."
}
Write-Host "Concluido. Acesse http://localhost:5173/admin/login e pressione Ctrl+F5."
Write-Host "Use o mesmo email e senha do admin ja configurados."
